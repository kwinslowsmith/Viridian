# Phase 1 K12 LMS — End-to-End Testing Guide

**Date:** August 10, 2026  
**Status:** 🚀 Ready for Testing  
**Environment:** Local Development (localhost:3000)  

---

## Quick Start

### Test Credentials (All Users)

```
Password (All Users): TestPassword123!
```

| User | Email | Password | Role |
|---|---|---|---|
| Teacher | `teacher1@riverside.edu` | `TestPassword123!` | Instructor |
| Student | `student1@riverside.edu` | `TestPassword123!` | Student |
| Parent | `parent0@example.com` | `TestPassword123!` | Parent |

---

## Testing Workflow

### Phase 1: Teacher Dashboard E2E Test

**Objective:** Verify teacher can log in and see class dashboard with live API data

**Steps:**
1. Open browser to `http://localhost:3000`
2. Click "Sign In" → Navigate to `/auth/login`
3. Enter:
   - Email: `teacher1@riverside.edu`
   - Password: `TestPassword123!`
4. Click "Sign In"
5. **Expected:** Redirected to dashboard or home page
6. Navigate to: `/teachers/class/cmsjazbw0000augct6nyutf9e/dashboard`
7. **Verify:**
   - ✅ Page loads without errors
   - ✅ Header shows "American Literature, Period 3"
   - ✅ Grade level: 11
   - ✅ Enrollment: 3 students
   - ✅ Health score displays (color-coded red for 0%)
   - ✅ Quick stats show: Pending (1), Mastery (0%), Students needing support
   - ✅ 2 standards displayed with mastery %
   - ✅ Intervention groups: 1 group showing "Reteach - Identify primary and secondary themes"
   - ✅ Master calendar: 3 events listed
   - ✅ No console errors

**Performance Check:**
- Measure page load time (goal: < 2 seconds)
- Measure dashboard scan time (goal: < 5 seconds)

**Responsive Check:**
- Open DevTools → Toggle device toolbar
- Test at 1200px (desktop) — 3-column stats layout
- Test at 800px (tablet) — 2-column stats layout
- Test at 375px (mobile) — 1-column stats layout

---

### Phase 2: Student Dashboard E2E Test

**Objective:** Verify student can log in and see progress dashboard with live API data

**Steps:**
1. Log out (top right menu)
2. Log in with:
   - Email: `student1@riverside.edu`
   - Password: `TestPassword123!`
3. Navigate to: `/students/class/cmsjazbw0000augct6nyutf9e/dashboard`
   - Or find in sidebar: "Classes" → "American Literature"
4. **Verify:**
   - ✅ Page loads without errors
   - ✅ Standards grid displays (2 standards)
   - ✅ Progress bars visible with color-coding
   - ✅ Mastery percentages shown
   - ✅ Trend indicators (↑ ↓ =) display
   - ✅ Status labels (mastered, in-progress, not-started)
   - ✅ Click to expand: Objectives section appears
   - ✅ Core Skill badges visible (blue)
   - ✅ Grades display for each objective
   - ✅ Celebration banner would show when mastering (test data shows no recent mastery)
   - ✅ Teacher message visible
   - ✅ No console errors

**Responsive Check:**
- Test at 600px (mobile) — standards stack vertically
- Test at 768px (tablet) — responsive layout
- Test at 1200px (desktop) — full layout

---

### Phase 3: Parent Dashboard E2E Test

**Objective:** Verify parent can log in and see child's progress with parent-friendly language

**Steps:**
1. Log out
2. Log in with:
   - Email: `parent0@example.com`
   - Password: `TestPassword123!`
3. Navigate to: `/parents/child/cmsjazbgb0003ugct0889inmo/dashboard`
   - Or find in sidebar: "My Child" or "Children"
4. **Verify:**
   - ✅ Page loads without errors
   - ✅ Header shows child name and class info
   - ✅ Teacher name and contact visible
   - ✅ Standards overview: status pills (On Track, Needs Support, Not Started)
   - ✅ Mastery percentages with progress bars
   - ✅ Click to expand: "What does this mean?" section appears
   - ✅ Click to expand: "How can I help?" suggestions appear
   - ✅ NO JARGON — language is parent-friendly
   - ✅ Objectives with status icons
   - ✅ Core Skill badges visible (blue)
   - ✅ Resources section (if any)
   - ✅ Master calendar events visible
   - ✅ No console errors

**Responsive Check:**
- Test at 375px (mobile) — 16px+ text, single column
- Test at 800px (tablet) — 2-column layout

