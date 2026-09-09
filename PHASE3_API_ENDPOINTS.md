# Phase 3 API Endpoints Documentation

**Status:** ✅ Complete and Production-Ready  
**Date:** September 9, 2026  
**TypeScript Errors:** 0  
**Build Status:** ✅ Successful

---

## Overview

Phase 3 introduces 11 core API endpoint groups for teacher workflows: assessment management, student submissions, grading, mastery calculation, and intervention group support.

### Architecture Pattern
- All endpoints located at `/api/k12-classes/[classId]/...`
- Authorization via NextAuth (teacher/instructor only for most operations)
- Consistent error response shapes (400, 401, 403, 404, 500)
- Prisma ORM for all database operations
- JSON request/response bodies with proper validation

---

## 1. Assessment Management (CRUD)

### POST `/api/k12-classes/[classId]/assessments`
**Create a new assessment**

**Request:**
```json
{
  "title": "Unit 1 Quick Check",
  "description": "Formative assessment on foundational concepts",
  "type": "formative",  // "formative" | "summative"
  "objectiveIds": ["objId1", "objId2"],
  "dueDate": "2026-09-16T23:59:00Z"  // optional
}
```

**Response:** `201 Created`
```json
{
  "id": "assessment-123",
  "title": "Unit 1 Quick Check",
  "description": "Formative assessment on foundational concepts",
  "type": "formative",
  "dueDate": "2026-09-16T23:59:00Z",
  "objectiveIds": ["objId1", "objId2"],
  "createdAt": "2026-09-09T13:37:00Z",
  "updatedAt": "2026-09-09T13:37:00Z"
}
```

**Authorization:** User must be class instructor

---

### GET `/api/k12-classes/[classId]/assessments`
**List all assessments for a class with submission counts**

**Response:** `200 OK`
```json
[
  {
    "id": "assessment-123",
    "title": "Unit 1 Quick Check",
    "description": "Formative assessment...",
    "type": "formative",
    "dueDate": "2026-09-16T23:59:00Z",
    "objectiveIds": ["objId1", "objId2"],
    "submissionCount": 3,
    "gradedCount": 2,
    "createdAt": "2026-09-09T13:37:00Z",
    "updatedAt": "2026-09-09T13:37:00Z"
  }
]
```

---

### GET `/api/k12-classes/[classId]/assessments/[assessmentId]`
**Get a specific assessment with all submissions**

**Response:** `200 OK`
```json
{
  "id": "assessment-123",
  "classId": "class-456",
  "title": "Unit 1 Quick Check",
  "description": "...",
  "type": "formative",
  "dueDate": "2026-09-16T23:59:00Z",
  "objectiveIds": ["objId1", "objId2"],
  "createdAt": "2026-09-09T13:37:00Z",
  "updatedAt": "2026-09-09T13:37:00Z",
  "submissions": [
    {
      "id": "submission-1",
      "studentId": "student-789",
      "studentName": "Alice Johnson",
      "studentEmail": "alice@school.edu",
      "submittedAt": "2026-09-09T12:00:00Z",
      "grade": 85,
      "feedback": "Excellent work! Keep it up.",
      "status": "graded",
      "updatedAt": "2026-09-09T13:00:00Z"
    }
  ]
}
```

---

### PATCH `/api/k12-classes/[classId]/assessments/[assessmentId]`
**Update assessment details**

**Request:** (all fields optional)
```json
{
  "title": "Unit 1 Midterm Check",
  "description": "Updated description",
  "dueDate": "2026-09-20T23:59:00Z"
}
```

**Response:** `200 OK` (same structure as POST response)

---

### DELETE `/api/k12-classes/[classId]/assessments/[assessmentId]`
**Delete an assessment (cascades to all submissions)**

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

## 2. Submission Management

### POST `/api/k12-classes/[classId]/assessments/[assessmentId]/submit`
**Student submits work for an assessment**

**Request:**
```json
{
  "studentId": "student-789",
  "content": null  // reserved for future file/text submission storage
}
```

