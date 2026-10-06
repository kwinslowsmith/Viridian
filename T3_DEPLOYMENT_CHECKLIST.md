# T3: Deployment Checklist
**Date**: Oct 6, 2026  
**Purpose**: Production deployment guide for real-time infrastructure  
**Owner**: DevOps/DevTools  
**Target**: Deploy by Oct 8, 2026

---

## Pre-Deployment Review

- [ ] All manual tests passed (see T3_MANUAL_TESTING_SUITE.md)
- [ ] No console errors in browser
- [ ] Performance metrics acceptable:
  - [ ] Message latency < 500ms (typical)
  - [ ] Memory usage < 100MB
  - [ ] CPU usage < 20% during peak
  - [ ] No memory leaks detected
- [ ] Code review completed
- [ ] All unit tests pass: `npm test`
- [ ] Build succeeds: `npm run build`

---

## PHASE 1: Vercel Environment Setup

### 1.1 Update Environment Variables

**Location**: Vercel Dashboard → Settings → Environment Variables

**Required Variables**:

```
NEXTAUTH_URL=https://viridian.vercel.app
NEXTAUTH_SECRET=[existing value - do not change]
DATABASE_URL=[existing value - do not change]
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key from Supabase]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key from Supabase]
```

**Steps**:
1. [ ] Go to Vercel dashboard
2. [ ] Select "viridian" project
3. [ ] Click "Settings" → "Environment Variables"
4. [ ] Verify NEXTAUTH_URL is set to production URL
5. [ ] Add/update Supabase environment variables
6. [ ] Set environment to "Production"
7. [ ] Click "Save"

**Verification**:
```bash
# After saving, trigger redeploy
vercel deploy --prod

# Verify env vars loaded
curl https://viridian.vercel.app/api/health
# Should return 200 OK
```

---

### 1.2 Redeploy Latest Version

**Steps**:
1. [ ] Go to Vercel Deployments tab
2. [ ] Click latest deployment
3. [ ] Click "Redeploy"
4. [ ] Wait for deployment to complete (~5-10 min)
5. [ ] Check deployment log for errors
6. [ ] Verify build succeeded

**Expected**: ✅ Deployment succeeds with 0 errors

---

## PHASE 2: Supabase Configuration

### 2.1 Enable Real-Time Subscriptions

**Location**: Supabase Dashboard → Project Settings → Database → Replication

**Required Tables** (enable replication):
- [ ] `DiscussionMessage`
- [ ] `Discussion`
- [ ] `LearningCommunityMember` (or `CommunityMember`)
- [ ] `Meeting`
- [ ] `Resource`

**Steps**:
1. [ ] Go to Supabase project dashboard
2. [ ] Navigate to "Database" → "Tables"
3. [ ] For each table above:
   - [ ] Click table name
   - [ ] Click "Replication" tab
   - [ ] Toggle "Enable Replication" ON
   - [ ] Select "INSERT", "UPDATE", "DELETE" events
   - [ ] Click "Save"

**Verification**:
```sql
-- In Supabase SQL Editor, verify replication is enabled:
SELECT schemaname, tablename, wal_level
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'DiscussionMessage',
  'Discussion',
  'LearningCommunityMember',
  'Meeting',
  'Resource'
);

-- All should show wal_level = 'logical'
```

---

### 2.2 Row-Level Security (RLS) Policies

**Purpose**: Ensure users only see data they have access to

**Policy 1: Users can only see messages from communities they joined**

```sql
-- Enable RLS on DiscussionMessage table
ALTER TABLE DiscussionMessage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read messages from communities they're members of
CREATE POLICY "users_can_read_messages"
ON DiscussionMessage
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM LearningCommunityMember
    WHERE LearningCommunityMember.communityId = DiscussionMessage.communityId
    AND LearningCommunityMember.userId = auth.uid()
  )
);

-- Policy: Users can create messages in communities they're members of
CREATE POLICY "users_can_create_messages"
ON DiscussionMessage
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM LearningCommunityMember
    WHERE LearningCommunityMember.communityId = DiscussionMessage.communityId
    AND LearningCommunityMember.userId = auth.uid()
  )
);

-- Policy: Users can only update their own messages
CREATE POLICY "users_can_update_own_messages"
ON DiscussionMessage
FOR UPDATE
USING (userId = auth.uid());

-- Policy: Users can only delete their own messages
CREATE POLICY "users_can_delete_own_messages"
ON DiscussionMessage
FOR DELETE
USING (userId = auth.uid());
```

