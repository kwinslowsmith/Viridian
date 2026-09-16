# T1 Backend - Priority 1 Testing & Verification Plan
**Date**: Sep 15, 2026  
**Status**: 🔴 BLOCKING - Awaiting Vercel env var fix  
**Owner**: T1 Backend (Claude Code)

---

## Step 1: CRITICAL FIX - Vercel Environment Variable

**Current Blocker**: NEXTAUTH_URL = `http://localhost:3000` on Vercel (wrong for production)

**What needs to happen** (USER ACTION REQUIRED):
1. Go to https://vercel.com/dashboard
2. Click "viridian" project
3. Click "Settings" → "Environment Variables"
4. Find `NEXTAUTH_URL` variable
5. Edit it: Change from `http://localhost:3000` → `https://viridian.vercel.app`
6. Make sure it's set for "Production" environment
7. Click "Save"
8. Go to "Deployments" tab
9. Click latest deployment → "Redeploy"

**Status**: ⏳ WAITING FOR USER TO UPDATE VERCEL

---

## Step 2: Verify Deployment (After env var fixed)

Once Vercel redeploys, I will:

### 2a. Quick Smoke Test (5 min)
```bash
curl https://viridian.vercel.app/api/communities
# Should return: JSON array of communities (200 OK), NOT error
```

### 2b. Full Endpoint Testing (30 min)

Test all 9 endpoints across 4 categories:

#### **Category 1: Communities (Public, no auth required)**
- `GET /api/communities` → 200 OK, returns array
- `GET /api/communities/boston-directors` → 200 OK (if exists) or 404

#### **Category 2: Discussions (Auth required)**
- `GET /api/communities/boston-directors/discussions` → 401 if not logged in, 200 if logged in
- `POST /api/communities/boston-directors/discussions` → 401 if not logged in, 201 if logged in + valid body

#### **Category 3: Messages (Auth required)**
- `GET /api/communities/boston-directors/discussions/{id}/messages` → 401 if not logged in
- `POST /api/communities/boston-directors/discussions/{id}/messages` → 401 if not logged in

#### **Category 4: Meetings (Auth + Curator)**
- `GET /api/communities/boston-directors/meetings` → 401 if not logged in, 200 if logged in
- `POST /api/communities/boston-directors/meetings` → 403 if not curator, 201 if curator + valid body

#### **Category 5: User & Stats (Auth + Curator)**
- `GET /api/me/profile` → 401 if not logged in, 200 if logged in
- `GET /api/communities/boston-directors/stats` → 403 if not curator, 200 if curator

---

## Step 3: Auth Enforcement Verification (10 min)

Test that authorization works:
- [ ] 401 returned when not authenticated (no session)
- [ ] 403 returned when authenticated but not curator (for curator-only endpoints)
- [ ] 404 returned when community doesn't exist
- [ ] 400 returned when required fields missing in POST

---

## Step 4: Document Results (15 min)

Create `T1_TESTING_REPORT.md` with:
- Endpoint test results (passed/failed)
- Auth verification results
- Any errors or issues found
- Timestamp of testing
- Curl commands used

---

## Estimated Timeline

| Step | Time | Status |
|------|------|--------|
| Step 1: Env var fix | 5 min | ⏳ Waiting |
| Step 2: Smoke test | 5 min | 🔲 Ready |
| Step 2b: Full testing | 30 min | 🔲 Ready |
| Step 3: Auth verification | 10 min | 🔲 Ready |
| Step 4: Documentation | 15 min | 🔲 Ready |
| **Total** | ~60 min | ⏳ In Progress |

---

## Success Criteria

✅ **All 9 endpoints responding correctly on Vercel**
✅ **Auth enforcement working (401/403 responses)**
✅ **No runtime errors (FUNCTION_INVOCATION_FAILED gone)**
✅ **All tests documented in report**
✅ **Ready for T2/T3 to start API integration**

---

## Next Action

**WAITING ON USER**: Update NEXTAUTH_URL on Vercel dashboard, then tell me to proceed with testing.

Once env var is fixed, I'll run all tests and report results.
