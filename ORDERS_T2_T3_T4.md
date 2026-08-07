# T2-T4 Work Orders

## T2: Student Experience — Integration Sprint

**Status:** Component complete. **Task:** Integrate live API.

### What You're Doing
Replace mock data with real API endpoint. Test the full flow with live responses.

### Step 1: Update Component to Call Live API
**File:** `/app/components/K12StudentProgressDashboard.tsx` (or wherever your component lives)

Replace this:
```typescript
import { mockStudentProgress } from '@/mocks/k12-api-responses';
const { data, loading } = useStudentProgress(classId);
```

With this:
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchProgress = async () => {
    const response = await fetch(
      `/api/k12/classes/${classId}/student-progress?studentId=${studentId}`
    );
    const result = await response.json();
    setData(result);
    setLoading(false);
  };
  fetchProgress();
}, [classId, studentId]);
```

### Step 2: Test
1. Open your student dashboard page
2. Verify all standards load (will be empty until T1 seeds data)
3. Check console for API errors
4. Test mobile viewport

### Step 3: Report
- Screenshots of dashboard (desktop + mobile)
- Any API response differences
- Time spent

**ETA:** 1-2 hours

---

## T3: Parent Experience — Build Sprint

**Status:** Ready to start. **Task:** Build the parent dashboard component.

### What You're Building
Parent-friendly progress view for one child. Plain language, no jargon, mobile-first.

### Your Brief
Read `/BRIEFS/T3_PARENT_DASHBOARD_BRIEF.md` for full spec.

### Quick Summary
- **Endpoint:** `GET /api/k12/parents/children/[childId]/progress`
- **Response shape:** See `/mocks/k12-api-responses.ts::mockParentProgress`
- **Key sections:**
  1. Header: Child name, class, teacher contact
  2. Standards overview: Status pills (On Track / Needs Support / Not Started)
  3. Expandable standard details: "What does this mean?" + "How can I help?"
  4. Master calendar: School-wide assessments
  5. CTA: Email teacher link

### Files to Create
1. Component: `/app/components/ParentProgressDashboardK12.tsx`
2. Route: `/app/parents/child/[childId]/dashboard/page.tsx`

### Start Here
1. Create component file with mock data first (copy from `/mocks/k12-api-responses.ts::mockParentProgress`)
2. Build UI sections as per brief
3. Wire up live API when component is done
4. Test on mobile (375px width minimum)

### Key Constraints
- **No jargon:** Teachers see "Learning Objectives", parents see "What Alex is learning"
- **Mobile-first:** Many parents check on phones during the day
- **Large text:** 16px minimum for body text
- **Warm tone:** Inviting, not clinical

**ETA:** 6-8 hours

---

## T4: Teacher Experience — Integration Sprint

**Status:** Component built. **Task:** Wire live APIs.

### What You're Doing
Connect your teacher dashboard component to the real backend endpoints.

### Your APIs
1. `GET /api/k12/classes/[classId]/class-dashboard`
2. `GET /api/k12/classes/[classId]/master-calendar`

### Step 1: Update Component
**File:** `/app/components/TeacherClassDashboard.tsx`

Replace mock imports with live API calls:
```typescript
const [dashboard, setDashboard] = useState(null);
const [calendar, setCalendar] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    const [dashResp, calResp] = await Promise.all([
      fetch(`/api/k12/classes/${classId}/class-dashboard`),
      fetch(`/api/k12/classes/${classId}/master-calendar`)
    ]);
    
    const dashData = await dashResp.json();
    const calData = await calResp.json();
    
    setDashboard(dashData);
    setCalendar(calData);
    setLoading(false);
  };
  
  fetchData();
}, [classId]);
```

### Step 2: Test
1. Open your teacher dashboard page
2. Verify all sections load (empty until T1 seeds data)
3. Check struggling skills section renders correctly
4. Test intervention groups list
5. Verify color coding (critical/moderate/minor)
6. Test on tablet viewport (teachers use tablets in classroom)

### Step 3: Report
- Screenshots: full dashboard, struggling skills section, intervention groups
- Time spent
- Any data shape issues

**ETA:** 1-2 hours

---

## T1 (Orchestrator) — Parallel Track

While T2-T4 integrate:
- Creating test data (demo classes, enrollments, standards, submissions)
- Adding authorization middleware to all endpoints
- Building grading submission API

Check back in 2-3 hours when data is seeded. You'll have real responses to test against.

---

## Sync Point

**In 2-3 hours:**
1. T1 posts "TEST DATA SEEDED" message here
2. T2-T4 refresh their local endpoints and test with real data
3. Report any issues
4. Iterate until all three dashboards work end-to-end

**Go!**
