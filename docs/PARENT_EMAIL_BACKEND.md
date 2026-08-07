# Parent Notification Email Backend Implementation

## Overview

The email backend for parent notifications consists of:
- **Email Service**: Sends three types of emails (digest, celebration, alert) via Resend
- **API Endpoints**: Three endpoints handle different notification triggers
- **Database Tracking**: Records all sent notifications for auditing and rate limiting
- **Cron Jobs**: Scheduled tasks trigger digest and alert emails

## Environment Setup

### 1. Resend API Key

Get a free account at [resend.com](https://resend.com) and add to `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=notifications@viridian.edu
CRON_SECRET_KEY=your-secret-key-here
```

The `CRON_SECRET_KEY` protects the scheduled email endpoints from unauthorized access.

### 2. Database Setup

Run the migration to create notification tracking tables:

```bash
npx prisma migrate deploy
```

This creates:
- `SentNotification` table: Records all sent emails for auditing
- Adds relations to `ParentChild` and `ParentNotificationPreference` models

## Email Service (`lib/email/service.ts`)

Three functions handle email sending:

### `sendDigestEmail(data: DigestEmailData)`
- **When**: Weekly digest (scheduled)
- **Content**: Weekly progress summary with standard breakdowns, achievements, and areas needing support
- **HTML**: Professional template with progress bars, achievement cards, and tips

### `sendCelebrationEmail(data: CelebrationEmailData)`
- **When**: Immediately when objective is mastered
- **Content**: Achievement announcement with encouragement
- **HTML**: Celebratory design with star emoji, achievement card

### `sendAlertEmail(data: AlertEmailData)`
- **When**: Periodically when student falls below threshold
- **Content**: List of objectives needing support with actionable tips
- **HTML**: Warning design highlighting support areas

All functions:
- Return `{ success: true }` if RESEND_API_KEY is not set (for development)
- Handle errors gracefully and return error messages
- Use HTML templates with responsive design

## API Endpoints

### 1. POST `/api/parents/notifications/send-digests`

**Purpose**: Send weekly digest emails to all eligible parents

**Authorization**: Requires `Authorization: Bearer {CRON_SECRET_KEY}` header

**Query Logic**:
- Finds all notification preferences with `enableWeeklyDigest: true`
- Matches based on `digestDay` (0-6) and `digestHour` (0-23)
- Skips if child has no active class enrollment
- Collects digest data for the week

**Response**:
```json
{
  "success": true,
  "summary": {
    "total": 5,
    "sent": 4,
    "failed": 1
  },
  "results": [
    {
      "parentId": "...",
      "childId": "...",
      "status": "sent",
      "email": "parent@example.com"
    }
  ]
}
```

### 2. POST `/api/parents/notifications/send-celebration`

**Purpose**: Send celebration email immediately after mastery

**Authorization**: None required (can be called from objective completion handler)

**Request Body**:
```json
{
  "childId": "user-id",
  "objectiveId": "objective-id"
}
```

**Query Logic**:
- Finds all parent-child relationships for the student
- Checks if celebrations are enabled
- Sends to all linked parents
- Respects parent preferences

**Response**:
```json
{
  "success": true,
  "summary": {
    "total": 2,
    "sent": 2
  },
  "results": [...]
}
```

### 3. POST `/api/parents/notifications/send-alerts`

**Purpose**: Send support alerts periodically to parents

**Authorization**: Requires `Authorization: Bearer {CRON_SECRET_KEY}` header

**Query Logic**:
- Finds all notification preferences with `enableAlerts: true`
- Checks if alert was sent recently (respects `minDaysBetweenAlerts`)
- Identifies objectives below `alertThreshold` (default 60%)
- Only sends if there are objectives needing support

**Response**: Same format as digest endpoint

## Setting Up Cron Jobs

### Option 1: Vercel Cron (Recommended for Vercel deployments)

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/parents/notifications/send-digests",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/parents/notifications/send-alerts",
      "schedule": "0 9 * * *"
    }
  ]
}
```

The `path` must be fully qualified when deployed. The schedule uses cron syntax:
- `0 * * * *`: Every hour at minute 0
- `0 9 * * *`: Daily at 9 AM UTC

### Option 2: External Cron Service (Upstash, etc.)

Use a service like [Upstash](https://upstash.com) to call your endpoints:

```bash
# Call digest endpoint every hour
curl -X POST https://your-app.vercel.app/api/parents/notifications/send-digests \
  -H "Authorization: Bearer $CRON_SECRET_KEY"

# Call alerts endpoint daily at 9 AM
curl -X POST https://your-app.vercel.app/api/parents/notifications/send-alerts \
  -H "Authorization: Bearer $CRON_SECRET_KEY"
```

### Option 3: Node Cron (For self-hosted)

Install and use node-cron in a background worker:

```typescript
import cron from 'node-cron';

// Every hour
cron.schedule('0 * * * *', async () => {
  await fetch('/api/parents/notifications/send-digests', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CRON_SECRET_KEY}`,
    },
  });
});