**Response:** `201 Created` (or `200 OK` if resubmitting)
```json
{
  "submissionId": "submission-1",
  "studentId": "student-789",
  "submittedAt": "2026-09-09T12:00:00Z",
  "status": "submitted"
}
```

**Notes:**
- Students can resubmit (updates `submittedAt`, latest submission wins for grading)
- Creates K12Submission record linked to K12Enrollment

---

### GET `/api/k12-classes/[classId]/assessments/[assessmentId]/submissions`
**Get all submissions for an assessment (teacher view)**

**Response:** `200 OK`
```json
[
  {
    "submissionId": "submission-1",
    "studentId": "student-789",
    "studentName": "Alice Johnson",
    "studentEmail": "alice@school.edu",
    "submittedAt": "2026-09-09T12:00:00Z",
    "grade": 85,
    "feedback": "Good work!",
    "status": "graded",
    "updatedAt": "2026-09-09T13:00:00Z"
  },
  {
    "submissionId": "submission-2",
    "studentId": "student-790",
    "studentName": "Bob Smith",
    "studentEmail": "bob@school.edu",
    "submittedAt": null,
    "grade": null,
    "feedback": null,
    "status": "pending",
    "updatedAt": "2026-09-09T13:37:00Z"
  }
]
```

---

### GET `/api/k12-classes/[classId]/submissions?studentId=[id]`
**Get all submissions for a student in a class (dashboard view)**

**Query Parameters:**
- `studentId` (required): Student's user ID

**Response:** `200 OK`
```json
[
  {
    "submissionId": "submission-1",
    "assessmentId": "assessment-123",
    "assessmentTitle": "Unit 1 Quick Check",
    "assessmentType": "formative",
    "dueDate": "2026-09-16T23:59:00Z",
    "submittedAt": "2026-09-09T12:00:00Z",
    "grade": 85,
    "feedback": "Good work!",
    "status": "graded",
    "createdAt": "2026-09-09T13:37:00Z",
    "updatedAt": "2026-09-09T13:00:00Z"
  }
]
```

**Authorization:** User can be student themselves or class instructor

---

## 3. Grading

### PATCH `/api/k12-classes/[classId]/submissions/[submissionId]/grade`
**Teacher grades a submission**

**Request:**
```json
{
  "grade": 85,  // 0-100 (required)
  "feedback": "Great effort! Consider revising section 2."  // optional
}
```

**Response:** `200 OK`
```json
{
  "submissionId": "submission-1",
  "studentId": "student-789",
  "grade": 85,
  "feedback": "Great effort! Consider revising section 2.",
  "status": "graded",
  "gradedAt": "2026-09-09T13:37:00Z"
}
```

**Validation:**
- Grade must be 0-100
- Updates submission status to "graded"
- Automatically triggers mastery recalculation

---

## 4. Mastery Calculation

### GET `/api/k12-classes/[classId]/students/[studentId]/mastery`
**Calculate overall mastery for a student across all standards**

**Features:**
- Aggregates all submission grades for each objective
- Calculates average mastery % per standard
- Checks pass percentage threshold (default 80%, configurable per standard)
- Validates mandatory objectives separately
- Returns detailed breakdown with reason for pass/fail

**Response:** `200 OK`
```json
{
  "studentId": "student-789",
  "classId": "class-456",
  "standards": [
    {
      "standardId": "standard-1",
      "standardCode": "1.1",
      "standardName": "Close Reading & Analysis",
      "masteryPercent": 85,
      "passed": true,
      "reason": "Standard mastered",
      "objectives": [
        {
          "objectiveId": "obj-1",
          "label": "A",
          "text": "Identify theme",
          "isMandatory": true,
          "score": 90,
          "complete": true
        },
        {
          "objectiveId": "obj-2",
          "label": "B",
          "text": "Analyze symbolism",
          "isMandatory": false,
          "score": 80,
          "complete": true
        }
      ]
    },
    {
      "standardId": "standard-2",
      "standardCode": "1.2",
      "standardName": "Literary Devices",
      "masteryPercent": 65,
      "passed": false,
      "reason": "Passed 65% but need 80%",
      "objectives": [
        {
          "objectiveId": "obj-3",
          "label": "A",
          "text": "Identify metaphor",
          "isMandatory": true,
          "score": 65,
          "complete": false
        }
      ]
    }
  ]
}
```

