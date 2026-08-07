# T4: Teacher Class Dashboard — Updated Brief

**Orchestrator**: Kyle (T1)  
**Window**: T4 (Teacher Experience)  
**Status**: 📋 READY TO START  
**Timeline**: 8-10 hours (parallel with T1 backend build)  

---

## What You're Building

A teacher-centric dashboard showing:
- **Class mastery %** per standard (at-a-glance overview)
- **Struggling skills** (objectives where <60% of students at mastery)
- **Intervention groups** (reteach sessions for struggling students)
- **Master calendar** (school-wide assessments + daily class calendar)
- **Pending submissions** count
- **Class health score** (0-100 overall progress)

**GOAL**: Teachers see patterns and know immediately which students need support.

---

## Contract-First Development

### APIs You'll Consume

```
GET /api/k12/classes/[classId]/class-dashboard
GET /api/k12/classes/[classId]/master-calendar
```

**Response Shape** (see `/mocks/k12-api-responses.ts::mockTeacherClassDashboard`):

```typescript
// GET /api/k12/classes/[classId]/class-dashboard
{
  classId: string;
  className: string;
  gradeLevel: number;
  period: string; // "Period 3"
  enrollmentCount: number;
  classMasteryByStandard: [
    {
      standardId: string;
      standardName: string;
      classMasteryPercent: number; // Average mastery % for class
      studentsMasteredCount: number; // How many students at mastery
      studentsInProgressCount: number;
      studentsNotStartedCount: number;
      trend: "up" | "stable" | "down";
    }
  ];
  strugglingSkills: [
    {
      objectiveId: string;
      objectiveText: string;
      standardId: string;
      standardName: string;
      studentCount: number; // How many students stuck
      percentageStuck: number; // % of class stuck (e.g., 79%)
      severity: "critical" | "moderate" | "minor";
    }
  ];
  interventionGroups: [
    {
      id: string;
      name: string;
      objectiveId: string;
      studentCount: number;
      meetingSchedule: string; // "Tuesday/Thursday after school"
      startDate: string;
    }
  ];
  masterCalendar: [
    {
      id: string;
      date: string;
      type: "assessment" | "lesson" | "event" | "holiday";
      name: string;
      standardsAssessed: string[];
      studentCount: number;
    }
  ];
  pendingSubmissionsCount: number;
  classHealthScore: number; // 0-100
  lastUpdate: string;
}
```

---

## How to Build Using Mocks

### Step 1: Import Mock Data
```typescript
import { mockTeacherClassDashboard, useTeacherClassDashboard } from '@/mocks/k12-api-responses';

const { data, loading } = useTeacherClassDashboard(classId);
```

### Step 2: Build the Component
**File**: `/app/components/TeacherClassDashboard.tsx`

**Required sections**:

1. **Header**
   - Class name, period, enrollment count
   - Class Health Score (large, prominent: green if >70, yellow if 40-70, red if <40)
   - Last updated time

2. **Quick Stats** (horizontal cards)
   - "Pending submissions: 12" (clickable → grading inbox)
   - "Mastery summary: 72% average"
   - "Students needing support: 8"

3. **Mastery by Standard** (table or card grid)
   - Standard name + code
   - Class mastery % (large text, color-coded)
   - Student breakdown: "22 mastered | 5 in progress | 1 not started"
   - Trend indicator (↑ ↓ =) with direction label

4. **Struggling Skills** (high-priority section)
   - Red banner if any "critical" severity skills
   - Sorted by percentage stuck (highest first)
   - **Card per skill**:
     - Objective text (bold)
     - Standard it belongs to
     - "18 students (64%) stuck on this"
     - Severity indicator (🔴 Critical / 🟡 Moderate / 🟢 Minor)
     - **Action button**: "View students" or "Create reteach group"

5. **Intervention Groups**
   - List of active reteach/support groups
   - Group name + objective focus
   - Meeting schedule + start date
   - Student count
   - Action: "Edit" or "Mark complete"

6. **Master Calendar** (separate tab or collapsible)
   - Calendar view or list of upcoming events
   - Date + event type + standards assessed
   - Color-code by type:
     - Blue = lesson
     - Orange = assessment
     - Red = high-stakes
     - Gray = school event

---

## Design Principles

**This is a TEACHER view, not admin:**
- Focus on action (what should I do NOW?)
- Not about celebration (that's for students)
- Show problems first (struggling skills section prominent)
- Provide immediate solutions (intervention groups, reteach action)

**Scanning behavior:**
- Teachers need to find "what's wrong?" in <5 seconds
- Red text for critical struggles
- Card layout (scannable vs dense table)
- Numbers + context ("8 students" not just "8")

---

## Styling

- **Professional, not playful**: Teachers are busy
- **Color scheme**:
  - Class health: Green `#10b981`, Yellow `#f59e0b`, Red `#ef4444`
  - Struggling skill severity:
    - Critical: `#ef4444` (red)
    - Moderate: `#f59e0b` (orange)
    - Minor: `#9ca3af` (gray)
- **Typography**: Clear hierarchy, readable font sizes
- **Mobile-friendly**: Teachers use tablets in classroom
- **One-screen view**: No unnecessary scrolling (limit to 1200px width)

---

## Success Criteria

✅ Displays class name, period, enrollment count  
✅ Class Health Score prominent + color-coded  
✅ Quick stats visible (pending submissions, mastery summary, support needs)  
✅ Class mastery by standard shows % + student breakdowns + trend  
✅ Struggling skills section prominent with severity indicators  
✅ Intervention groups listed with schedule + student count  
✅ Master Calendar events visible  
✅ No console errors  
✅ Works on desktop + tablet viewport  
✅ Can scan dashboard in <5 seconds  

---

## When T1 Finishes Backend (Integration: ~1 hr)

1. Replace mock import with real API calls (two endpoints)
2. Test that numbers match expected data
3. Verify struggling skills ordering is correct
4. Report any data shape differences to T1

---

## Important Coordination Notes

- **New Architecture**: This dashboard runs on the new federation model (StandardsDomain, verification levels)
- **Visibility**: Dashboard respects `visibility` enum (shows only class + org-shared content)
- **Intervention Groups**: These are new in the new architecture (need T1 to create endpoints for manage/create/update)
- **Master Calendar**: Separate from daily class calendar (school-wide events vs daily lessons)

---

## Blockers / Dependencies

None! Start immediately with mock data.  
T1 will notify when real APIs ready (~24 hrs).

**Note on Intervention Groups**: For now, display the mock groups. T1 will add create/edit endpoints in Phase 2.

---

## Your Deliverable

When complete:
1. Commit with new component + route
2. Screenshots showing:
   - Full dashboard (header + stats + mastery table)
   - Struggling skills section
   - Intervention groups list
   - Master Calendar
3. Feedback on information architecture (is this scannable?)
4. Any questions about which data matters most
5. Time spent

We'll integrate with real API and ship.

---

## Questions Before Starting

- Should "View students" button in struggling skills show a modal or navigate to new page?
- Should intervention groups be editable directly from dashboard or link to management page?
- Does the Master Calendar need to show daily lesson details or just major events?
- Should teachers be able to create intervention groups from this dashboard or only in a separate admin area?
