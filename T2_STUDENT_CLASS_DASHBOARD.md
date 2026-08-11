# T2: Student Class Dashboard — Phase 1 + Phase 2 Integration

**Date:** August 10, 2026  
**Component:** StudentClassDashboard (tabbed interface)  
**Status:** ✅ Complete, ready for API integration

---

## Overview

Student Class Dashboard provides a unified interface for students to access both Phase 1 (progress tracking) and Phase 2 (standards & objectives) in a single view with tab navigation.

**URL:** `/students/class/[classId]/dashboard`  
**Example:** `/students/class/cmsjazbw0000augct6nyutf9e/dashboard`

---

## Features

### Tab 1: Progress (Phase 1)
- **Component:** K12StudentProgressDashboard
- **Shows:** Student's progress toward mastery on learning standards
- **Features:**
  - Standards grid with color-coded progress bars
  - Mastery percentages + trend indicators
  - Status labels ("On Track!", "Almost there", "Just started")
  - Expandable objectives with Core Skill/Challenge badges
  - Status dots (green=mastered, yellow=in-progress, gray=not-started)
  - Grade display + submission dates
  - Celebration banner on achievement

### Tab 2: Standards & Objectives (Phase 2)
- **Component:** StandardsObjectivesStudent
- **Shows:** Detailed view of each standard with student's personal mastery status
- **Features:**
  - Expandable standards with unit information
  - Personal mastery status for each standard (% + proficient/developing/approaching/needs_support)
  - Required vs Optional objective badges
  - Expandable objectives showing:
    - Student's mastery status with grade and submission date
    - Feedback from teacher
    - Downloadable materials
    - Teacher notes
    - Mastery summary

---

## How It Works

```
/students/class/[classId]/dashboard
         ↓
    StudentClassDashboard (page.tsx)
         ↓
    ┌────┴─────┐
    ↓          ↓
[Progress]  [Standards & Objectives]
    ↓          ↓
K12Student   Standards
Progress     Objectives
Dashboard    Student
```

### Tab Switching
- User clicks tab (Progress or Standards & Objectives)
- State updates to show corresponding component
- Smooth transition with visual indicator (bottom border on active tab)

### API Calls
- **Tab 1 (Progress):** `GET /api/k12/classes/[classId]/student-progress?studentId={userId}`
- **Tab 2 (Standards & Objectives):** `GET /api/k12/classes/[classId]/standards-objectives-student?studentId={userId}`

Both use mock data currently; will switch to live API once T1 provides endpoints.

---

## Mobile Responsiveness

- **Phone (375px):** Full width, stacked layout, readable text
- **Tablet (600px):** Optimized for smaller screens
- **Desktop (1024px+):** Full featured experience

Tab navigation adapts automatically; content fills available space.

---

## Testing

### With Mock Data (No Auth Required)
1. Navigate to: `/students/standards-objectives-test` (standards view only)
2. Verify component renders
3. Click to expand standards/objectives

### With Live Data (Auth Required)
1. Login as student: `student1@riverside.edu` / `TestPassword123!`
2. Navigate to: `/students/class/cmsjazbw0000augct6nyutf9e/dashboard`
3. Switch between Progress and Standards & Objectives tabs
4. Verify both tabs load data correctly

### Test Checklist
- [ ] Tab navigation works (click Progress → Standards, and back)
- [ ] Progress tab loads student's standards and objectives
- [ ] Standards tab loads standards with mastery status
- [ ] Expandable sections work correctly
- [ ] Color coding matches design system
- [ ] Mobile layout responsive at 375px, 600px, 800px, 1024px
- [ ] No console errors
- [ ] Loading states display correctly
- [ ] Error states display correctly (if API fails)

---

## Integration Checklist

When T1 provides the backend APIs:

### Step 1: Update API Endpoints
In `StandardsObjectivesStudent.tsx` (lines 105-113), uncomment the live API fetch:
```typescript
// Uncomment this:
const res = await fetch(
  `/api/k12/classes/${classId}/standards-objectives-student?studentId=${session.user.id}`
);

// Comment out this:
// const { mockStudentStandardsObjectives } = await import('@/mocks/k12-api-responses');
// setData(mockStudentStandardsObjectives);
```

### Step 2: Test Integration
```bash
npm run build          # Verify TypeScript compilation
npm run dev            # Start dev server
# Navigate to /students/class/[classId]/dashboard
# Test both tabs with live data
```

### Step 3: Browser Testing
- [ ] Tab switching works with live data
- [ ] Progress loads from T1 API
- [ ] Standards & Objectives loads from T1 API
- [ ] No data mismatches between APIs
- [ ] All interactive features work

### Step 4: Deployment
- Push to main branch
- Vercel auto-deploys
- Verify on production site

---

## Future Enhancements

### Short-term (Post-Phase-2)
- Add "Last Synced" timestamp on each tab
- Add "Compare with Class" view in Progress tab
- Add "Share Progress with Parents" button

### Medium-term
- Add "Recommendations" tab (AI-suggested next objectives)
- Add "Resources" tab (curated study materials)
- Add "Calendar" tab (upcoming assessments)

---

## File Locations

| File | Purpose |
|------|---------|
| `app/students/class/[classId]/dashboard/page.tsx` | Main page component with tabs |
| `app/components/K12StudentProgressDashboard.tsx` | Phase 1 progress view |
| `app/components/StandardsObjectivesStudent.tsx` | Phase 2 standards & objectives view |
| `mocks/k12-api-responses.ts` | Mock data for testing |

---

## Known Limitations

1. **API Endpoint Dependency:** Requires T1 to provide `/api/k12/classes/[classId]/standards-objectives-student` endpoint
2. **Mock Data Only:** Currently using mock data; real data will show once APIs are live
3. **No Real-time Sync:** Page does not auto-refresh; user must refresh to see latest data

---

## Author & Status

**Built by:** T2 (Student Experience)  
**Phase 1 Component Status:** ✅ Complete, live on Vercel  
**Phase 2 Component Status:** ✅ Complete, awaiting T1 API  
**Integrated Dashboard Status:** ✅ Complete, ready to test  

Last Updated: August 10, 2026
