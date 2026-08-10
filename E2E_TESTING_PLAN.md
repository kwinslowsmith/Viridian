# Phase 1 K12 LMS Dashboard — End-to-End Testing Plan

**Date:** August 10, 2026  
**Status:** 🚀 Testing Phase Initiated  
**Goal:** Validate all 3 dashboards with authenticated users in realistic workflows  

---

## Test Scope

### Components Under Test
1. **Student Progress Dashboard** (`/app/students/class/[classId]/dashboard`)
2. **Parent Dashboard** (`/app/parents/child/[childId]/dashboard`)
3. **Teacher Class Dashboard** (`/app/teachers/class/[classId]/dashboard`)

### Test Scenarios
- User authentication (login flow)
- Dashboard data loading with live APIs
- Component rendering accuracy
- Error handling (network failures, unauthorized access)
- Responsive design (desktop/tablet/mobile)
- Performance (load time, scan time)

---

## Test Users & Data

### Teacher User
**Email:** `teacher1@riverside.edu`  
**Password:** (to be set)  
**Classes:** 
- American Literature, Period 3 (ID: `cmsjazbw0000augct6nyutf9e`)
- Algebra II, Period 4 (ID: `cmsjazbw7000mugct2kyzwslc`)

### Student User
**Email:** `student1@riverside.edu`  
**Password:** (to be set)  
**Class:** American Literature, Period 3  
**Enrolled ID:** (from enrollments table)

### Parent User
**Email:** (parent email TBD)  
**Password:** (to be set)  
**Child ID:** `cmsjazbgb0003ugct0889inmo`

---

## Test Execution Steps

### Phase 1: Authentication Setup
- [ ] Verify NextAuth configuration
- [ ] Test login endpoint
- [ ] Confirm session handling
- [ ] Test logout flow

### Phase 2: Teacher Dashboard E2E
- [ ] Login as teacher
- [ ] Navigate to class dashboard
- [ ] Verify all 6 sections load with real data
- [ ] Check health score calculation
- [ ] Verify intervention groups display
- [ ] Test master calendar rendering
- [ ] Check performance (load time < 2s)
- [ ] Test on tablet viewport (800px)
- [ ] Test error states (unauthorized, network error)

### Phase 3: Student Dashboard E2E
- [ ] Login as student
- [ ] Navigate to class dashboard
- [ ] Verify standards grid loads
- [ ] Check progress bars and mastery %
- [ ] Test expandable objectives
- [ ] Verify celebration banner (if applicable)
- [ ] Check mobile viewport (600px)
- [ ] Test trend indicators display

### Phase 4: Parent Dashboard E2E
- [ ] Login as parent
- [ ] Navigate to child dashboard
- [ ] Verify header with child info
- [ ] Check "What does this mean?" sections
- [ ] Verify "How can I help?" suggestions
- [ ] Check master calendar rendering
- [ ] Test plain language (no jargon)
- [ ] Test mobile viewport (375px)

### Phase 5: Cross-Component Testing
- [ ] Multiple users logged in simultaneously
- [ ] Browser back/forward navigation
- [ ] Refresh dashboard (session persistence)
- [ ] Log out and verify redirects

### Phase 6: Performance & UX
- [ ] Measure dashboard load time (goal: < 2s)
- [ ] Measure scan time (goal: < 5s)
- [ ] Check for console errors
- [ ] Verify accessibility (keyboard navigation, color contrast)
- [ ] Test on slow network (simulate 3G)

---

## Success Criteria

✅ **All dashboards load without errors**  
✅ **Authenticated users see correct data**  
✅ **Unauthorized access properly blocked**  
✅ **All API responses match expected schema**  
✅ **Responsive design works at all breakpoints**  
✅ **Performance meets benchmarks**  
✅ **No console errors or TypeScript warnings**  
✅ **Error handling works gracefully**  

---

## Known Limitations

- No grading submission flow yet (Phase 2)
- No intervention group management UI (Phase 2)
- No study guides (Phase 2)
- No messaging system (Phase 2)

---

## Test Environment

**Dev Server:** localhost:3000  
**Database:** PostgreSQL (seeded with test data)  
**Browser:** Chrome/Firefox (latest)  

---

## Reporting

Issues found will be tracked and prioritized:
- 🔴 **Critical:** Blocks user workflow
- 🟡 **High:** Significant feature gap
- 🟢 **Low:** Minor cosmetic issue

---

**Next Step:** Begin Phase 1 authentication setup testing

