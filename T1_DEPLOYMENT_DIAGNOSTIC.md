# T1 Backend - Deployment Diagnostic & Recovery
**Date**: Sep 15, 2026, 3:47 PM  
**Status**: 🔴 CRITICAL - All endpoints returning 500  
**Owner**: T1 Backend

---

## Problem Summary

✅ **Fixed**: NEXTAUTH_URL env var updated and redeployed  
❌ **Still Broken**: All API endpoints returning `FUNCTION_INVOCATION_FAILED` (500 error)

---

## Root Cause Analysis

The error persists even after env var fix. Possible causes (in order of likelihood):

### 1. **Database Connection Issue** (MOST LIKELY)
- Supabase connection string might be wrong
- Prisma client might not be generating properly
- Database might be unreachable from Vercel

### 2. **Missing Environment Variables**
- DATABASE_URL might be missing or incorrect
- Other auth secrets might be incomplete

### 3. **Prisma Migration Issue**
- Migration might not be applied on Vercel
- Prisma schema mismatch between local and Supabase

### 4. **Code Error** (LESS LIKELY)
- TypeScript compilation passed, but runtime error
- Missing import or module

---

## Diagnostic Steps (For User)

### Step 1: Check Vercel Function Logs
1. Go to https://vercel.com/dashboard
2. Select "viridian" project
3. Click "Deployments"
4. Click the latest deployment
5. Look for "Function Logs" section
6. Find any error messages related to `/api/communities`
7. **Share the error message with me**

### Step 2: Verify Environment Variables on Vercel
Double-check these are ALL set in Production environment:
- [ ] `DATABASE_URL` - Supabase connection string (should start with `postgresql://`)
- [ ] `NEXTAUTH_SECRET` - Secret key
- [ ] `NEXTAUTH_URL` - Should now be `https://viridian.vercel.app`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key

### Step 3: Check Database Connection Locally
Run this locally to test database:
```bash
npx prisma db execute --stdin
SELECT COUNT(*) FROM "User";
```
If this works locally but fails on Vercel, it's a DATABASE_URL issue.

### Step 4: Check Build Logs
On Vercel, during deployment:
1. Click "Build Logs" tab
2. Look for any warnings or errors during build
3. Look for prisma generation
4. Any build failures?

---

## Most Likely Solution

**The DATABASE_URL on Vercel is probably WRONG or MISSING.**

Check:
1. Is DATABASE_URL pointing to the correct Supabase project?
2. Is it using a connection pool URL (with `:6543`) or direct URL (with `:5432`)?
3. Does it include the password?
4. Is it base64 encoded or plain text?

---

## Recovery Plan

### If DATABASE_URL is the issue:
1. Go to Vercel Environment Variables
2. Find DATABASE_URL
3. Copy the EXACT connection string from Supabase dashboard
4. Paste it into Vercel (make sure it's complete and correct)
5. Redeploy
6. Test: `curl https://viridian.vercel.app/api/communities`

### If still failing after checking env vars:
1. Check Vercel Function Logs for actual error message
2. Share error message with me
3. I'll diagnose further

---

## What I Need From You

To proceed, please:

1. **Check Vercel Function Logs**
   - Tell me the exact error message you see
   - (e.g., "Cannot connect to database", "PRISMA_SCHEMA_PARSE_ERROR", etc.)

2. **Verify DATABASE_URL**
   - Is it set on Vercel?
   - Does it look correct?

3. **Confirm Supabase Project**
   - Which Supabase project are we using?
   - Is it the right one?

---

## Temporary Workaround

While we diagnose:
- Frontend can use mock data (not fetching from API yet)
- T2 can continue building UI without backend
- T3 can test integration logic locally

---

**NEXT ACTION**: Check Vercel Function Logs and share the error message with me. That will tell us exactly what's wrong.