---

## Authorization & Access Control Tests

### Test 1: Unauthorized Access
1. Log out completely
2. Try to access `/teachers/class/cmsjazbw0000augct6nyutf9e/dashboard`
3. **Expected:** Redirect to login page or error

### Test 2: Cross-User Access (Security)
1. Log in as student (`student1@riverside.edu`)
2. Try to access teacher dashboard URL
3. **Expected:** Access denied or error (student shouldn't see teacher dashboard)

### Test 3: Session Persistence
1. Log in as any user
2. Refresh page (Cmd+R or Ctrl+R)
3. **Expected:** Session persists, still logged in, dashboard data reloads

### Test 4: Logout
1. Click logout in top menu
2. **Expected:** Redirected to login page, session cleared

---

## API Call Verification

### Browser DevTools Network Tab

**What to check:**
1. Open DevTools (F12) → Network tab
2. Navigate to dashboard
3. Look for API calls:
   - **Teacher:** `GET /api/k12/classes/cmsjazbw0000augct6nyutf9e/class-dashboard`
   - **Teacher:** `GET /api/k12/classes/cmsjazbw0000augct6nyutf9e/master-calendar`
   - **Student:** `GET /api/k12/classes/.../student-progress?studentId=...`
   - **Parent:** `GET /api/k12/parents/children/.../progress`

4. **Verify:**
   - ✅ Status 200 (success)
   - ✅ Response time < 500ms
   - ✅ Response body is valid JSON
   - ✅ All expected fields present

### Check Browser Console

**What to look for:**
- ❌ No red errors
- ❌ No network failures
- ✅ Possible info/debug logs (OK)

---

## Error Handling Tests

### Test 1: Network Timeout
1. Open DevTools → Network tab → Throttle to "Slow 3G"
2. Load dashboard
3. **Verify:** Loading spinner shows, data loads eventually

### Test 2: API Error Response
1. Modify URL to invalid class ID: `/teachers/class/invalid-id/dashboard`
2. **Expected:** Graceful error message or 404 page

### Test 3: Missing Required Params
1. Try: `/teachers/class//dashboard` (no classId)
2. **Expected:** Error or redirect

---

## Performance Benchmarks

### Dashboard Load Time

| Component | Metric | Goal | Status |
|---|---|---|---|
| Teacher Dashboard | Page load | < 2s | ✅ |
| Student Dashboard | Page load | < 2s | ✅ |
| Parent Dashboard | Page load | < 2s | ✅ |

### Scan Time (Information Hierarchy)

| Dashboard | Item | Time | Goal |
|---|---|---|---|
| Teacher | Health score visible | < 1s | ✅ |
| Teacher | Quick stats readable | < 2s | ✅ |
| Teacher | Total scan | < 5s | ✅ |
| Student | Standards grid visible | < 1s | ✅ |
| Student | Progress clear | < 3s | ✅ |
| Parent | Child info visible | < 1s | ✅ |
| Parent | Plain language clear | < 3s | ✅ |

---

## Accessibility Checks

- [ ] Tab navigation works (Tab through all interactive elements)
- [ ] Color contrast adequate (test with WCAG AAA standard)
- [ ] Text readable at 200% zoom
- [ ] All buttons have visible focus state
- [ ] Form labels associated with inputs

---

## Issue Reporting Template

If you find an issue, document it:

```markdown
## [Issue Title]

**Component:** [Teacher/Student/Parent Dashboard]
**Environment:** [Desktop/Tablet/Mobile]
**Severity:** [Critical/High/Low]

**Steps to Reproduce:**
1. ...
2. ...
3. ...

**Expected Behavior:**
...

**Actual Behavior:**
...

**Screenshots/Logs:**
(if applicable)
```

---

## Checklist for Sign-Off

- [ ] All 3 dashboards load without errors
- [ ] Authenticated users see correct data
- [ ] Unauthorized access properly blocked
- [ ] All 6 required sections render (Teacher)
- [ ] All 5 required sections render (Parent)
- [ ] Student progress features work
- [ ] Responsive design verified at 3 breakpoints
- [ ] Performance benchmarks met
- [ ] No console errors
- [ ] API calls succeeding (200 status)

---

## Next Steps After E2E Testing

1. **Document any issues found** (use template above)
2. **Prioritize by severity**
3. **Create fixes** if needed
4. **Re-test** affected dashboards
5. **Sign off** on production readiness

---

**Ready to Test?**

Visit: `http://localhost:3000/auth/login`  
Use credentials above  
Report findings to: Development Team

