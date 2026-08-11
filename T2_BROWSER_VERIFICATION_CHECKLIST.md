# T2: Browser Verification Checklist — Phase 1 + Phase 2

**Date:** August 10, 2026  
**Student:** T2 (Student Experience)  
**Live URL:** https://viridian.vercel.app  
**Test Credentials:** `student1@riverside.edu` / `TestPassword123!`  
**Test Class:** American Literature, Period 3 (`cmsjazbw0000augct6nyutf9e`)

---

## Pre-Test Setup

- [ ] Open https://viridian.vercel.app in browser
- [ ] Clear browser cache and cookies (or use incognito window)
- [ ] Open browser DevTools (F12) with Console tab visible
- [ ] Set mobile viewport to test responsive design (DevTools → Device Toolbar)

---

## Phase 1: Student Progress Dashboard Testing

**Route:** `/students/dashboard`  
**Component:** K12StudentProgressDashboard

### Header & Navigation
- [ ] Page title displays student name
- [ ] Class name displays correctly
- [ ] Teacher message visible (if provided)
- [ ] Header layout is clean and readable

### Standards Grid
- [ ] All standards load and display
- [ ] Progress bars render with correct colors:
  - [ ] Green (≥75% mastery)
  - [ ] Yellow (50-75% mastery)
  - [ ] Red (<50% mastery)
- [ ] Mastery percentages display (e.g., "85%")
- [ ] Trend indicators display correctly (↑ ↓ =)
- [ ] Status labels display correctly ("On Track!", "Almost there", "Just started")

### Expandable Objectives
- [ ] Click standard card to expand → objectives appear
- [ ] Click standard card again to collapse → objectives disappear
- [ ] Expand icon changes (▶ → ▼ and back)
- [ ] Each objective shows:
  - [ ] Status dot (green/yellow/gray)
  - [ ] Objective text
  - [ ] Core Skill badge (blue, if mandatory)
  - [ ] Challenge badge (purple, if optional)
  - [ ] Grade (if submitted)
  - [ ] Submission date (if submitted)

### Celebration Banner (If Applicable)
- [ ] Banner appears at top when student mastered something
- [ ] Shows emoji (🎉) and congratulations message
- [ ] Auto-dismisses after 3 seconds
- [ ] Does not reappear unless refreshing page

### Mobile Responsiveness (Viewport Tests)
- [ ] At 375px: All elements visible, no horizontal scroll
- [ ] At 600px: Optimal layout, responsive spacing
- [ ] At 800px: Enhanced spacing, still mobile-first
- [ ] At 1024px+: Full desktop layout

### No Console Errors
- [ ] Open DevTools Console
- [ ] No red error messages
- [ ] No warnings about missing props

---

## Phase 2: Integrated Class Dashboard Testing

**Route:** `/students/class/[classId]/dashboard`  
**Test URL:** `https://viridian.vercel.app/students/class/cmsjazbw0000augct6nyutf9e/dashboard`

### Tab Navigation
- [ ] Two tabs visible: "📊 Progress" and "📚 Standards & Objectives"
- [ ] Progress tab is active by default
- [ ] Click Standards & Objectives tab → switches to that view
- [ ] Click Progress tab → switches back
- [ ] Active tab has blue bottom border
- [ ] Tab switching is smooth (no flicker)

### Tab 1: Progress (Phase 1 Component)
- [ ] K12StudentProgressDashboard component loads
- [ ] Same as Phase 1 testing above
- [ ] Component fills available space
- [ ] No layout issues or overlapping elements

### Tab 2: Standards & Objectives (Phase 2 Component)
- [ ] StandardsObjectivesStudent component loads
- [ ] Standards display with:
  - [ ] Standard code and name
  - [ ] Unit information (📚 unit name)
  - [ ] Student's personal mastery status and percentage
  - [ ] Color-coded status indicator (green/yellow/red)
  - [ ] "Required: X | Available: Y" text
  - [ ] "Pass: 80%" threshold
- [ ] Click standard to expand → objectives appear
- [ ] Each objective shows:
  - [ ] Label (Obj 2.1.A)
  - [ ] Objective text
  - [ ] Required/Optional badge
  - [ ] Status dot color matches mastery level
  - [ ] Mastery status label (✓ Proficient, ⏳ Developing, etc.)
  - [ ] Grade and submission date
  - [ ] Feedback from teacher (in italic)
  - [ ] Mastery summary (in yellow box)
  - [ ] Materials section with links
  - [ ] Teacher notes (in blue box)

