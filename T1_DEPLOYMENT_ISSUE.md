# T1 Backend - Vercel Deployment Issue & Recovery

**Issue**: GET /api/communities returns "A server error has occurred - FUNCTION_INVOCATION_FAILED"
**Status**: 🔴 BLOCKER - Endpoints fail at runtime on Vercel
**Discovered**: Sep 12, 2026 ~14:55

---

## Diagnosis

✅ **Build**: Compiles successfully (4.5 min, 0 TypeScript errors)
❌ **Runtime**: Vercel function invocation fails with no error details

Possible causes:
1. **Database Connection** - Supabase connection string missing/invalid in Vercel env
2. **Missing Environment Variables** - API keys, auth config not in Vercel
3. **Prisma Client** - Not generated or incompatible with Vercel runtime
4. **NextAuth** - Auth config missing on Vercel
5. **Async/await** - Next.js API route structure issue

---

## Recovery Steps

### Step 1: Check Vercel Environment Variables
```bash
# Verify these are set on Vercel:
- DATABASE_URL (Supabase connection string)
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- Any API keys for external services
```

### Step 2: Check Vercel Logs
```bash
# View detailed error logs on Vercel dashboard:
1. Go to https://vercel.com
2. Select "viridian" project
3. Check "Deployments" tab
4. Click latest deployment
5. Scroll to "Runtime Logs" section
6. Filter for function: api/communities
7. Look for actual error message
```

### Step 3: Rebuild & Deploy
```bash
# Force a new deployment:
1. Commit any pending changes
2. Push to main branch
3. Vercel should auto-deploy
4. Check deployment logs
```

### Step 4: Test Endpoint Again
```bash
curl https://viridian.vercel.app/api/communities
# Should return JSON array, not error
```

---

## Fallback: Test Locally

If Vercel continues to fail, verify APIs work locally:

```bash
# 1. Start dev server
npm run dev

# 2. In another terminal, test endpoint
curl http://localhost:3000/api/communities

# 3. Should return JSON with communities array
```

If local works but Vercel fails → environment variable issue on Vercel
If local fails too → code issue needs fixing

---

## Immediate Action Items

1. [ ] Check Vercel env variables (DATABASE_URL especially)
2. [ ] View Vercel deployment logs for actual error
3. [ ] Verify Supabase connection string is correct
4. [ ] Test locally to isolate issue
5. [ ] Re-deploy if env vars fixed
6. [ ] Verify 200 response from /api/communities

---

## Impact on T2/T3/T4

🔴 **BLOCKING**: T3 cannot wire frontend until APIs work on Vercel
- T2 can continue building components locally
- T3 cannot start integration testing
- T4 can continue preparing

**Timeline Impact**: 1-2 hours to resolve, likely just env var config

---

## Status Update for WORK_LOG

Move T1 to:
- Status: 🔴 BLOCKED (Vercel deployment issue)
- Focus: Environment variable debugging
- ETA for fix: 2 hours (Sep 12 ~16:30)

---

**Next Owner Action**: Check Vercel dashboard logs and verify environment variables
