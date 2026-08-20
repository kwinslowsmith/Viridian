# Phase 3 Marching Orders: Core Teacher Tools & Student Intervention

**Timeline:** 4-6 weeks (Aug 19 - Oct 1, 2026)  
**Goal:** Teachers can create assessments, grade submissions, identify struggling students, and manage intervention groups

---

## Dependency Map

```
T1: Backend APIs & Schema
├── Grading/Assessment endpoints
├── Intervention APIs
└── Mastery calculation with pass %

T2: Student Study Guides & Progress
├── Depends on: Grading endpoints (to show grades)
└── Study guide generation from objectives

T3: Parent Alerts & Conference Scheduling
├── Depends on: Intervention endpoints (to notify parents)
└── Can work in parallel after T1 core APIs ready

T4: Teacher Grading & Intervention Manager
├── Depends on: Assessment endpoints
├── Depends on: Intervention APIs
└── Highest priority (core workflow)
```

---

## T1: Orchestrator - Backend APIs & Schema (2-3 weeks)

### Schema Changes (Prisma)

**New Models:**
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
  
  // Relations
  submissions K12Submission[]
  
  @@index([classId])
}

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

model InterventionGroup {
  id String @id @default(cuid())
  classId String
  k12Class K12Class @relation(fields: [classId], references: [id], onDelete: Cascade)
  
  name String
  objectiveId String // which objective this targets
  exampleObjective ExampleObjective @relation(fields: [objectiveId], references: [id])
  
  studentIds String[] // JSON array
  meetingSchedule String // "Tuesdays 2pm" etc
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([classId])
  @@index([objectiveId])
}
```

**Update existing:**
- `Standard`: Add `passPercentage Int @default(80)` (if not already)
- `ExampleObjective`: Add `isMandatory Boolean @default(false)` (already exists)

### API Endpoints to Build

**1. Assessment Management**
```
POST   /api/k12-classes/[classId]/assessments
GET    /api/k12-classes/[classId]/assessments
GET    /api/k12-classes/[classId]/assessments/[assessmentId]
PATCH  /api/k12-classes/[classId]/assessments/[assessmentId]
DELETE /api/k12-classes/[classId]/assessments/[assessmentId]
```

**2. Submissions**
```
POST   /api/k12-classes/[classId]/assessments/[assessmentId]/submit
GET    /api/k12-classes/[classId]/assessments/[assessmentId]/submissions
PATCH  /api/k12-classes/[classId]/submissions/[submissionId]/grade
```

**3. Mastery Calculation**
```
GET    /api/k12-classes/[classId]/students/[studentId]/mastery
```
Returns:
```json
{
  "studentId": "...",
  "standards": [
    {
      "standardId": "...",
      "standardName": "...",
      "masteryPercent": 75,
      "passed": false,
      "reason": "Overall 75% but pass threshold is 80%",
      "objectives": [
        {
          "objectiveId": "...",
          "label": "A",
          "isMandatory": true,
          "score": 85,
          "complete": true
        }
      ]
    }
  ]
}
```

**4. Intervention Management**
```
POST   /api/k12-classes/[classId]/intervention-groups
GET    /api/k12-classes/[classId]/intervention-groups
PATCH  /api/k12-classes/[classId]/intervention-groups/[groupId]
DELETE /api/k12-classes/[classId]/intervention-groups/[groupId]
POST   /api/k12-classes/[classId]/intervention-groups/[groupId]/add-student
DELETE /api/k12-classes/[classId]/intervention-groups/[groupId]/remove-student
```

### Deliverables
- [ ] Schema migrated and deployed
- [ ] All 5 API endpoint groups tested locally
- [ ] Test data seeded (3 assessments, 12 submissions, 2 intervention groups per class)
- [ ] API contract docs updated
- [ ] Ready for T2-T4 integration

---

## T2: Student Experience - Study Guides & Grades (Parallel with T1)

### What to Build

**1. Student Grades View**
- New tab in `/students/class/[classId]/dashboard`: "My Grades"
- Show all assessments for this class
- For each: title, due date, submitted date, grade (if graded), teacher feedback
- Color-coded: not submitted (gray), submitted/pending (yellow), graded (green/red by score)

**2. Study Guide Generator**
- New component: StudyGuideGenerator.tsx
- Input: objective ID
- Output: AI-generated study guide with:
  - Learning target
  - Key concepts (bullet points)
  - Practice questions (3-5)
  - Related materials (link to materials we already have)
- Downloadable as PDF

**3. Mastery Progress Tracking**
- Update Standards & Objectives tab to show:
  - Current mastery % for each standard (from T1 mastery API)
  - What's needed to pass (e.g., "Need 80%. Currently 65%. Aim for 80% on next assessment")
  - Path to mastery visualization

### API Dependencies
- Needs: T1 Assessment endpoints (to show grades)
- Needs: T1 Mastery endpoint (to show progress)
- Needs: Existing materials API (already built)

### Deliverables
- [ ] My Grades tab (fetches from `/api/k12-classes/[classId]/assessments`)
- [ ] StudyGuideGenerator component (uses mock data initially, can swap to real LLM later)
- [ ] Mastery progress UI in Standards tab
- [ ] TypeScript: 0 errors
- [ ] Mobile responsive (375px+)
- [ ] Ready for browser verification

---

## T3: Parent Experience - Alerts & Reporting (Parallel with T1)

### What to Build

**1. Intervention Alerts**
- Parents notified when child is added to intervention group
- Notification shows: which objective, why child needs help, meeting schedule
- Available in messaging inbox or email notification

**2. At-Risk Indicator**
- Dashboard widget showing:
  - ⚠️ If child is struggling with any mandatory objective
  - 🎯 Intervention groups child is in
  - Timeline to mastery (estimated weeks to reach 80%)

**3. Progress Benchmark**
- Show parent: "Your child is currently at 65% mastery in Analyze Themes"
- "80% needed to demonstrate standard"
- "Teacher recommends 2 more weeks of practice"

### API Dependencies
- Needs: T1 Mastery endpoint (to show risk/progress)
- Needs: T1 Intervention APIs (to show which groups child is in)
- Can integrate with existing Messaging API

### Deliverables
- [ ] At-Risk widget on parent dashboard
- [ ] Intervention group display (which groups, meeting times)
- [ ] Progress toward mastery messaging
- [ ] Email/in-app notifications when child added to group
- [ ] TypeScript: 0 errors
- [ ] Mobile responsive
- [ ] Ready for browser verification

---

## T4: Teacher Experience - Grading & Interventions (Parallel with T1)

### What to Build

**1. Assessment Creator**
- New page: `/teachers/class/[classId]/assessments/new`
- Form:
  - Title, description, type (formative/summative)
  - Link objectives (checkboxes)
  - Due date
  - Create button
- Shows list of existing assessments with edit/delete

**2. Grading Inbox**
- Show all pending submissions across all assessments
- For each submission:
  - Student name
  - Assessment title
  - Submission date
  - Click to open grading interface
- Filter: by assessment, by student, by status (pending/graded)

**3. Grading Interface**
- Show student submission (text, files, attachments)
- Teacher can:
  - Enter grade (0-100)
  - Add feedback
  - Save & move to next
  - One-click actions: "Excellent", "Needs Revision", "Resubmit"

**4. Intervention Manager**
- List all intervention groups for this class
- For each group:
  - Objective name & code
  - Student list
  - Meeting schedule
  - Add/remove students
  - Create button to add new group
- One-click creation: "Add intervention group for [Objective]" from struggling skills view

**5. Mastery Dashboard**
- Show all students' mastery % by standard (we already have this from Phase 2)
- Add: "Struggling students" highlight
- Add: "Ready to master" (students at 70%+ but haven't passed yet)

### API Dependencies
- Needs: T1 Assessment endpoints
- Needs: T1 Submission endpoints
- Needs: T1 Intervention endpoints
- Needs: T1 Mastery calculation endpoint

### Deliverables
- [ ] Assessment creator (POST to `/api/k12-classes/[classId]/assessments`)
- [ ] Grading inbox (GET from `/api/k12-classes/[classId]/assessments/[assessmentId]/submissions`)
- [ ] Grading interface (PATCH to `/api/k12-classes/[classId]/submissions/[submissionId]/grade`)
- [ ] Intervention manager (POST/DELETE from `/api/k12-classes/[classId]/intervention-groups/...`)
- [ ] Mastery dashboard enhancements
- [ ] TypeScript: 0 errors
- [ ] Mobile responsive (600px+)
- [ ] Ready for browser verification

---

## Work Schedule

### Week 1 (Aug 19-23)
- **T1:** Finalize schema, build Assessment + Submission endpoints
- **T2:** Start Study Guide component (mock data), design My Grades UI
- **T3:** Design parent alert UI, mock data
- **T4:** Design assessment creator, grading interface mockups

### Week 2 (Aug 26-30)
- **T1:** Finish Intervention APIs, Mastery calculation endpoint, seed test data
- **T2:** Integrate with T1 APIs (grades, mastery), build StudyGuideGenerator
- **T3:** Integrate with T1 APIs (mastery, intervention), build alert notifications
- **T4:** Build assessment creator, grading inbox, integrate with T1

### Week 3-4 (Sep 2-13)
- **All:** Bug fixes, browser verification, performance testing
- **T1:** Handle edge cases, add missing validations
- **T2-T4:** Comprehensive E2E testing

### Week 5-6 (Sep 16-27)
- **All:** Polish, documentation, demo prep
- **T1:** Optimize queries, add audit logging
- **T2-T4:** User testing with pilot school (if available)

---

## Success Criteria

**By Oct 1:**
- ✅ Teachers can create assessments and link to objectives
- ✅ Students can submit work and see grades
- ✅ Teachers can grade submissions with feedback
- ✅ Struggling students automatically identified
- ✅ Intervention groups manageable by teachers
- ✅ Parents see risk indicators
- ✅ Zero TypeScript errors, all tests passing
- ✅ Ready for 1-school pilot

---

## Known Risks

1. **Assessment submission handling** — File uploads, attachments, versioning
2. **Mastery calculation complexity** — Pass %, mandatory objectives, multiple attempts
3. **Parent notifications** — Don't overwhelm parents; balance urgency vs. noise
4. **Scale testing** — Performance with 30+ students, 10+ assessments

---

## Questions for Clarification

- Should students be able to resubmit assessments, or one attempt only?
- How should multiple submissions affect grading? (average, latest, highest?)
- Should mastery reset if a student falls below threshold?
- Parent notification frequency — daily digest or real-time alerts?

---

**Let's ship Phase 3 by Oct 1. Ready to kick off?**