**Policy 2: Users can see discussions from communities they joined**

```sql
ALTER TABLE Discussion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_read_discussions"
ON Discussion
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM LearningCommunityMember
    WHERE LearningCommunityMember.communityId = Discussion.communityId
    AND LearningCommunityMember.userId = auth.uid()
  )
);
```

**Steps**:
1. [ ] Go to Supabase SQL Editor
2. [ ] Copy policies above
3. [ ] Paste and run each CREATE POLICY statement
4. [ ] Verify no errors in console
5. [ ] Test with sample query

**Verification**:
```sql
-- Test policy as authenticated user
SELECT * FROM DiscussionMessage WHERE discussionId = 'test-123';
-- Should return only messages user has access to

-- Test without auth (should return 0 rows if RLS working)
```

---

### 2.3 Connection Pooling

**Optional but Recommended**: Enable connection pooling for better performance

**Steps**:
1. [ ] Go to Supabase project settings
2. [ ] Click "Database" → "Connection Pooling"
3. [ ] Enable connection pooling
4. [ ] Set pool mode: "Transaction"
5. [ ] Set max connections: 10
6. [ ] Click "Save"

**Verification**:
```bash
# Test connection pool
curl "https://[project].supabase.co/rest/v1/DiscussionMessage?limit=1" \
  -H "apikey: [anon-key]" \
  -H "Authorization: Bearer [token]"
# Should return 200 OK
```

---

## PHASE 3: Application Verification

### 3.1 Health Check

**Steps**:
1. [ ] Visit production URL: https://viridian.vercel.app
2. [ ] Navigate to community page
3. [ ] Open DevTools → Console
4. [ ] Verify no console errors
5. [ ] Check Network tab for failed requests

**Expected**: 
- ✅ Page loads without errors
- ✅ All requests return 200/201 status
- ✅ No red errors in console

---

### 3.2 Real-Time Subscription Test

**Steps**:
1. [ ] Open community discussion in browser 1
2. [ ] Open same discussion in browser 2
3. [ ] Post message in browser 1
4. [ ] Verify message appears in browser 2 within 500ms
5. [ ] Check DevTools → Console for subscription confirmation

**Expected**:
- ✅ Message appears instantly
- ✅ No console errors
- ✅ Subscription active (check WebSocket in Network tab)

**Debug**:
```javascript
// In browser console:
// Check if Supabase is connected
console.log(supabase.getChannel('discussion:123')?.state);
// Should show 'joined'
```

---

### 3.3 API Endpoints Test

**Test each API endpoint**:

```bash
# Communities
curl https://viridian.vercel.app/api/communities \
  -H "Authorization: Bearer [token]"
# Expected: 200 OK, returns array of communities

# Specific community
curl https://viridian.vercel.app/api/communities/boston-directors \
  -H "Authorization: Bearer [token]"
# Expected: 200 OK, returns community details

# Discussions
curl https://viridian.vercel.app/api/communities/boston-directors/discussions \
  -H "Authorization: Bearer [token]"
# Expected: 200 OK, returns array of discussions

# Stats (requires curator role)
curl https://viridian.vercel.app/api/communities/boston-directors/stats \
  -H "Authorization: Bearer [token]"
# Expected: 200 OK (if curator) or 403 (if not)
```

**Steps**:
1. [ ] Get auth token from browser session (or use curl with credentials)
2. [ ] Test each endpoint above
3. [ ] Verify expected status codes
4. [ ] Check response format

---

### 3.4 Error Handling Test

**Test error scenarios**:

```bash
# Missing auth header (should return 401)
curl https://viridian.vercel.app/api/me/profile
# Expected: 401 Unauthorized

# Non-existent community (should return 404)
curl https://viridian.vercel.app/api/communities/fake-community-xyz \
  -H "Authorization: Bearer [token]"
# Expected: 404 Not Found

# Missing required field (should return 400)
curl -X POST https://viridian.vercel.app/api/communities \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{"description":"No name field"}'
# Expected: 400 Bad Request
```

**Steps**:
1. [ ] Test each error scenario
2. [ ] Verify correct status codes
3. [ ] Check error messages are helpful
4. [ ] Verify no sensitive data in errors

---

## PHASE 4: Performance Monitoring

### 4.1 Set Up Error Tracking

**Recommended**: Sentry or similar error monitoring

