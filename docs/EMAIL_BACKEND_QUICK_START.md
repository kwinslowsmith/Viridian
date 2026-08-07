# Email Backend Quick Start

## 5-Minute Setup

### 1. Get Resend API Key

- Go to [resend.com](https://resend.com), sign up (free tier available)
- Navigate to API Keys
- Copy your API key

### 2. Update Environment Variables

Add to `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=notifications@viridian.edu
CRON_SECRET_KEY=super-secret-key-12345
```

### 3. Run Database Migration

```bash
npx prisma migrate deploy
```

This creates the `SentNotification` table for tracking sent emails.

### 4. Test Endpoints

All three endpoints work immediately:

**Digest Emails** (call hourly via cron):
```bash
curl -X POST http://localhost:3000/api/parents/notifications/send-digests \
  -H "Authorization: Bearer super-secret-key-12345"
```

**Celebration Emails** (call when objective mastered):
```bash
curl -X POST http://localhost:3000/api/parents/notifications/send-celebration \
  -H "Content-Type: application/json" \
  -d '{"childId":"abc123","objectiveId":"def456"}'
```

**Alert Emails** (call daily via cron):
```bash
curl -X POST http://localhost:3000/api/parents/notifications/send-alerts \
  -H "Authorization: Bearer super-secret-key-12345"
```

### 5. Set Up Cron (Choose One)

**Option A: Vercel Cron** (if using Vercel)
- Add `vercel.json` with cron schedule (see full docs)
- Deploy to Vercel

**Option B: External Service** (Upstash, AWS EventBridge, etc.)
- Create scheduled task that calls the endpoint
- Include Authorization header with CRON_SECRET_KEY

**Option C: Local Development**
- Endpoints work manually—call them to test
- No cron setup needed for testing

## What Gets Sent

| Email Type | When | Frequency | Customizable |
|-----------|------|-----------|--------------|
| **Digest** | Weekly progress summary | Weekly (customizable day/time) | Yes (day, time, frequency) |
| **Celebration** | Objective mastered | Immediate | Yes (can disable) |
| **Alert** | Below mastery threshold | Periodic | Yes (threshold, frequency) |

## Parent Settings

Parents control notifications in `/parents/child/[childId]/notification-settings`:

- ✓ Enable/disable each email type
- ✓ Digest day and time (e.g., "Sunday at 6 PM")
- ✓ Alert threshold (e.g., "Email me if below 60%")
- ✓ Alert frequency (1/3/7/14 days between alerts)

## Database Schema

Three key tables:

1. **ParentChild** (existing)
   - `parentId`, `childId`, `createdAt`
   - Links parents to their children

2. **ParentNotificationPreference** (existing)
   - All user-controlled settings
   - Includes frequency, timing, thresholds

3. **SentNotification** (new)
   - Tracks every email sent
   - Records success/failure
   - Used for rate limiting and auditing

## Common Tasks

### Integrate Celebration Emails

When marking objective as complete:

```typescript
// After objective is marked completed
await fetch('/api/parents/notifications/send-celebration', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    childId: studentId,
    objectiveId: objectiveId,
  }),
});
```

### Check Sent Emails

```typescript
const sent = await prisma.sentNotification.findMany({
  where: {
    type: 'digest',
    status: 'sent',
  },
  orderBy: { sentAt: 'desc' },
  take: 20,
});
```

### Resend Digests to Specific Parent

```typescript
const preferences = await prisma.parentNotificationPreference.findFirst({
  where: { parentChildId: 'xyz' },
  include: { parentChild: { include: { parent: true, child: true } } },
});

await sendDigestEmail({
  parentEmail: preferences.parentChild.parent.email,
  parentName: preferences.parentChild.parent.name,
  childName: preferences.parentChild.child.name,
  // ... other fields
});
```

## Development Without Email

Skip `RESEND_API_KEY` in development—endpoints return success without sending. Perfect for:
- Testing logic locally
- CI/CD testing
- Avoiding accidental emails

Add key when you want actual emails.

## Monitoring

### Check Delivery Status

```typescript
// Recent failures
const failures = await prisma.sentNotification.findMany({
  where: { status: 'failed' },
  orderBy: { sentAt: 'desc' },
  take: 10,
});

// Success rate this week
const thisWeek = new Date(Date.now() - 7*24*60*60*1000);
const all = await prisma.sentNotification.count({
  where: { sentAt: { gte: thisWeek } },
});
const sent = await prisma.sentNotification.count({
  where: {
    sentAt: { gte: thisWeek },
    status: 'sent',
  },
});
console.log(`Success rate: ${(sent/all)*100}%`);
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Emails not sending (production) | Add RESEND_API_KEY to env vars |
| 401 Unauthorized | Check CRON_SECRET_KEY matches header |
| Parent has no child enrolled | Endpoints skip; check K12Enrollment table |
| Wrong digest data | Verify StudentObjectiveProgress records exist |
| Email address wrong | Check parent email in User table |

## Next Steps

1. ✓ Environment setup
2. ✓ Database migration
3. Set up cron jobs
4. Integrate celebration emails into objective completion
5. Monitor via Resend dashboard and SentNotification table

See [PARENT_EMAIL_BACKEND.md](./PARENT_EMAIL_BACKEND.md) for full documentation.
