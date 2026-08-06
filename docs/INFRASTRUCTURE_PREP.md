# Infrastructure & Deployment Preparation

**Purpose**: Prepare Vercel deployment configuration and credentials  
**Timeline**: Can start immediately while UI consultant finishes work  
**Estimated Time**: 1-2 hours setup

---

## Pre-Deployment Checklist

### 1. Generate New NextAuth Secret

```bash
# Generate a new secure secret for production
openssl rand -base64 32

# Output example:
# aB3cD4eFgHiJkLmNoPqRsTuVwXyZ1a2bC3dE4fG5h6i=

# Save this - you'll need it for Vercel
```

### 2. Create Vercel Account (if needed)

- Visit vercel.com
- Sign up with GitHub (recommended)
- Authorize Viridian repository

### 3. Verify GitHub Repository

Ensure main branch is clean and ready:

```bash
cd ~/Desktop/Viridian

# Check status
git status

# Should show:
# On branch main
# Your branch is ahead of 'origin/main' by X commits.
# nothing to commit, working tree clean
```

### 4. Environment Variables Documentation

**For Demo Deployment** (August):

```
DATABASE_URL=postgresql://[supabase-demo-connection]
NEXTAUTH_SECRET=[GENERATE NEW - see above]
NEXTAUTH_URL=https://viridian-demo.vercel.app  # (Vercel will assign actual URL)
NEXT_PUBLIC_SUPABASE_URL=https://[demo-project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[demo-key]
RESEND_API_KEY=[optional - empty if not using email]
NEXT_PUBLIC_ENVIRONMENT=demo
NEXT_PUBLIC_DEMO_MODE=true
```

**For Production Deployment** (November):

```
DATABASE_URL=postgresql://[supabase-prod-connection]
NEXTAUTH_SECRET=[NEW SECRET - different from demo]
NEXTAUTH_URL=https://viridian.vercel.app  # (or custom domain)
NEXT_PUBLIC_SUPABASE_URL=https://[prod-project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[prod-key]
RESEND_API_KEY=[production key]
NEXT_PUBLIC_ENVIRONMENT=production
```

---

## Vercel Setup Steps

### Step 1: Import Project

1. Go to vercel.com/new
2. Select "GitHub" repository: viridian
3. Click "Import"
4. Vercel auto-detects Next.js project

### Step 2: Configure Project

**Framework**: Next.js (auto-detected ✓)  
**Build Command**: `npm run build` (auto-detected ✓)  
**Output Directory**: `.next` (auto-detected ✓)  
**Install Command**: `npm install` (auto-detected ✓)

### Step 3: Environment Variables

In Vercel Dashboard → Settings → Environment Variables

Add for **demo environment**:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | `postgresql://...` | Demo Supabase |
| `NEXTAUTH_SECRET` | `[generated secret]` | Use the one generated above |
| `NEXTAUTH_URL` | `https://viridian-demo.vercel.app` | Will update after deploy |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[project].supabase.co` | Demo project |
| `SUPABASE_SERVICE_ROLE_KEY` | `[key]` | Demo key |
| `NEXT_PUBLIC_ENVIRONMENT` | `demo` | Mark as demo |

**Save Environment Variables** → Deploy

### Step 4: Deploy

Click "Deploy" button in Vercel dashboard

**What happens**:
- Vercel clones repository
- Runs build: `npm run build`
- Generates optimized deployment
- Assigns URL: `https://viridian-xxx.vercel.app`

**Deployment time**: 2-3 minutes

### Step 5: Post-Deployment

1. **Visit deployment URL** (Vercel shows it)
2. **Update NEXTAUTH_URL** in environment variables:
   - Go to Settings → Environment Variables
   - Update `NEXTAUTH_URL` to actual URL
   - Redeploy or commit empty change to trigger rebuild

```bash
# Alternative: Trigger redeploy
git commit --allow-empty -m "chore: trigger vercel deployment"
git push origin main
```

---

## Supabase Setup for Demo

### If Using Separate Demo Project

**Recommended**: Create separate Supabase project for demo

1. Go to supabase.com
2. Create new project: `viridian-demo`
3. Choose region: US East (or closest to your location)
4. Save credentials:
   - Project URL
   - Anon Key
   - Service Role Key

### Run Migrations on Demo Database

```bash
# Connect to demo database
export DATABASE_URL="postgresql://[demo-connection-string]"

# Run migrations
npx prisma migrate deploy

# Seed demo data
npx ts-node prisma/seed-demo.ts

# Verify data
npx prisma studio  # Browse data in web UI
```

---

## DNS Configuration (Optional - for Custom Domain)

**Can do later in November for production**, but here's how:

### Add Custom Domain to Vercel

1. Vercel Dashboard → Settings → Domains
2. Add domain: `viridian.app` (or your domain)
3. Follow DNS setup instructions
4. Update `NEXTAUTH_URL` to custom domain

