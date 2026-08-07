# T2: Student Progress Dashboard — Updated Brief

**Orchestrator**: Kyle (T1)  
**Window**: T2 (Student Experience)  
**Status**: 📋 READY TO START  
**Timeline**: 8-10 hours (parallel with T1 backend build)  

---

## What You're Building

A student-centric progress dashboard that shows:
- **Standards** the student is learning (grouped, ordered by progress)
- **Mastery %** per standard with visual progress bar
- **Objectives** under each standard with status badges
- **Celebration** when a skill is mastered (🎉)
- **Trend indicators** (↑ improving, = stable, ↓ declining)
- **Teacher message** providing encouragement/guidance

---

## Contract-First Development

### API You'll Consume

```
GET /api/k12/classes/[classId]/student-progress
```

**Response Shape** (see `/mocks/k12-api-responses.ts::mockStudentProgress`):

```typescript
{
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  standards: [
    {
      id: string;
      name: string;
      code: string; // CCSS.SCIENCE.HS.LS1.A
      masteryPercent: number; // 0-100
      status: "not-started" | "in-progress" | "mastered";
      trend: "up" | "stable" | "down";
      celebration: null | {
        objectiveId: string;
        objectiveText: string;
        celebrationType: "mastered" | "first-submission" | "high-score";
        message: string;
        timestamp: string;
      };
      objectives: [
        {
          id: string;
          text: string;
          status: "not-started" | "in-progress" | "mastered";
          isMandatory: boolean; // Core skill vs challenge
          submittedAt: string | null;
          grade: number | null;
        }
      ];
    }
  ];
  messageFromTeacher: string;
}
```

---

## How to Build Using Mocks

### Step 1: Import Mock Data
```typescript
// In your component
import { mockStudentProgress, useStudentProgress } from '@/mocks/k12-api-responses';

// Use in development
const { data, loading } = useStudentProgress(classId);
```

### Step 2: Build the Component
**File**: `/app/components/StudentProgressDashboard.tsx`

**Required elements**:
1. **Header** — Student name, class name, encouragement message
2. **Standards Grid** — One card per standard
   - Standard name + code
   - Progress bar (color: green ≥75%, yellow 50-75%, red <50%)
   - Mastery % in large text
   - Trend indicator (↑↓=)
   - Status label ("On track!", "Almost there", "Just started")
3. **Objectives List** (expandable within each standard card)
   - Objective text
   - Badge: "Core Skill" (blue) if `isMandatory`, "Challenge" (purple) if not
   - Status dot: green (mastered), yellow (in progress), gray (not started)
   - Grade if submitted
4. **Celebration Banner** (full-width, appears at top when celebration object present)
   - Large emoji + message
   - Highlight color: gold/yellow
   - Disappears on scroll or timer (3 seconds)

### Step 3: Styling
- **Mobile-first**: Test on phone viewport (375px width)
- **Colors match terminology config**:
  - Core Skill badge: `#3b82f6` (blue)
  - Challenge badge: `#8b5cf6` (purple)
  - Progress bar: green `#10b981`, yellow `#f59e0b`, red `#ef4444`
- **No animations** on progress bar (avoid distraction)
- **Typography**: Clear hierarchy (h1: name, h2: standard, p: objective)

---

## Success Criteria

✅ Component displays all standards from mock data  
✅ Progress bars render correctly (color changes based on %)  
✅ Mastery % and trend indicator visible  
✅ Celebration banner appears (use mock data with celebration object)  
✅ Mobile viewport responsive (no horizontal scroll)  
✅ Core Skill badges visible and colored correctly  
✅ No console errors  

---

## When T1 Finishes Backend (Integration: ~1 hr)

1. Replace import:
```typescript
// Before
import { mockStudentProgress } from '@/mocks/k12-api-responses';

// After
const response = await fetch(`/api/k12/classes/${classId}/student-progress`);
const data = await response.json();
```

2. Test with real API (should work without other changes)
3. Watch for data differences and report to T1 if response shape differs

---

## Questions to Ask Before Starting

- Should celebration be dismissible or auto-dismiss?
- Do we show objectives in a collapsed/expanded view or always expanded?
- Should students see teacher feedback in this view or separate screen?
- Do we track "time since mastery" for motivation (e.g., "Mastered 2 days ago")?

---

## Blockers / Dependencies

None! You can start immediately with mock data.  
T1 will notify you when real API is ready (~24 hrs).

---

## Your Deliverable

When complete, send to T1 (me):
1. Commit with new component + route
2. Screenshot of dashboard (desktop + mobile)
3. Any blockers or questions
4. Time spent

Then we swap mock for real API and ship to production.
