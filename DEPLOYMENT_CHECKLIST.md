# Viridian Deployment Checklist

**Project**: Viridian (K12 Standards Mastery Tracker + Polymath Magazine)  
**Target**: Vercel (Next.js 16)  
**Database**: Supabase PostgreSQL  
**Date**: August 6, 2026

---

## Pre-Deployment Verification ✓

### Build & Dependencies
- [x] Build completes without errors: `npm run build` ✅
- [x] No console warnings or errors in build output ✅
- [x] Prisma schema is valid ✅
- [x] All migrations applied to dev database ✅
- [x] No `any` types in TypeScript (strict mode) ✅

### Environment Configuration
- [x] `.env` file has DATABASE_URL (Supabase connection)
- [x] `.env.local` has NEXTAUTH_SECRET
- [x] `.env.local` has NEXTAUTH_URL (currently localhost)
- [x] `.env.local` has NEXT_PUBLIC_SUPABASE_URL
- [x] `.env.local` has SUPABASE_SERVICE_ROLE_KEY
- [x] `.env.local` has RESEND_API_KEY (optional, can be empty)

### Features Ready for Production
- [x] K12 Standards Interface (UI + API integrated, working with real data)
- [x] Improv Mastery Tracker (Phase 1 complete)
- [x] Messaging Center (Phase 1 complete)
- [x] Polymath Magazine landing page (UI complete, mock data)
- [x] Polymath Magazine feed (UI complete, mock data)
- [x] Authentication (NextAuth configured)
- [x] Database schema (Supabase migrations applied)

### Features Not Yet Complete (Launch 2.0)
- [ ] Polymath posting UI wired to API (in progress - orchestrator)
- [ ] Polymath approval workflow (pending API integration)
- [ ] Advanced search/recommendations
- [ ] Analytics dashboard

### Testing Completed
- [x] Local development server runs without errors (`npm run dev`)
- [x] Auth login flow works
- [x] K12 Standards page loads
- [x] Polymath Magazine pages load
- [x] API routes respond correctly
- [x] Database queries execute properly
- [x] No 500 errors in console

---

## Pre-Launch Tasks (Before git push)

### Security
- [ ] Rotate NEXTAUTH_SECRET (generate new one)
  ```bash
  openssl rand -base64 32
  ```
  - Update in Vercel Environment Variables after deployment

- [ ] Remove sensitive data from git history
  ```bash
  git log --all -- .env.local  # Check if accidentally committed
  ```

- [ ] Verify no API keys exposed in code
  ```bash
  git log -S "SUPABASE_SERVICE_ROLE_KEY" --all  # Should be empty
  ```

### Final Code Review
- [ ] No debug `console.log()` statements in production code
- [ ] No `TODO` or `FIXME` comments in critical paths
- [ ] Error messages are user-friendly
- [ ] All error handling is in place
- [ ] API error responses are consistent

### Commit & Push
- [ ] All changes committed to `main` branch
- [ ] Commit message is descriptive
- [ ] No uncommitted changes
- [ ] Ready to push to GitHub

---

## Deployment Steps (During Launch)

### Step 1: Push to GitHub
```bash
cd ~/Desktop/Viridian
git push origin main
```

### Step 2: Deploy to Vercel
**Option A: CLI**
```bash
vercel --prod
```

**Option B: Dashboard**
- Visit vercel.com
- Select Viridian project
- Click "Deploy from Git"
- Vercel auto-detects main branch

### Step 3: Add Environment Variables to Vercel
After deployment, go to **Project Settings → Environment Variables**:

```
DATABASE_URL=postgresql://postgres.fqazpffxwrbiumkflxgi:S1c1GePmdYif2mFG@aws-1-us-west-2.pooler.supabase.com:5432/postgres
NEXTAUTH_SECRET=<GENERATE NEW VALUE>
NEXTAUTH_URL=https://your-viridian-domain.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://fqazpffxwrbiumkflxgi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY=<optional, can be empty>
```

**⚠️ CRITICAL**: Update `NEXTAUTH_URL` to your actual Vercel domain (e.g., `https://viridian.vercel.app`)

### Step 4: Trigger Redeployment
After updating environment variables, redeploy:
- Click "Redeploy" in Vercel dashboard, OR
- Push empty commit: `git commit --allow-empty -m "chore: trigger redeploy"` && `git push`

### Step 5: Run Database Migrations (Production)
```bash
DATABASE_URL="your_production_db_url" npx prisma migrate deploy
```
(Migrations already applied to dev database; just verifying)

---

## Post-Deployment Verification

### Smoke Tests
- [ ] Visit `https://your-viridian.vercel.app` — loads without errors
- [ ] Homepage visible
- [ ] Polymath Magazine link in nav works
- [ ] Click "Polymath Magazine" → `/polymath/landing` loads
- [ ] Click "Feed" → Polymath feed loads with articles
- [ ] Click "K12 Standards" → Standards interface loads
- [ ] Login/signup flow works
- [ ] API routes respond (check Network tab)

### Monitor for Errors
- [ ] Check Vercel dashboard for deployment status
- [ ] Check Vercel logs for any errors during build
- [ ] Monitor server-side errors in first 30 minutes
- [ ] Test auth redirect (should update from localhost to production domain)

### Database Connectivity
- [ ] Verify Supabase connection is active
- [ ] Check Supabase query logs for errors
- [ ] Confirm migrations were applied

---

## Rollback Plan (If Issues)

**If deployment fails or has critical errors:**

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Vercel auto-redeploys from new commit
# Takes ~2-3 minutes to go live
```

**If database is corrupted:**
- Restore from Supabase backup
- Contact Supabase support if needed

---

## Post-Launch Tasks

### Day 1
- [ ] Monitor error logs
- [ ] Test with real users (if sharing)
- [ ] Collect feedback on UX/bugs

### Week 1
- [ ] Fix any reported bugs
- [ ] Deploy Polymath API integration (2-3 hours)
- [ ] Performance optimization if needed
- [ ] User feedback review

### Week 2+
- [ ] Phase 2 features
- [ ] Advanced mastery calculation
- [ ] Recommendation engine
- [ ] Analytics dashboard

---

## Useful Vercel Commands

```bash
# View deployment status
vercel status

# View logs
vercel logs

# List deployments
vercel list

# View environment variables
vercel env pull

# Set specific environment variable
vercel env add NEXTAUTH_SECRET
```

---

## Support & Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **NextAuth Docs**: https://next-auth.js.org

---

**Status**: Ready for deployment ✅  
**Last Updated**: August 6, 2026  
**Next Step**: Await Polymath API integration, then push to GitHub
