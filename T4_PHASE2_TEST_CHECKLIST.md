# T4 Phase 2 Standards & Objectives Test Checklist

**Component:** StandardsObjectivesTeacher.tsx  
**Route:** `/teachers/class/[classId]/standards-objectives`  
**Test Class:** American Literature, Period 3 (ID: `cmsjazbw0000augct6nyutf9e`)  
**Live URL:** https://viridian.vercel.app  
**API Endpoint:** `GET /api/k12/classes/[classId]/standards-objectives-teacher`  

---

## Pre-Test Verification

- [x] Component file exists: `/app/components/StandardsObjectivesTeacher.tsx` (328 lines)
- [x] Route page exists: `/app/teachers/class/[classId]/standards-objectives/page.tsx`
- [x] Component imports properly: `StandardsObjectivesTeacher`
- [x] Route page imports component: ✓
- [x] Authentication check in place: `getServerSession` with redirect
- [x] API endpoint deployed: Live at https://viridian.vercel.app
- [x] Test data seeded: American Literature class with standards/objectives

---

## Browser Testing Checklist

### Login & Navigation
- [ ] Navigate to https://viridian.vercel.app/auth/login
- [ ] Login with: `teacher1@riverside.edu` / `TestPassword123!`
- [ ] Successfully authenticated (redirects to dashboard)
- [ ] Navigate to: `https://viridian.vercel.app/teachers/class/cmsjazbw0000augct6nyutf9e/standards-objectives`

### Page Load & Structure
- [ ] Page loads without errors (check console for errors)
- [ ] Heading "📚 Standards & Objectives" displays
- [ ] Page styled correctly (background color, padding, borders)
- [ ] Loading spinner doesn't appear (data loads immediately)
- [ ] No 404 or 403 errors

### Standards Display
- [ ] At least 1 standard card displays
- [ ] Standard shows ALL required fields:
  - [ ] Standard code (e.g., "2.1")
  - [ ] Standard name
  - [ ] Unit name (📚 prefix)
  - [ ] Required objective count
  - [ ] Total objective count
  - [ ] Class pass percentage
- [ ] Each standard has expandable button (▶ / ▼)

### Standard Expansion/Collapse
- [ ] Click standard header → expands (▼ indicator)
- [ ] Click again → collapses (▶ indicator)
- [ ] Animation is smooth
- [ ] Content doesn't flicker

### Objectives Display
- [ ] When expanded, objectives display
- [ ] Each objective shows:
  - [ ] Label (e.g., "Obj 2.1.A")
  - [ ] Text (objective statement)
  - [ ] Required/Optional badge (RED for required, gray for optional)
  - [ ] Description (if present)

### Assessment Frequency Warnings
- [ ] Yellow warning banner displays (if objective needs assessment)
- [ ] Warning shows: "⚠️ Needs Assessment (X days ago)"
- [ ] Warning styling is consistent (yellow background, left border)

### Student Progress Grid
- [ ] Grid displays for each objective
- [ ] All students from class appear
- [ ] Each student card shows:
  - [ ] Student name
  - [ ] Mastery icon (✓, ⏳, ⚠️, or ○)
  - [ ] Mastery percentage (0-100%)
  - [ ] Grade letter (if present)
  - [ ] Icon color matches mastery level:
    - [ ] ✓ Green for proficient (80%+)
    - [ ] ⏳ Yellow for developing (60-79%)
    - [ ] ⚠️ Orange for approaching (1-59%)
    - [ ] ○ Gray for not started (0%)
- [ ] Grid is responsive (wraps on narrow screens)

### Materials Section
- [ ] Materials display (if any)
- [ ] Each material shows:
  - [ ] Icon (📄 material, 📝 assessment, 🎥 video, 🔗 link)
  - [ ] Title
  - [ ] [View] button
- [ ] Materials are clickable (button styling)
- [ ] Border and styling consistent with spec

### Teacher Notes
- [ ] Teacher notes display (if present)
- [ ] Text is in italic format
- [ ] Notes are readable and properly formatted
- [ ] Boxed section with border

### Responsive Design
**Desktop (1200px+):**
- [ ] All content visible
- [ ] Grid layout looks correct
- [ ] Text is legible (16px+ font)
- [ ] No horizontal scrolling

**Tablet (800px):**
- [ ] Page responsive
- [ ] Standards stack properly
- [ ] Grid wraps appropriately

**Mobile (375px):**
- [ ] Page readable without zoom
- [ ] Text is large enough (16px+)
- [ ] Touch targets are adequate (44px+)
- [ ] No content overflow
- [ ] Expandable sections work smoothly

### Performance
- [ ] Page loads in < 3 seconds
- [ ] No lag when expanding/collapsing
- [ ] No console errors (F12 → Console tab)
- [ ] No TypeScript warnings
- [ ] No visual glitches

### Error Handling
- [ ] No 401 or 403 errors (auth should work)
- [ ] No 404 errors (route exists)
- [ ] No data fetch errors
- [ ] Error message displays clearly (if any)

### API Integration
- [ ] Network tab (F12) shows:
  - [ ] GET request to `/api/k12/classes/[classId]/standards-objectives-teacher`
  - [ ] Response status 200 OK
  - [ ] Response contains `standards` array
  - [ ] Response includes all required fields
- [ ] No failed API calls

---

## Success Criteria (All Must Pass)

✅ Page loads without errors  
✅ Standards expand/collapse smoothly  
✅ All objectives display with correct badges  
✅ Student progress grid shows all students  
✅ Mastery icons and colors are correct  
✅ Assessment frequency warnings display  
✅ Materials and teacher notes visible  
✅ Responsive at all breakpoints  
✅ Performance < 3s load time  
✅ No console errors  
✅ API returns 200 with complete data  

---

## Known Issues / Notes

- If "No standards available" message shows: class may not have standards assigned
- If student progress is empty: check that assessments exist in database
- Assessment frequency warning only shows if last assessment > 14 days ago

---

## Test Results

| Item | Result | Notes |
|------|--------|-------|
| Page Load | ✓/✗ | |
| Standards Display | ✓/✗ | |
| Expand/Collapse | ✓/✗ | |
| Objectives | ✓/✗ | |
| Student Grid | ✓/✗ | |
| Assessment Warnings | ✓/✗ | |
| Materials | ✓/✗ | |
| Teacher Notes | ✓/✗ | |
| Mobile Responsive | ✓/✗ | |
| Performance | ✓/✗ | (actual time: ___) |
| No Console Errors | ✓/✗ | |
| API Working | ✓/✗ | (status: ___) |

**Overall Status:** ✅ PASS / ❌ FAIL / 🔶 PARTIAL  

**Issues Found:**
(List any issues discovered during testing)

---

## Next Steps After Testing

1. **If all tests pass:**
   - Integration: Add tabs to TeacherClassDashboard (Dashboard, Standards & Objectives, etc.)
   - Remove "Skill Setup" tab from navigation
   - Coordinate with T2 to integrate student component

2. **If issues found:**
   - Document specific failure case
   - Fix in code
   - Retest

3. **Performance optimization** (if needed):
   - Check API response time
   - Optimize data fetching
   - Consider caching/memoization

---

Last Updated: 2026-08-10 (Phase 2 E2E Testing Ready)
