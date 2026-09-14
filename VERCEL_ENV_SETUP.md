# Vercel Environment Variables - Setup Instructions

**Status**: 🔴 CRITICAL - Needed to fix deployment

**The Problem**: 
- Local .env has `NEXTAUTH_URL=http://localhost:3000`
- This is checked into git
- Vercel pulls it and uses localhost in production
- Result: NextAuth fails on Vercel

**The Solution**: 
Set proper environment variables on Vercel dashboard (these override .env)

---

## Required Vercel Environment Variables

Go to: https://vercel.com → viridian project → Settings → Environment Variables

Add/Update these variables for **Production** environment:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXTAUTH_URL` | `https://viridian.vercel.app` | **CRITICAL** - Override localhost |
| `NEXTAUTH_SECRET` | (same as local `.env`) | Secret key for JWT |
| `DATABASE_URL` | (Supabase connection string) | Ensure it's the right one |
| `NODE_ENV` | `production` | Set for all production env vars |

---

## Step-by-Step Fix

1. **Open Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Click "viridian" project

2. **Navigate to Environment Variables**
   - Click "Settings" tab
   - Click "Environment Variables" in left sidebar

3. **Add/Edit `NEXTAUTH_URL`**
   - If it exists and shows `http://localhost:3000`: Edit it
   - Change value to: `https://viridian.vercel.app`
   - Environment: Select "Production" (not Development/Preview)
   - Click "Save"

4. **Verify Other Variables**
   - `NEXTAUTH_SECRET`: Should be set to your secret
   - `DATABASE_URL`: Should point to Supabase (verify it works)
   - `NODE_ENV`: Should be `production`

5. **Re-Deploy**
   - Go to "Deployments" tab
   - Click the latest deployment
   - Click the "..." menu
   - Select "Redeploy"

6. **Test**
   ```bash
   curl https://viridian.vercel.app/api/communities
   # Should return JSON array (200 OK), not error
   ```

---

## Troubleshooting

If still getting `FUNCTION_INVOCATION_FAILED`:

1. Check Vercel Function Logs:
   - Deployments → Latest → "Function Logs" section
   - Look for error details

2. Common issues:
   - Database connection failure → verify DATABASE_URL
   - Missing NEXTAUTH_SECRET → add it to Vercel env vars
   - Prisma schema mismatch → run `npx prisma generate` locally and commit

3. Force rebuild:
   - Push a new commit to main
   - Vercel will auto-deploy

---

## Prevention for Future

Add to `.env`:
```bash
# Local development ONLY
NEXTAUTH_URL="http://localhost:3000"

# Production will override with Vercel env var
```

But ideally, remove `NEXTAUTH_URL` from `.env` entirely and only set it on Vercel for production.

---

**Status**: Apply these environment variables to Vercel now, then re-deploy. Endpoints should be working within 5 minutes.
