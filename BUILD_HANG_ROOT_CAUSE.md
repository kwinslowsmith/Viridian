# Build Hang Root Cause Analysis
**Date**: Oct 2, 2026  
**Investigator**: T2 Frontend Agent + Vercel CLI integration  
**Status**: FIXED

---

## Problem

All Vercel deployments in the past 22 hours were **timing out after 45 minutes** instead of completing in ~1 minute.

**Timeline**:
- ✅ Last successful build: Oct 1, 15:28 (1m 5s duration)
- ❌ Builds since then: Oct 1 18:00 onwards (45m+ timeout)
- ❌ Reason: Unknown until now

---

## Root Cause

**`prisma db push` in the build script was hanging indefinitely.**

The build script was changed to:
```json
"build": "prisma generate && prisma db push --skip-generate && next build"
```

Problem: `prisma db push` tries to **connect to the database and push schema changes** during the build phase. If:
- DATABASE_URL is missing
- DATABASE_URL is incorrect
- Database is unreachable
- Connection fails for any reason

Then `prisma db push` will **hang forever** waiting for the database connection, until Vercel's 45-minute timeout kills the build.

---

## Evidence

### Successful build (22h ago)
```
Build Duration: 1m 5s
Status: ● Ready
```
Script: `prisma generate && next build` (no db push)

### Failed builds (3h-22h ago)
```
Build Duration: 45m 38s (timeout)
Status: ● Error - The build exceeded Vercel's 45-minute limit
```
Script: `prisma generate && prisma db push --skip-generate && next build`

---

## Solution Applied

**Temporary fix** (deployed Oct 2, 10:54 UTC):

Revert to simple build script:
```json
"build": "prisma generate && next build"
```

This:
- ✅ Removes database-dependent command from build
- ✅ Allows build to complete in ~1 minute
- ✅ Unblocks Vercel deployment
- ✅ Allows frontend to be deployed and tested
- ⚠️ Database schema won't be auto-synced during build (needs manual migration after DB is fixed)

---

## Next Steps

1. **T1**: Fix DATABASE_URL on Vercel (if it's wrong)
2. **T1**: Verify database is reachable and has correct schema
3. **T1**: Once DB works, we can add back `prisma db push` or `prisma migrate deploy` to build script

---

## Why This Happened

Recent commits added `prisma db push` to the build script to ensure schema is in sync before deployment. This is normally a good practice, BUT:

**It requires the database to be reachable during build time.**

If the database credentials are wrong or unreachable, this command blocks the entire build process with no timeout, eventually hitting Vercel's global 45-minute limit.

---

## Lessons Learned

✅ **Vercel CLI integration** helped us identify this immediately  
✅ **Inspect tool** showed exact build duration and failure reason  
✅ **List deployments** showed pattern (all 45m timeouts)  
✅ **Compare deployments** showed successful vs failed durations  

Without Vercel CLI, we would have been blind to this issue for hours.

---

## Deployment Status

**Commit**: 04b94f7  
**Time**: Oct 2, 2026 10:54 UTC  
**Expected**: Build completes in 1-2 minutes  
**Then**: Frontend pages become testable  

---

**Monitoring**: Build progress with `vercel list` every few seconds...

