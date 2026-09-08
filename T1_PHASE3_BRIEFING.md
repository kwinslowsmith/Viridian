# T1 Phase 3 Briefing: Assessment & Grading APIs
**Critical Path - Blocks T2-T4**

---

## SITUATION

Phase 2 (student/teacher/parent dashboards) is live on Vercel. Phase 3 adds core teacher workflows: create assessments, collect student submissions, grade work, identify struggling students, manage intervention groups.

**You are the critical path.** T2-T4 cannot start UI work until you have core endpoints ready.

**Timeline:** 
- T1 work: Sept 8-22 (2 weeks)
- T2-T4 start: Sept 23
- Full Phase 3 complete: Oct 15

---

## WHAT YOU NEED TO BUILD

### 1. Assessment Management (3 days)

**Prisma Schema - ALREADY EXISTS, just add:**
```prisma
model K12Assessment {
  id String @id @default(cuid())
  classId String
  k12Class K12Class @relation(fields: [classId], references: [id], onDelete: Cascade)
  
  title String
  description String?
  type String // "formative" | "summative"
  objectiveIds String[] // JSON array of linked objective IDs
  dueDate DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  submissions K12Submission[]
  @@index([classId])
}
```

**APIs to Build:**
```
POST   /api/k12-classes/[classId]/assessments
       Body: { title, description, type, objectiveIds[], dueDate }
       Returns: { id, title, ... }

GET    /api/k12-classes/[classId]/assessments
       Returns: [{ id, title, type, dueDate, submissionCount, gradedCount }]

GET    /api/k12-classes/[classId]/assessments/[assessmentId]
       Returns: { id, title, description, type, objectiveIds, dueDate, submissions: [...] }

PATCH  /api/k12-classes/[classId]/assessments/[assessmentId]
       Body: { title?, description?, dueDate? }
       Returns: updated assessment

DELETE /api/k12-classes/[classId]/assessments/[assessmentId]
```

**Test:** POST then GET to verify assessment appears in list

---

### 2. Submissions & Grading (4 days)

**Prisma Schema - ADD:**
```prisma
model K12Submission {
  id String @id @default(cuid())
  assessmentId String
  assessment K12Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  
  studentId String
  student User @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  classId String
  
  submittedAt DateTime?
  content String? // JSON: {text, files[], attachments[]}
  grade Int? // 0-100
  feedback String?
  gradedAt DateTime?
  gradedBy String? // teacher ID
  
  @@index([assessmentId])
  @@index([studentId])
  @@index([classId])
}
```

**APIs to Build:**
```
POST   /api/k12-classes/[classId]/assessments/[assessmentId]/submit
       Body: { studentId, content (JSON) }
       Returns: { submissionId, studentId, submittedAt }

GET    /api/k12-classes/[classId]/assessments/[assessmentId]/submissions
       Returns: [{ 
         submissionId, studentName, submittedAt, grade, status (pending|graded)
       }]

PATCH  /api/k12-classes/[classId]/submissions/[submissionId]/grade
       Body: { grade (0-100), feedback }
       Returns: { submissionId, grade, feedback, gradedAt }

GET    /api/k12-classes/[classId]/submissions?studentId=[id]
       Returns: all submissions for a student (for dashboard)
```

**Test:** POST submission, then PATCH with grade to verify it sticks

---

### 3. Mastery Calculation (3 days)

**Algorithm to implement:**
```
For each student in each standard:
  - Get all their objective scores (from K12Submission grades)
  - Get standard's passPercentage (default 80)
  - Get standard's mandatoryObjectiveIds
  
  Mastery = {
    standardId,
    studentId,
    masteryPercent: average(all objective scores),
    passed: (masteryPercent >= passPercentage AND all mandatory objectives >= passPercentage),
    objectiveProgress: [
      { objectiveId, score, isMandatory, complete }
    ]
  }
```