**Steps**:
1. [ ] Create Sentry project (or similar)
2. [ ] Get DSN
3. [ ] Add to environment variables: `SENTRY_DSN=[dsn]`
4. [ ] Verify errors are being tracked
5. [ ] Set up alerts for critical errors

---

### 4.2 Set Up Performance Monitoring

**Recommended**: Vercel Analytics or similar

**Steps**:
1. [ ] Enable Vercel Analytics
2. [ ] Set up custom metrics:
   - [ ] Message latency
   - [ ] Cache hit rate
   - [ ] Subscription health
3. [ ] Create dashboards
4. [ ] Set up alerting for anomalies

---

### 4.3 Set Up Logs Aggregation

**Recommended**: Vercel Logs or similar

**Steps**:
1. [ ] Enable function logs
2. [ ] Set up log aggregation
3. [ ] Create alerts for errors
4. [ ] Monitor real-time logs during launch

---

## PHASE 5: Security Audit

### 5.1 HTTPS/TLS

- [ ] Verify HTTPS enabled (should be automatic on Vercel)
- [ ] Test SSL certificate: `https://viridian.vercel.app`
- [ ] Verify certificate valid
- [ ] Check HSTS header enabled

**Test**:
```bash
curl -I https://viridian.vercel.app
# Should show "Strict-Transport-Security" header
```

---

### 5.2 Authentication

- [ ] Verify NextAuth configured correctly
- [ ] Test login flow
- [ ] Test logout flow
- [ ] Verify session cookies secure (HttpOnly, Secure)

**Test**:
```bash
# After login, check cookies
curl -I https://viridian.vercel.app \
  -H "Cookie: [session-cookie]"
# Cookie should have HttpOnly, Secure flags
```

---

### 5.3 Authorization

- [ ] Test non-curators can't access curator endpoints
- [ ] Test users can only see their data
- [ ] Test RLS policies working
- [ ] Verify permission errors (403) returned correctly

**Test**:
```bash
# Try to access curator endpoint as regular user
curl https://viridian.vercel.app/api/communities/boston-directors/stats \
  -H "Authorization: Bearer [regular-user-token]"
# Expected: 403 Forbidden
```

---

### 5.4 API Rate Limiting

- [ ] Enable rate limiting on endpoints
- [ ] Test rate limit headers
- [ ] Verify 429 Too Many Requests returned after limit

---

## PHASE 6: Launch Checklist

- [ ] All phases completed
- [ ] All tests passed
- [ ] Performance acceptable
- [ ] Security audit passed
- [ ] Monitoring configured
- [ ] Team notified
- [ ] Documentation updated
- [ ] Rollback plan ready

---

## Rollback Plan

**If issues occur after deployment**:

1. [ ] Identify issue type (API, real-time, performance, etc.)
2. [ ] Check monitoring dashboards
3. [ ] Review recent logs
4. [ ] If critical: Revert to previous deployment
   ```bash
   vercel rollback
   ```
5. [ ] Notify team
6. [ ] Investigate root cause
7. [ ] Fix and redeploy

---

## Post-Deployment (24 hours)

- [ ] Monitor error rate (should be < 1%)
- [ ] Monitor message latency (should be < 500ms)
- [ ] Monitor memory usage (should be < 100MB)
- [ ] Monitor subscription health
- [ ] Collect user feedback
- [ ] Document any issues

---

## Success Criteria

✅ **Production Deployment Successful**:
- All API endpoints working (200/201 responses)
- Real-time subscriptions active (< 500ms latency)
- No console errors
- Error rate < 1%
- Performance metrics acceptable
- Security checks passed
- All monitoring active
- Users can create, edit, delete messages/discussions
- Real-time updates working across multiple windows

---

## Deployment Summary

| Phase | Status | Time |
|-------|--------|------|
| 1. Vercel Setup | [ ] | 15 min |
| 2. Supabase Config | [ ] | 30 min |
| 3. App Verification | [ ] | 30 min |
| 4. Performance Setup | [ ] | 20 min |
| 5. Security Audit | [ ] | 30 min |
| 6. Launch | [ ] | 10 min |
| **Total** | | **2.5 hours** |

---

## Contact & Support

- **Deployment Issues**: [DevOps team]
- **Real-Time Issues**: [Backend team]
- **Performance Issues**: [Platform team]
- **Security Issues**: [Security team]

**Deployment readiness verified on**: _________  
**Deployed by**: _________  
**Date**: _________  
**Status**: [ ] SUCCESS [ ] ROLLBACK [ ] ON-HOLD

---

**Let's ship it! 🚀**