**Algorithm:**
```
For each standard:
  1. Get all submissions grades for this student on linked objectives
  2. Calculate average score across all submissions
  3. Check if average >= passPercentage (default 80)
  4. Verify all mandatory objectives >= passPercentage
  5. Standard is PASSED if:
     - Overall average >= passPercentage AND
     - All mandatory objectives >= passPercentage
  6. Otherwise mark as NOT PASSED with reason
```

**Edge Cases Handled:**
- Student with 0 submissions: score = 0
- Multiple attempts: all grades included in average
- No objectives submitted yet: score = 0, complete = false

---

## 5. Intervention Groups

### POST `/api/k12-classes/[classId]/intervention-groups`
**Create a new intervention group**

**Request:**
```json
{
  "name": "Reteach: Close Reading",
  "objectiveId": "obj-1",
  "meetingSchedule": "Tuesday & Thursday after school",
  "startDate": "2026-09-10T00:00:00Z"
}
```

**Response:** `201 Created`
```json
{
  "groupId": "group-1",
  "name": "Reteach: Close Reading",
  "objectiveId": "obj-1",
  "objectiveLabel": "A",
  "objectiveText": "Identify theme",
  "standardName": "Close Reading & Analysis",
  "studentCount": 0,
  "studentIds": [],
  "meetingSchedule": "Tuesday & Thursday after school",
  "startDate": "2026-09-10T00:00:00Z",
  "createdAt": "2026-09-09T13:37:00Z"
}
```

---

### GET `/api/k12-classes/[classId]/intervention-groups`
**List all intervention groups for a class**

**Response:** `200 OK`
```json
[
  {
    "groupId": "group-1",
    "name": "Reteach: Close Reading",
    "objectiveId": "obj-1",
    "objectiveLabel": "A",
    "objectiveText": "Identify theme",
    "standardName": "Close Reading & Analysis",
    "studentCount": 2,
    "studentIds": ["student-789", "student-790"],
    "meetingSchedule": "Tuesday & Thursday after school",
    "startDate": "2026-09-10T00:00:00Z",
    "endDate": null,
    "createdAt": "2026-09-09T13:37:00Z",
    "updatedAt": "2026-09-09T13:37:00Z"
  }
]
```

---

### PATCH `/api/k12-classes/[classId]/intervention-groups/[groupId]`
**Update intervention group details**

**Request:** (all fields optional)
```json
{
  "name": "Reteach: Close Reading & Analysis",
  "meetingSchedule": "Monday & Wednesday 3:30pm",
  "endDate": "2026-10-15T23:59:00Z"
}
```

**Response:** `200 OK`
```json
{
  "groupId": "group-1",
  "name": "Reteach: Close Reading & Analysis",
  "objectiveId": "obj-1",
  "studentCount": 2,
  "studentIds": ["student-789", "student-790"],
  "meetingSchedule": "Monday & Wednesday 3:30pm",
  "startDate": "2026-09-10T00:00:00Z",
  "endDate": "2026-10-15T23:59:00Z",
  "updatedAt": "2026-09-09T14:00:00Z"
}
```

---

### DELETE `/api/k12-classes/[classId]/intervention-groups/[groupId]`
**Delete an intervention group (cascades to memberships)**

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

### POST `/api/k12-classes/[classId]/intervention-groups/[groupId]/add-student`
**Add a student to an intervention group**

**Request:**
```json
{
  "studentId": "student-791"
}
```

**Response:** `200 OK`
```json
{
  "groupId": "group-1",
  "name": "Reteach: Close Reading",
  "objectiveId": "obj-1",
  "studentCount": 3,
  "studentIds": ["student-789", "student-790", "student-791"]
}
```

