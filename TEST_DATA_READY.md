# 🚀 TEST DATA SEEDED — GO TEST!

**Status:** Live APIs ready + database populated with test data  
**Timestamp:** 2026-08-07 14:45  
**Seed Summary:** 1 school, 2 teachers, 6 students, 3 parents, 2 classes, 4 standards, 4 assessments, 3 school events

---

## Test URLs (Use These to Test Your Dashboards)

### T2: Student Progress Dashboard
```
GET /api/k12/classes/{classId}/student-progress?studentId={studentId}
```

**Test Case 1** (Strong student):
```
classId: [class from "American Literature, Period 3"]
studentId: [Student 1 Chen's ID]
→ Expect: ~70-90% mastery, mix of mastered/in-progress objectives
```

**Test Case 2** (Struggling student):
```
classId: [class from "American Literature, Period 3"]
studentId: [Student 3 Lee's ID]
→ Expect: ~20-30% mastery, mostly not-started/in-progress
```

### T3: Parent Progress Dashboard
```
GET /api/k12/parents/children/{childId}/progress
```

**Test Case** (Parent viewing child):
```
childId: [Student 1 Chen's ID]
→ Expect: Plain-language explanations, "What does this mean?", "How can I help?"
```

### T4: Teacher Class Dashboard
```
GET /api/k12/classes/{classId}/class-dashboard
GET /api/k12/classes/{classId}/master-calendar
```

**Test Case** (Teacher viewing class):
```
classId: [class from "American Literature, Period 3"]
→ Expect: 3 students enrolled, 2 standards, struggling skills visible, intervention groups listed
```

---

## Finding IDs from Database

Since we don't have a UI to query IDs, use this quick database check:

```sql
-- Get class IDs
SELECT id, name FROM "K12Class" LIMIT 2;

-- Get student IDs
SELECT id, name FROM "User" WHERE role = 'student' LIMIT 6;

-- Get standard IDs
SELECT id, name FROM "Standard" LIMIT 4;

-- Get parent IDs
SELECT id, name FROM "User" WHERE role = 'parent' LIMIT 3;
```

Or ask Postman/Insomnia to fetch with placeholder IDs—the API will return proper errors if IDs are wrong.

---

## API Response Examples

### Student Progress (should return)
```json
{
  "studentId": "...",
  "studentName": "Student",
  "classId": "...",
  "className": "American Literature, Period 3",
  "standards": [
    {
      "id": "...",
      "name": "Analyze Literary Themes",
      "code": "ELA.11.A",
      "masteryPercent": 67,
      "status": "in-progress",
      "trend": "stable",
      "objectives": [
        {
          "id": "...",
          "text": "Identify primary and secondary themes",
          "status": "mastered",
          "isMandatory": true,
          "grade": 92,
          "submittedAt": "2026-09-10T..."
        }
      ]
    }
  ],
  "messageFromTeacher": "Great work! Keep pushing toward mastery. - Teacher 1 Rodriguez"
}
```

### Teacher Dashboard (should return)
```json
{
  "classId": "...",
  "className": "American Literature, Period 3",
  "enrollmentCount": 3,
  "classMasteryByStandard": [
    {
      "standardName": "Analyze Literary Themes",
      "classMasteryPercent": 67,
      "studentsMasteredCount": 2,
      "studentsInProgressCount": 1,
      "trend": "stable"
    }
  ],
  "strugglingSkills": [
    {
      "objectiveText": "Identify primary and secondary themes",
      "studentCount": 1,
      "percentageStuck": 33,
      "severity": "minor"
    }
  ],
  "interventionGroups": [
    {
      "name": "Reteach - Identify primary and secondary themes",
      "studentCount": 2,
      "meetingSchedule": "Tuesday & Thursday after school",
      "startDate": "2026-09-10T..."
    }
  ],
  "classHealthScore": 68,
  "pendingSubmissionsCount": 2
}
```

---

## What to Test

### T2: Student Dashboard
- [ ] Displays all standards (2 standards for Lit class, 2 for Math)
- [ ] Progress bars colored correctly (green ≥75%, yellow 50-75%, red <50%)
- [ ] Mastery % matches calculation
- [ ] Objectives expandable with correct badges (Core Skill = blue, Challenge = purple)
- [ ] Grades visible for mastered objectives
- [ ] Trend indicator shows (should all be "stable" for now)
- [ ] Message from teacher displays

### T3: Parent Dashboard
- [ ] Child name and teacher info visible
- [ ] Standards show status pills (On Track / Needs Support / Not Started)
- [ ] Expandable sections show "What does this mean?"
- [ ] "How can I help?" tips are present (4-5 tips per standard)
- [ ] No technical jargon (plain language only)
- [ ] Master calendar events listed
- [ ] Mobile viewport works (test at 375px width)

### T4: Teacher Dashboard
- [ ] Class name, period, enrollment (3 students) visible
- [ ] Health score prominent and colored correctly (67% = yellow)
- [ ] Mastery by standard shows percentages and student counts
- [ ] Struggling skills section visible with severity colors
- [ ] Intervention groups listed with meeting schedule
- [ ] Can scan dashboard in <5 seconds
- [ ] Master calendar events visible

---

## If APIs Return Errors

**401 Unauthorized:** Your auth isn't wired up yet (that's OK for MVP). Add mock auth:
```typescript
// In your component:
const response = await fetch(url, {
  headers: {
    'Cookie': 'next-auth.session-token=[fake-token]'
  }
});
```

**404 Not Found:** The ID doesn't exist. Use correct IDs from database query above.

**500 Internal Server Error:** There's a bug in the API. Check server logs + let T1 know.

---

## Next: Integration Checklist

- [ ] T2: Wired student-progress endpoint, tested with real data
- [ ] T3: Wired parent-progress endpoint, tested with real data
- [ ] T4: Wired class-dashboard + master-calendar endpoints, tested with real data
- [ ] All dashboards show correct mastery calculations
- [ ] No console errors
- [ ] Mobile responsive verified
- [ ] Take screenshots for demo

---

**Questions?** Check the API endpoint code in `/app/api/k12/` to understand the response shape better.

**Ready to ship?** When all three dashboards are integrated and tested, let T1 know. Next: add authorization + finalize Phase 1 deployment.