### DNS Records (example)

For GoDaddy or similar:

```
Type    Name    Value
CNAME   www     viridian.vercel.app
A       @       76.76.19.132  # Vercel IP
```

---

## Monitoring & Deployment Success

### Vercel Dashboard Checks

After deployment:

- ✅ Deployment Status: **Success** (green)
- ✅ Build Output: No errors
- ✅ Build Duration: < 5 minutes
- ✅ Environment Variables: All set
- ✅ Domains: URL assigned

### Live Site Checks

Visit deployed URL:

1. **Banner visible**: "TEST ENVIRONMENT - MOCK DATA ONLY"
2. **Login page**: Shows demo credentials
3. **Login works**: Can login with demo credentials
4. **Data visible**: Test data displays
5. **No errors**: Browser console clean
6. **Features work**: Navigate through interface

### Troubleshooting

**If deployment fails**:

```bash
# Check build locally first
npm run build

# Should complete without errors
# If errors, fix locally first, then push to GitHub
```

**If login doesn't work**:

```bash
# Verify NEXTAUTH_URL matches actual URL
# Verify NEXTAUTH_SECRET is set
# Trigger redeploy
git commit --allow-empty -m "chore: trigger deployment"
git push origin main
```

**If data doesn't show**:

```bash
# Verify DATABASE_URL in Vercel settings
# Verify migrations ran on demo database
# Check Supabase console for data
```

---

## Security Best Practices

### Secrets Management

✅ **DO**:
- Store secrets in Vercel Environment Variables (not git)
- Rotate secrets periodically
- Use different secrets for demo vs production
- Keep secrets confidential

❌ **DON'T**:
- Commit secrets to git
- Reuse secrets across environments
- Log secrets to console
- Share secrets in Slack/email

### Access Control

- Only authorized team members have Vercel access
- Use Vercel teams for collaboration
- Audit deployment history
- Enable 2FA on Vercel account

---

## Deployment Workflow (Ongoing)

### For Demo Updates (August-September)

```bash
# Make changes locally
# Test locally: npm run dev

# Commit and push
git add .
git commit -m "feat: [description]"
git push origin main

# Vercel automatically deploys to demo
# Takes 2-3 minutes
# Check status at vercel.com dashboard
```

### For Production (November)

```bash
# Would create separate production environment
# OR use separate branch (main = production)
# Deployment process same as above
```

---

## Infrastructure Readiness Checklist

**GitHub Setup**:
- [ ] Repository public or private (as preferred)
- [ ] Main branch protected (optional but recommended)
- [ ] .gitignore covers secrets
- [ ] No secrets in commit history

**Supabase Setup**:
- [ ] Demo project created (if separate)
- [ ] Database credentials saved
- [ ] Migrations applied to demo database
- [ ] Seed data loaded

**Vercel Setup**:
- [ ] Account created
- [ ] GitHub connected
- [ ] Project imported
- [ ] Environment variables configured
- [ ] Build tested
- [ ] Deployment successful

**Documentation**:
- [ ] Credentials saved securely (password manager)
- [ ] Deployment URLs documented
- [ ] Team notified of access
- [ ] Rollback procedures documented

---

## Rollback Procedures

### If Deployment Has Issues

**Via Vercel Dashboard**:

1. Go to Deployments tab
2. Find previous working deployment
3. Click "Redeploy"
4. Takes 2-3 minutes

**Via Git**:

```bash
# Revert last commit
git revert HEAD

# Push to trigger redeploy
git push origin main

# Vercel automatically deploys previous version
```

### Backup & Recovery

**Database Backup**:
- Supabase provides automatic daily backups
- Retention: 7 days free tier, 30 days paid
- Can be restored from Supabase console

**Code Backup**:
- GitHub is your backup (full history)
- Can restore any previous commit

---

## Performance Monitoring

### Initial Performance Check

After deployment, verify performance:

```bash
# Check page load time
# Goal: < 2 seconds

# Use Vercel Analytics:
# Vercel Dashboard → Analytics
# Monitor Core Web Vitals:
# - LCP (Largest Contentful Paint) < 2.5s
# - FID (First Input Delay) < 100ms
# - CLS (Cumulative Layout Shift) < 0.1
```

---

## Timeline

| Week | Action | Owner |
|------|--------|-------|
| Week 1-2 (Aug) | Prep infrastructure, generate secrets | Engineering |
| Week 2 (Aug) | Add demo data, disclaimers | Engineering |
| Week 3 (Aug) | Deploy to Vercel | Engineering |
| Week 3 (Aug) | Share with stakeholders | Product |
| Sept-Oct | Monitor performance, gather feedback | All |
| Nov | Final infrastructure for production | Engineering |

---

**Status**: Ready to Execute (August)  
**Next**: Execute deployment steps in Week 3  
**After**: Monitor demo environment during Sept-Oct feedback phase