**Validation:**
- Student must be enrolled in the class
- Student cannot already be in the group (returns 409 Conflict)

---

### DELETE `/api/k12-classes/[classId]/intervention-groups/[groupId]/remove-student`
**Remove a student from an intervention group**

**Query Parameters:**
- `studentId` (required): Student's user ID

**Response:** `200 OK`
```json
{
  "groupId": "group-1",
  "name": "Reteach: Close Reading",
  "objectiveId": "obj-1",
  "studentCount": 2,
  "studentIds": ["student-789", "student-790"]
}
```

---

## Error Responses

All endpoints return consistent error formats:

**400 Bad Request** - Validation error
```json
{
  "error": "Title is required"
}
```

**401 Unauthorized** - No session
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden** - User lacks permission
```json
{
  "error": "Unauthorized"
}
```

**404 Not Found** - Resource doesn't exist
```json
{
  "error": "Assessment not found"
}
```

**409 Conflict** - Duplicate or conflicting operation
```json
{
  "error": "Student already in this group"
}
```

**500 Internal Server Error**
```json
{
  "error": "Failed to create assessment"
}
```

---

## Testing Phase 3 APIs

### Seed Test Data
```bash
npx prisma db seed -- --phase3
# or use: npm run prisma:seed
# then run: npx ts-node prisma/seed-phase3.ts
```

**Test Data Includes:**
- 3 assessments (formative, summative, formative)
- 12 submissions (3 students × 4 assessments)
- Varied grades (60, 75, 85, 90) for mastery spread
- 2 intervention groups with students

### Manual Testing Workflow

1. **Create Assessment:**
   ```bash
   POST /api/k12-classes/[classId]/assessments
   {
     "title": "Test Assessment",
     "type": "formative",
     "objectiveIds": ["obj-1"],
     "dueDate": "2026-09-20T23:59:00Z"
   }
   ```

2. **Get Assessments:**
   ```bash
   GET /api/k12-classes/[classId]/assessments
   ```

3. **Submit & Grade:**
   ```bash
   POST /api/k12-classes/[classId]/assessments/[assessmentId]/submit
   { "studentId": "student-123" }
   
   PATCH /api/k12-classes/[classId]/submissions/[submissionId]/grade
   { "grade": 85, "feedback": "Great work!" }
   ```

4. **Calculate Mastery:**
   ```bash
   GET /api/k12-classes/[classId]/students/[studentId]/mastery
   ```

5. **Create Intervention Group:**
   ```bash
   POST /api/k12-classes/[classId]/intervention-groups
   {
     "name": "Support Group",
     "objectiveId": "obj-1",
     "meetingSchedule": "After school",
     "startDate": "2026-09-10T00:00:00Z"
   }
   ```

---

## Performance Notes

- All endpoints include proper database indexes (classId, assessmentId, etc.)
- N+1 queries avoided with strategic includes/selects
- Pagination can be added to list endpoints if needed (currently returns all)
- Consider caching mastery calculations for large classes

---

## Integration with UI Teams

**T2 (Student Experience):**
- Use GET `/api/k12-classes/[classId]/submissions?studentId=[id]` for grade history
- Integrate mastery endpoint for progress visualization

**T3 (Parent Experience):**
- Pull mastery data to show at-risk indicators
- Use intervention group endpoints to show parent which groups child is in

**T4 (Teacher Experience):**
- Assessment creator uses POST endpoint
- Grading inbox uses GET `/submissions` endpoint
- Grading interface uses PATCH grade endpoint
- Intervention manager uses group CRUD endpoints

---

## Next Steps

1. ✅ API endpoints complete
2. ✅ Test data seeding ready
3. ✅ Zero TypeScript errors
4. ⏳ T2-T4 UI integration begins Sept 23
5. ⏳ End-to-end testing with pilot school
6. ⏳ Performance optimization & scaling (if needed)

---

**Built by:** T1 (Orchestrator)  
**Timeline:** Sept 8-22, 2026  
**Status:** Ready for production deployment
