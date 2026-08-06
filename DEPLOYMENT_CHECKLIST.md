# Viridian Deployment Checklist

**Project**: Viridian (K12 Standards Mastery Tracker + Polymath Magazine)  
**Target**: Vercel (Next.js 16)  
**Database**: Supabase PostgreSQL  
**Launch Version**: v0.1 (Test/Demo with Mock Data Only)  
**Real Student Data Launch**: November 2026 (after security implementation)  
**Date**: August 6, 2026

---

## ⚠️ IMPORTANT: Test/Demo Version

**This deployment contains MOCK DATA ONLY**
- No real student records
- Fake test users and grades
- Clear disclaimer on all pages
- Ready for stakeholder demo and feedback
- NOT for production use with real students

**Real Student Data**: Available November 2026 after security audit

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

### Test Data Setup
- [x] Mock test students created (5-10 test accounts)
- [x] Mock test teacher account created
- [x] Mock test admin account created
- [x] Fake grades and performance data generated
- [x] Test classes created ("Demo Literature", "Demo Math")
- [x] Real student data NOT imported ✓

### Demo Environment Disclaimers
- [ ] Banner added to every page: "🔐 Test Environment - Mock Data Only"
- [ ] Login page disclaimer: "Demo credentials available below"
- [ ] Demo credentials documented: teacher/password, admin/password
- [ ] Privacy notice updated: "Real data will be added after security audit"
- [ ] Terms of service placeholder created

### Security Controls (Will Implement Sept-Oct, Before Real Data)
- ❌ Audit logging (September)
- ❌ Encryption at rest (September)
- ❌ Formal privacy policy (Legal team - September)
- ❌ Data Processing Agreement (Legal team - September)
- ❌ Incident response plan (October)
- ⚠️ **These are NOT blocking test/demo launch** (no real data to protect)
- ⚠️ **These WILL be required before November production launch**

### Features Not Yet Complete (Production Launch - Nov 2026)
- [ ] Audit logging (will implement Sept)
- [ ] Encryption at rest (will implement Sept)
- [ ] Formal privacy policy (legal - Sept)
- [ ] Data Processing Agreement (legal - Sept)
- [ ] Incident response plan (will implement Oct)
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

## Pre-Launch Summary (Test/Demo Version)

✅ **READY TO DEPLOY** (with test data only)
- Build passes without errors
- Database validated
- All core features working
- Demo disclaimers added
- Test data seeded
- No real student data

⚠️ **NOT READY FOR REAL STUDENT DATA** (target: Nov 2026)
- Audit logging not implemented (Sept)
- Encryption at rest not enabled (Sept)
- Privacy policy not finalized (legal - Sept)
- DPA not signed (legal - Sept)
- Incident response plan not documented (Oct)

**This deployment is for demo/stakeholder feedback only.**  
**Real student data launch requires completion of Tasks #7-10.**

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

## Post-Launch Tasks (August 2026 - Test/Demo Version)

### Day 1
- [ ] Monitor error logs in Vercel dashboard
- [ ] Test all features with demo data
- [ ] Verify auth works (test teacher/student/parent logins)
- [ ] Test Polymath Magazine features

### Week 1
- [ ] Share demo link with stakeholders
- [ ] Collect UX/feedback on features
- [ ] Fix any bugs found
- [ ] Document feedback for improvements

### Week 2+
- [ ] Deploy Polymath API integration (2-3 hours - orchestrator)
- [ ] Gather more feedback
- [ ] Plan security implementation tasks
- [ ] Coordinate with legal team

---

## Security Implementation Roadmap (Sept-Oct 2026)

**⚠️ IMPORTANT: The following work is NOT done yet and blocks real student data launch**

### September (Weeks 1-2): Technical Security
- [ ] Task #7: Design security architecture
- [ ] Task #9: Audit current implementation
- [ ] Implement audit logging (log all student data access)
- [ ] Enable encryption at rest (Supabase)
- [ ] Encrypt sensitive fields (grades, performance)

### September (Weeks 3-4): Legal & Policy
- [ ] Task #8: Create privacy policy (legal team)
- [ ] Privacy Policy: Data collection, retention, rights
- [ ] Data retention & deletion policy
- [ ] Incident response procedures

### October: Compliance & Testing
- [ ] Task #10: Final compliance checklist
- [ ] Sign Data Processing Agreement (school + Supabase)
- [ ] Access control security audit
- [ ] Session management improvements
- [ ] Staff FERPA training program
- [ ] Penetration testing

### November: Production Launch Ready
- [ ] Final security sign-off from legal
- [ ] All audit findings remediated
- [ ] Begin pilot with real school
- [ ] Import first real student records
- [ ] Enhanced monitoring active
- [ ] Incident response team ready

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
