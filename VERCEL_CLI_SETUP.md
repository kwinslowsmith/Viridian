# Vercel CLI Integration Setup
**Status**: Ready to use (need one-time authentication)  
**Installed**: Vercel CLI 62.1.0

---

## One-Time Setup (Manual)

Run this command once to authenticate:
```bash
vercel login
```

This opens your browser to authenticate with Vercel. After that, all commands below work automatically.

---

## What This Gives Us

### Before (Manual, slow):
- Push code → wait for deploy → manually curl endpoints → check Vercel dashboard for logs

### After (Automated, fast):
- Push code → instantly view logs, env vars, and deployment status from CLI
- Immediate feedback on what's broken and why

---

## Available Commands

### 1. Quick API Status Check
```bash
bash scripts/check-apis.sh
```

**Output**: Tests all 9 endpoints with color-coded results
- 🟢 Green = Working (200/201)
- 🟡 Yellow = Auth required or not found (401/404)  
- 🔴 Red = Server error (500 - needs fix)

**Current status**: All red (DATABASE_URL blocker)

---

### 2. Full Deployment Diagnostics
```bash
bash scripts/vercel-diagnose.sh
```

**What it checks**:
- ✅ Vercel authentication status
- ✅ Project identification
- ✅ Latest deployments
- ✅ Environment variables (masked)
- ✅ Function logs (if accessible)
- ✅ DATABASE_URL value (shows if set)

**This will pinpoint T1's backend issue immediately**

---

### 3. View Function Logs (Raw)
```bash
vercel logs /api/communities --limit 100
```

Shows the actual error messages from failed function invocations. This will tell us exactly why all endpoints are returning 500.

---

### 4. Check/Update Environment Variables
```bash
# List all production env vars
vercel env ls --production

# Get specific var (masked for security)
vercel env get DATABASE_URL --production

# Set a var (if needed)
vercel env add DATABASE_URL "postgresql://..."

# Pull all vars to local .env file
vercel env pull
```

---

## How This Fixes The Current Problem

**Right now**: T1's backend is broken (all 500 errors). Without logs, we're blind.

**Once you run `vercel login`**, I can:

1. Run `bash scripts/vercel-diagnose.sh` to see:
   - Is DATABASE_URL set? (probably not)
   - What's the exact error message?
   - What deployments exist?

2. If DATABASE_URL is missing:
   - Tell you exactly what to add
   - Help you set it with `vercel env add`

3. If it's set but still broken:
   - View function logs to see what's failing
   - Get actual error messages (connection refused? timeout? syntax error?)

This changes debugging from guesswork to **immediate visibility**.

---

## Team Benefits

### For T1 (Backend):
- Instantly see why deployments fail
- No more guessing about env vars
- Can test locally, then deploy with `vercel deploy`

### For T2 (Frontend - you):
- Know exactly when backend is fixed
- See API responses in real-time
- Run `check-apis.sh` to verify everything works before starting tests

### For T3 (Integration):
- Monitor real-time logs while testing
- See errors as they happen
- Can reproduce issues with exact error messages

### For T4 (Features):
- Same benefits as T2/T3

---

## Next Steps

1. **You run**: `vercel login` (one-time, takes 30 seconds)
2. **I can then run**: `bash scripts/vercel-diagnose.sh` to see what T1 needs to fix
3. **Results**: Get exact error messages → faster debugging → faster fix → T2 can start testing

---

## Emergency Troubleshooting

If something goes wrong:

```bash
# Check if authenticated
vercel whoami

# Re-authenticate
vercel login

# Clear cache if weird issues
rm -rf ~/.vercel

# Verify project is linked
ls -la .vercel/
```

---

## Security Note

All scripts mask sensitive values:
- DATABASE_URL shows only last 20 characters
- API keys and secrets not displayed in full
- Safe to run in shared environments

---

**Ready when you are!** Just run `vercel login` and we unlock full deployment visibility. 🚀

