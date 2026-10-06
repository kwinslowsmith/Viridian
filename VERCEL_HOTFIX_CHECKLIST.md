# Vercel Environment Variables - 5-Minute Fix

**Status**: 🔴 CRITICAL - All backend APIs returning 500 errors

**Root Cause**: NEXTAUTH_URL or DATABASE_URL misconfigured on Vercel

**Time to Fix**: 5 minutes

---

## Step-by-Step Fix (Copy/Paste)

### 1. Open Vercel Dashboard
- Go to https://vercel.com/dashboard
- Click **viridian** project

### 2. Navigate to Environment Variables
- Click **Settings** tab (top)
- Click **Environment Variables** (left sidebar)

### 3. Verify These Three Variables (Production Environment)

#### Variable 1: NEXTAUTH_URL
- **Key**: `NEXTAUTH_URL`
- **Expected Value**: `https://viridian.vercel.app`
- **Environment**: Production
- If different or missing → Edit → Copy/paste value above → Save

#### Variable 2: DATABASE_URL
- **Key**: `DATABASE_URL`
- **Expected Value**: `postgresql://postgres.fqazpffxwrbiumkflxgi:S1c1GePmdYif2mFG@aws-1-us-west-2.pooler.supabase.com:6543/postgres`
- **Environment**: Production
- If different or missing → Edit → Copy/paste value above → Save
- ⚠️ **CRITICAL**: Port must be **6543** (connection pooler), not 5432

#### Variable 3: NODE_ENV
- **Key**: `NODE_ENV`
- **Expected Value**: `production`
- **Environment**: Production
- If missing → Add it → Save

### 4. Redeploy
- Click **Deployments** tab
- Click the latest deployment
- Click the **...** menu (top right)
- Click **Redeploy**
- Wait 2-3 minutes for build to complete

### 5. Test
```bash
curl https://viridian.vercel.app/api/health
# Should return: {"status":"ok","timestamp":"...","environment":"production"}

curl https://viridian.vercel.app/api/communities
# Should return: {"communities":[],"total":0,"limit":20,"offset":0,"hasMore":false}
```

---

## Success Criteria
- ✅ `/api/health` returns 200 OK with JSON
- ✅ `/api/communities` returns 200 OK with JSON (not FUNCTION_INVOCATION_FAILED)
- ✅ T2/T3/T4 can begin integration testing

---

## Troubleshooting
If still failing after 5 min:
1. Clear browser cache and try again
2. Check Vercel → Deployments → latest → **Function Logs** section
3. Share error message for further diagnosis

---

**Time spent on T1 Emergency: ~4 hours**  
**Remaining**: Verify vars tonight, redeploy, test (5 min)