### Tab 2: Color Coding
- [ ] Green: Proficient (≥75%)
- [ ] Yellow: Developing (50-75%)
- [ ] Red: Approaching (25-50%)
- [ ] Dark red: Needs Support (<25%)
- [ ] Colors consistent across both tabs

### Responsive Design (All Viewports)
- [ ] Tab navigation adapts to screen size
- [ ] Content is readable at all widths
- [ ] No content cut off at 375px width
- [ ] Touch targets are large enough (48px+)
- [ ] Mobile layout is single-column
- [ ] Desktop layout uses available space

---

## Data Integrity Testing

### Progress Tab Data
- [ ] Standards match what's in test data (2 standards)
- [ ] Objective counts match per standard
- [ ] Grades display correctly (70-92 range)
- [ ] Submission dates are formatted correctly
- [ ] Mastery percentages make sense (calculated correctly)

### Standards & Objectives Tab Data
- [ ] Same standards as Progress tab
- [ ] Objectives in Standards tab match Progress tab
- [ ] Mastery percentages consistent across tabs
- [ ] Grades match between tabs
- [ ] Teacher notes are visible and readable

### API Response Validation
- [ ] Open DevTools Network tab
- [ ] Switch to Progress tab → observe `/api/k12/classes/.../student-progress` call
- [ ] Response shows correct student ID
- [ ] Response includes all standards and objectives
- [ ] Switch to Standards & Objectives tab → observe `/api/k12/classes/.../standards-objectives-student` call (once T1 provides)
- [ ] Response has same standards and objectives

---

## Performance Testing

- [ ] Page loads in <3 seconds on desktop
- [ ] Page loads in <4 seconds on mobile (5G simulation)
- [ ] Tab switching is instant (no loading state)
- [ ] Expanding/collapsing standards is smooth
- [ ] No layout shift when content loads
- [ ] No memory leaks (keep DevTools open 2+ minutes, check memory usage)

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab key navigates between tabs
- [ ] Enter key activates tab
- [ ] Tab key can focus on expand/collapse buttons
- [ ] Tab key can focus on material links

### Color Contrast
- [ ] All text is readable on background colors
- [ ] Status indicators are distinguishable (not color-only)
- [ ] Links are underlined or otherwise distinguished

### Screen Reader (Optional)
- [ ] Tab labels are announced correctly
- [ ] Expand/collapse state is announced
- [ ] Status labels are announced (e.g., "Proficient")

---

## Known Issues & Notes

### With Mock Data
- Teacher notes and materials are from mock data
- Submission dates are fixed (won't change on reload)
- Grades are realistic but not from real assessments

### Awaiting T1 APIs
- Standards & Objectives tab currently uses mock data
- Once T1 provides endpoint, will switch to live API
- Functionality will remain the same, data will be from database

---

## Bug Report Template

If you find an issue, document it:

**Bug Title:** [One-line description]

**Severity:** [ ] Critical [ ] High [ ] Medium [ ] Low

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**

**Actual Result:**

**Environment:** 
- Device: [Desktop/Mobile]
- Viewport: [Width]px
- Browser: [Chrome/Firefox/Safari]
- URL: [Full URL where issue occurs]

**Screenshot/Video:** [If applicable]

**Console Errors:** [Copy from DevTools Console]

---

## Sign-Off

| Check | Status | Date | Notes |
|-------|--------|------|-------|
| Progress Tab Complete | ☐ Pass / ☐ Fail | | |
| Class Dashboard Complete | ☐ Pass / ☐ Fail | | |
| Mobile Responsive | ☐ Pass / ☐ Fail | | |
| No Console Errors | ☐ Pass / ☐ Fail | | |
| All Features Working | ☐ Pass / ☐ Fail | | |
| **Overall Status** | ☐ **READY FOR PROD** / ☐ **NEEDS FIXES** | | |

---

## Test Results Summary

**Tester:** [Your Name]  
**Date Tested:** [Date]  
**Time Spent:** [Hours]  
**Issues Found:** [Number]  
**Critical Issues:** [Number]  
**Overall Assessment:** [Ready / Needs Fixes / Ready with Notes]

---

**Next Steps:**
- If READY: Release to production (auto-deployed to Vercel)
- If NEEDS FIXES: File bugs and assign to T2 for resolution
- If READY WITH NOTES: Document known limitations and proceed

---

Last Updated: August 10, 2026 by T2
