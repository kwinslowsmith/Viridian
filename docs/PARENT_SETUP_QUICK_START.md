# Parent Account Setup - Quick Start

## 10-Minute Setup

### 1. Database Migration (2 minutes)
```bash
npx prisma migrate deploy
```
Creates `LinkingCode` table for parent-child linking.

### 2. Test Parent Signup (5 minutes)

**Signup flow**:
1. Visit `/parents/signup`
2. Enter: name, email, password
3. Click "Create Account"
4. In dev: Copy verification URL or code from terminal logs
5. Verify email (click link or paste code)
6. Enter linking code: `A1B2C3`
7. See "Successfully linked" message

### 3. For Manual Testing

**Create a test linking code** (in Node REPL or script):
```typescript
import prisma from '@/lib/prisma';

const code = await prisma.linkingCode.create({
  data: {
    code: 'TEST123',
    parentId: 'parent-user-id',
    childId: 'student-user-id',
    expiresAt: new Date(Date.now() + 7*24*60*60*1000),
  },
});
```

Then use code `TEST123` during signup.

## What Gets Created

### After Signup
- **User record** with parent role, email, hashed password
- **Email verification token** (unique, random)

### After Email Verification
- **User.emailVerified** set to true
- **Email verification token** cleared
- Email verified in database

### After Linking Child
- **ParentChild record** linking parent to student
- **ParentNotificationPreference record** with defaults
- **LinkingCode record** deleted (one-time use)

## Page Locations

| Path | Purpose |
|------|---------|
| `/parents/signup` | 3-step signup (account → verify → link) |
| `/parents/link-child` | Link child if already registered |
| `/parents/my-children` | Dashboard after linking |
| `/auth/verify-email` | Email verification endpoint |

## Database

### LinkingCode Table
```sql
CREATE TABLE "LinkingCode" (
  code        VARCHAR(8) PRIMARY KEY,      -- Unique identifier
  parentId    VARCHAR(255),                -- Parent user ID
  childId     VARCHAR(255),                -- Student user ID
  createdAt   TIMESTAMP DEFAULT NOW(),     -- Created time
  expiresAt   TIMESTAMP                    -- Expires in 7 days
);
```

### Auto-Generated with ParentChild
```typescript
ParentNotificationPreference {
  enableWeeklyDigest: true,      // Send weekly progress
  enableCelebrations: true,      // Send achievement alerts
  enableAlerts: true,            // Send support alerts
  digestDay: 0,                  // Sunday
  digestHour: 18,                // 6 PM
  alertThreshold: 60,            // Alert if below 60%
  minDaysBetweenAlerts: 7        // Max 1 alert per week
}
```

## API Reference

### POST /api/auth/parent-signup
```bash
curl -X POST http://localhost:3000/api/auth/parent-signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Parent",
    "email": "parent@example.com",
    "password": "SecurePass123"
  }'
```

### POST /api/auth/verify-email
```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@example.com",
    "token": "token-from-email"
  }'
```

### POST /api/parents/link-child (create code)
```bash
curl -X POST http://localhost:3000/api/parents/link-child \
  -H "Content-Type: application/json" \
  -d '{
    "childId": "student-id",
    "action": "create"
  }'
```

### PUT /api/parents/link-child (use code)
```bash
curl -X PUT http://localhost:3000/api/parents/link-child \
  -H "Content-Type: application/json" \
  -d '{
    "code": "A1B2C3"
  }'
```

## Common Tasks

### Create Admin Account with Linking Code
```typescript
const parent = await prisma.user.create({
  data: {
    email: 'admin@example.com',
    name: 'Admin Parent',
    passwordHash: hashPassword('password'),
    role: 'admin',
    emailVerified: true,
  },
});

const code = await prisma.linkingCode.create({
  data: {
    code: 'ADMIN01',
    parentId: parent.id,
    childId: 'student-id',
    expiresAt: new Date(Date.now() + 30*24*60*60*1000),
  },
});
```

### Find All Codes for a Parent
```typescript
const codes = await prisma.linkingCode.findMany({
  where: { parentId: 'parent-id' },
  orderBy: { createdAt: 'desc' },
});
```

### Cleanup Expired Codes (run daily)
```typescript
await prisma.linkingCode.deleteMany({
  where: { expiresAt: { lt: new Date() } },
});
```

### Reset a Failed Linking
```typescript
// Delete the failed linking attempt
await prisma.parentChild.delete({
  where: {
    parentId_childId: {
      parentId: 'parent-id',
      childId: 'student-id',
    },
  },
});

// Recreate notification preferences
await prisma.parentNotificationPreference.delete({
  where: { parentChildId: 'link-id' },
});
```

## Testing Scenarios

### Scenario 1: Happy Path
1. Parent creates account
2. Verifies email (automatically or manually)
3. Enters linking code
4. Sees dashboard with child

### Scenario 2: Existing Parent Linking
1. Parent signs in (already has account)
2. Visits `/parents/link-child`
3. Enters linking code
4. Added to dashboard

### Scenario 3: Expired Code
1. Parent has linking code from 8 days ago
2. Tries to use it
3. Gets "Code expired" error
4. Requests new code from school

### Scenario 4: Multiple Children
1. Same parent links to 2+ children
2. Each gets separate ParentChild record
3. Each gets separate notification preferences
4. Dashboard shows all children

### Scenario 5: Multiple Parents
1. Same student has 2 parents
2. Each parent signs up separately
3. Each uses their linking code
4. Each sees child on their dashboard
5. Both get notifications independently

## Development Notes

### Email Verification in Dev
- Endpoint returns verification URL
- Click it or copy token for manual verification
- No actual email sent without email service

### Linking Codes in Dev
- Use any 6-character code during testing
- Create test codes directly in database
- Codes are one-time use (deleted after linking)

### Password Hashing
- Uses bcryptjs (10 rounds)
- Takes ~100ms per signup
- Secure for production use

## Monitoring

### Check Recent Signups
```typescript
const recentParents = await prisma.user.findMany({
  where: {
    role: 'parent',
    createdAt: { gte: new Date(Date.now() - 24*60*60*1000) },
  },
  orderBy: { createdAt: 'desc' },
});
```

### Check Email Verification Rate
```typescript
const verified = await prisma.user.count({
  where: { role: 'parent', emailVerified: true },
});
const total = await prisma.user.count({
  where: { role: 'parent' },
});
console.log(`Verification rate: ${(verified/total)*100}%`);
```

### Check Parent-Child Links
```typescript
const links = await prisma.parentChild.findMany({
  include: { parent: true, child: true },
});
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Email already registered" | Use different email or login |
| Verification email not received | Check spam, resend email service needed |
| Linking code won't work | Code may be expired (7 days max) |
| Linking code already used | Each code is one-time use |
| Can't see dashboard | Check ParentChild record exists |

## Next Steps

1. ✓ Run database migration
2. ✓ Test signup flow locally
3. Create first parent account
4. Link to student
5. Verify dashboard shows child
6. Set up email service (Resend, SendGrid)
7. Deploy to production
8. Monitor signup/verification rates

See [PARENT_ACCOUNT_SETUP.md](./PARENT_ACCOUNT_SETUP.md) for full documentation.