**API:**
```
GET    /api/k12-classes/[classId]/students/[studentId]/mastery
       Returns: {
         studentId,
         standards: [
           {
             standardId,
             standardName,
             masteryPercent: 75,
             passed: false,
             reason: "Passed 75% but need 80%",
             objectives: [
               { objectiveId, label, isMandatory, score, complete }
             ]
           }
         ]
       }
```

**Test:** Create 3 submissions with grades (85, 70, 90), verify average = 81.67%

---

### 4. Intervention Groups (2 days)

**Prisma Schema - ALREADY EXISTS:**
```prisma
model InterventionGroup {
  id String @id @default(cuid())
  classId String
  k12Class K12Class @relation(fields: [classId], references: [id], onDelete: Cascade)
  
  name String
  objectiveId String
  exampleObjective ExampleObjective @relation(fields: [objectiveId], references: [id])
  
  studentIds String[] // JSON array
  meetingSchedule String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([classId])
  @@index([objectiveId])
}
```

**APIs:**
```
POST   /api/k12-classes/[classId]/intervention-groups
       Body: { name, objectiveId, studentIds[], meetingSchedule }
       Returns: { groupId, name, studentCount }

GET    /api/k12-classes/[classId]/intervention-groups
       Returns: [{ groupId, name, objectiveId, studentCount, meetingSchedule }]

PATCH  /api/k12-classes/[classId]/intervention-groups/[groupId]
       Body: { name?, meetingSchedule? }

POST   /api/k12-classes/[classId]/intervention-groups/[groupId]/add-student
       Body: { studentId }

DELETE /api/k12-classes/[classId]/intervention-groups/[groupId]/remove-student?studentId=[id]

DELETE /api/k12-classes/[classId]/intervention-groups/[groupId]
```

**Test:** Create group with 2 students, add 1 more, verify list shows 3

---

## TEST DATA TO SEED

After APIs are built, seed:
- 3 assessments per class (formative, summative, formative)
- 12 submissions (3 students × 4 assessments)
- Grades: varied (60, 75, 85, 90) to show mastery spread
- 2 intervention groups (1 per struggling objective)

---

## WORK SCHEDULE

**Week 1 (Sept 8-15):**
- Sept 8-9: Assessment CRUD (POST/GET/PATCH/DELETE)
- Sept 10-12: Submission + Grading (POST submit, PATCH grade)
- Sept 13-15: Mastery calculation endpoint, seed test data

**Week 2 (Sept 16-22):**
- Sept 16-17: Intervention group CRUD
- Sept 18-19: Bug fixes, performance optimization
- Sept 20-22: Buffer for unknowns, final testing with T1 test data

**Handoff (Sept 23):**
- T2-T4 spin up, integrate with your APIs
- Your job: support as needed (usually <4 hours/week after this)

---

## SUCCESS CRITERIA

- [ ] All 5 API endpoint groups working
- [ ] Test data seeded (3 assessments, 12 submissions, 2 intervention groups)
- [ ] Mastery calculation handles:
  - [ ] Multiple submissions per student
  - [ ] Pass percentage threshold
  - [ ] Mandatory objectives logic
  - [ ] Edge case: student with no submissions (score = 0)
- [ ] TypeScript: 0 errors
- [ ] Database queries optimized (no N+1)
- [ ] Ready for T2-T4 integration

---

## KNOWN RISKS

1. **Submission content storage** — Currently string, may need JSON schema validation
2. **Grade retroactivity** — If teacher changes grade, does mastery recalculate automatically? (YES)
3. **Multiple attempts** — Can student resubmit? Current design: yes, latest grade counts
4. **Concurrent grading** — Teacher A grades submission while Teacher B views it (no conflict, both read/write same row)

---

## NOTES

- All models are already in prisma/schema.prisma (just need to verify)
- Authorization: Check user is class instructor before allowing POST/PATCH/DELETE
- Each endpoint should return consistent error shapes (400, 401, 403, 404, 500)
- Log all grading operations (for audit trail)

---

**Ready to kick off?**