// Daily at 9 AM
cron.schedule('0 9 * * *', async () => {
  await fetch('/api/parents/notifications/send-alerts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CRON_SECRET_KEY}`,
    },
  });
});
```

## Integrating Celebration Emails

When a student completes an objective, call the celebration endpoint:

```typescript
// In your objective completion handler
await fetch('/api/parents/notifications/send-celebration', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    childId: studentId,
    objectiveId: objectiveId,
  }),
});
```

This can be called from:
- Assessment scoring endpoint
- Skill completion handler
- Any place where objectives transition to "completed"

## Database Schema

### ParentChild (existing)
```typescript
model ParentChild {
  id            String   @id
  parentId      String
  childId       String
  createdAt     DateTime
  
  notificationPreferences ParentNotificationPreference?
}
```

### ParentNotificationPreference (existing)
```typescript
model ParentNotificationPreference {
  id                      String   @id
  parentChildId           String   @unique
  
  enableWeeklyDigest      Boolean  @default(true)
  enableCelebrations      Boolean  @default(true)
  enableAlerts            Boolean  @default(true)
  
  digestFrequency         String   @default("weekly")
  digestDay               Int      @default(0)      // 0-6, Sunday-Saturday
  digestHour              Int      @default(18)     // 0-23
  digestMinute            Int      @default(0)      // 0-59
  
  alertThreshold          Int      @default(60)     // 0-100 (%)
  minDaysBetweenAlerts    Int      @default(7)      // 1, 3, 7, or 14
}
```

### SentNotification (new)
```typescript
model SentNotification {
  id                      String   @id
  parentChildId           String
  type                    String   // "digest" | "celebration" | "alert"
  subject                 String
  sentAt                  DateTime
  status                  String   // "sent" | "failed" | "bounced"
  errorMessage            String?
}
```

## Email Data Structures

### DigestEmailData
```typescript
{
  parentEmail: string;
  parentName: string;
  childName: string;
  className: string;
  weekStartDate: string;
  weekEndDate: string;
  summary: {
    totalSubmissions: number;
    masteredObjectives: Array<{ standard: string; objective: string }>;
    newObjectivesStarted: Array<{ standard: string; objective: string }>;
    objectivesNeedingSupport: Array<{ 
      standard: string; 
      objective: string; 
      currentMastery: number 
    }>;
  };
  progressByStandard: Array<{
    standard: string;
    previousMastery: number;
    currentMastery: number;
    change: number;
    status: "improved" | "stable" | "declined";
  }>;
}
```

### CelebrationEmailData
```typescript
{
  parentEmail: string;
  parentName: string;
  childName: string;
  objective: string;
  standard: string;
  className: string;
  masteredDate: string;
}
```

### AlertEmailData
```typescript
{
  parentEmail: string;
  parentName: string;
  childName: string;
  className: string;
  threshold: number;
  objectivesNeedingSupport: Array<{
    standard: string;
    objective: string;
    currentMastery: number;
  }>;
}
```

## Testing

### Manual Testing

1. **Test digest email**:
```bash
curl -X POST http://localhost:3000/api/parents/notifications/send-digests \
  -H "Authorization: Bearer your-secret-key"
```

2. **Test celebration email**:
```bash
curl -X POST http://localhost:3000/api/parents/notifications/send-celebration \
  -H "Content-Type: application/json" \
  -d '{
    "childId": "user-id",
    "objectiveId": "objective-id"
  }'
```

3. **Test alert email**:
```bash
curl -X POST http://localhost:3000/api/parents/notifications/send-alerts \
  -H "Authorization: Bearer your-secret-key"
```

### Development Mode

Without `RESEND_API_KEY`, emails return success without sending. This is useful for:
- Testing API logic locally
- Avoiding email sends during development
- Validating endpoint responses

To see actual emails in development:
1. Get a Resend API key
2. Add to `.env.local`
3. Emails will be sent to console logs (check Resend dashboard)

### Email Preview

Use Resend's dashboard to:
- View sent emails
- Check delivery status
- Debug template rendering
- Monitor bounce rates

## Monitoring & Debugging

### Check Email Status

Query the database:

```typescript
// Get recent sent notifications
const recent = await prisma.sentNotification.findMany({
  where: {
    sentAt: { gte: new Date(Date.now() - 24*60*60*1000) }
  },
  orderBy: { sentAt: 'desc' },
  take: 100,
});

// Get failed emails
const failed = await prisma.sentNotification.findMany({
  where: { status: 'failed' },
});
```

### Common Issues

**Issue**: Emails not sending (but no error)
- Check RESEND_API_KEY is set in production environment
- Verify `RESEND_FROM_EMAIL` matches a verified sender in Resend

**Issue**: Rate limiting
- Resend has soft limits; stagger cron job execution
- Use `minDaysBetweenAlerts` to prevent alert spam

**Issue**: Wrong digest data
- Check that child has active K12 class enrollment
- Verify StudentObjectiveProgress records exist
- Ensure StudentStandardProgress is being updated

## Future Enhancements

1. **Email Templates in DB**: Allow admins to customize email templates
2. **A/B Testing**: Test different subject lines or layouts
3. **Rich Text Editor**: Let parents compose custom learning tips
4. **Two-Way Email**: Enable parents to reply to emails
5. **SMS Alerts**: Short text message for urgent alerts
6. **In-App Notifications**: Duplicate important emails as in-app messages

## Related Documentation

- [Parent Dashboard Implementation](./PARENT_DASHBOARD_MVP_IMPLEMENTATION.md)
- [Parent Features Architecture](./PARENT_FEATURES_IMPLEMENTATION.md)
- [Parent Notifications Frontend](./PARENT_NOTIFICATIONS_IMPLEMENTATION.md)
