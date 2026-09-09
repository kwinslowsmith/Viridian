# T4 Phase 3 Briefing: Teacher Grading & Intervention Tools

**Status:** Backend APIs ready ✅ | UI work: START NOW

---

## YOUR MISSION

Add 4 major features to teacher experience:
1. **Assessment Creator** — Teachers create/edit assessments, link to objectives
2. **Grading Inbox** — Teachers see all student submissions, grade with feedback
3. **Intervention Manager** — Create/manage intervention groups, add/remove students
4. **Enhanced Mastery Dashboard** — Show struggling vs. ready-to-master students

**Timeline:** Sept 9-20 (2 weeks)  
**Dependency:** T1 Assessment + Grading + Intervention + Mastery APIs (READY ✅)

---

## WHAT TO BUILD

### 1. Assessment Creator

**Location:** New page `/teachers/class/[classId]/assessments`

**Features:**
- List existing assessments with: title, type (formative/summative), due date, submission count
- "New Assessment" button → form with:
  - Title (required)
  - Description (optional)
  - Type: formative | summative dropdown
  - Link Objectives: checkboxes (multi-select from class standards)
  - Due Date: date picker
  - [Create] [Cancel] buttons
- Edit existing: click assessment → same form pre-populated
- Delete: confirm dialog, remove assessment

**API to Use:**
```
POST   /api/k12-classes/[classId]/assessments
       Body: { title, description, type, objectiveIds[], dueDate }

GET    /api/k12-classes/[classId]/assessments
       Returns: [{ id, title, type, dueDate, submissionCount, gradedCount }]

GET    /api/k12-classes/[classId]/assessments/[assessmentId]
       Returns: full assessment details

PATCH  /api/k12-classes/[classId]/assessments/[assessmentId]
       Body: { title?, description?, dueDate? }

DELETE /api/k12-classes/[classId]/assessments/[assessmentId]
```

**Component Structure:**
```
<AssessmentCreator classId={classId}>
  <AssessmentList assessments={[...]} />
    - Table: Title | Type | Due | Submissions | Actions
  <AssessmentForm mode="create|edit" assessment={null|existing} />
    - Text inputs + dropdown + date picker + checkboxes
    - Submit button
```

**Test Data:** 3 assessments already created, can use list view immediately

---

### 2. Grading Inbox

**Location:** New tab in `/teachers/class/[classId]/dashboard` or new page

**Features:**
- Show all pending submissions (not yet graded)
- Table with: Student Name | Assessment | Submitted Date | Status | [Grade]
- Sort by: assessment, student, date
- Filter: by assessment, by status (pending/graded/all)
- Click row or [Grade] button → opens grading interface

**API to Use:**
```
GET /api/k12-classes/[classId]/assessments/[assessmentId]/submissions
    Returns: [{ submissionId, studentName, submittedAt, grade, status }]

GET /api/k12-classes/[classId]/submissions
    Returns: [{ submissionId, assessmentId, assessmentTitle, studentName, submittedAt, grade }]
```

**Component Structure:**
```
<GradingInbox classId={classId}>
  <SubmissionFilters />
    - Assessment dropdown, status radio
  <SubmissionList submissions={[...]} />
    - Table with sort/filter applied
    - Click to grade
```

**Example Display:**
```
PENDING SUBMISSIONS (8)

Filter: [All Assessments ▼] [All Statuses ▼] Sort: [Date ▼]

| Student Name | Assessment | Submitted | Grade | Action |
|---|---|---|---|---|
| Student 1 Chen | Theme Analysis | 2 hours ago | - | [Grade] |
| Student 2 Johnson | Theme Analysis | 3 hours ago | - | [Grade] |
| Student 1 Chen | Essay Outline | Yesterday | - | [Grade] |
```

---

### 3. Grading Interface

**Modal/Drawer that opens when teacher clicks [Grade]**

**Features:**
- Show submission content (text, files, attachments)
- Teacher can:
  - Enter grade (0-100 slider or input)
  - Write feedback (textarea)
  - Quick-action buttons: "Excellent" (90), "Good" (80), "Needs Revision" (65), "Resubmit" (msg)
  - [Save Grade] [Next Submission] [Cancel]
- After saving: popup "Grade saved" → option to grade next or close

**API to Use:**
```
PATCH /api/k12-classes/[classId]/submissions/[submissionId]/grade
      Body: { grade (0-100), feedback }
      Returns: { submissionId, grade, feedback, gradedAt }
```

**Component Structure:**
```
<GradingInterface submissionId={id} onClose={} onNext={}>
  <SubmissionViewer submission={...} />
    - Display student's content
  <GradingForm submission={...} onSubmit={} />
    - Grade input + feedback textarea + quick actions
    - Save button
```

---

### 4. Intervention Manager

**Location:** New tab or section in dashboard

**Features:**
- List all intervention groups for this class
- For each: objective name, student count, meeting schedule, [Edit] [Delete]
- "Create Intervention Group" button → form with:
  - Name (auto-suggest from objective? e.g., "Theme Analysis Support")
  - Select Objective (dropdown from class standards)
  - Add Students (multi-select from class roster, initially can filter by "struggling in this objective")
  - Meeting Schedule (text input: "Tuesdays 2pm")
  - [Create] [Cancel]
- After create: show on list, can add/remove students
- "Quick Create" from Struggling Skills: right-click struggling skill → "Create intervention group"

**API to Use:**
```
POST   /api/k12-classes/[classId]/intervention-groups
       Body: { name, objectiveId, studentIds[], meetingSchedule }

GET    /api/k12-classes/[classId]/intervention-groups
       Returns: [{ groupId, name, objectiveId, studentCount, meetingSchedule }]

POST   /api/k12-classes/[classId]/intervention-groups/[groupId]/add-student
       Body: { studentId }

DELETE /api/k12-classes/[classId]/intervention-groups/[groupId]/remove-student?studentId=[id]

DELETE /api/k12-classes/[classId]/intervention-groups/[groupId]
```

**Component Structure:**
```
<InterventionManager classId={classId}>
  <InterventionGroupList groups={[...]} />
    - Table: Name | Objective | Students | Schedule | Actions
  <InterventionGroupForm mode="create|edit" />
    - Name, objective dropdown, student multi-select, schedule text
  <StudentList groupId={id}>
    - Show/remove students from group
```

**Example Display:**
```
INTERVENTION GROUPS (2)

[+ Create New Group]

| Group Name | Objective | Students | Meeting | Action |
|---|---|---|---|---|
| Theme Analysis Support | Analyze Literary Themes | 3 | Tues 2pm | [Edit] [Delete] |
| Essay Structure Workshop | Essay Writing & Argument | 2 | Wed 3pm | [Edit] [Delete] |
```

---

### 5. Enhanced Mastery Dashboard

**Update:** Existing Class Dashboard or new "Mastery Overview" tab

**Add to Struggling Skills section:**
- Highlight students who are "ready to master" (70-79% mastery)
- Highlight "critical" (below 50%)
- Grouping: Critical > At Risk > Needs Support > Ready to Master

**Add "Quick Actions":**
- For each struggling skill: [Create Intervention] button
- Clicking → pre-fills intervention group form with that skill selected

**API to Use:**
```
GET /api/k12-classes/[classId]/students/[studentId]/mastery
    Returns: { standards: [{ masteryPercent, objectives: [...] }] }
```

---

## DEPENDENCIES

✅ All APIs ready:
- `/api/k12-classes/[classId]/assessments` (CRUD)
- `/api/k12-classes/[classId]/assessments/[assessmentId]/submissions`
- `/api/k12-classes/[classId]/submissions/[submissionId]/grade`
- `/api/k12-classes/[classId]/intervention-groups` (CRUD)
- `/api/k12-classes/[classId]/students/[studentId]/mastery`

✅ Test data seeded:
- 3 assessments
- 12 submissions (various grades)
- 2 intervention groups
- 3 students

---

## WORK SCHEDULE

**Week 1 (Sept 9-15):**
- Sept 9-10: Assessment Creator (list + form)
- Sept 11-12: Grading Inbox (table + filters)
- Sept 13-15: Grading Interface (modal + save)

**Week 2 (Sept 16-20):**
- Sept 16-17: Intervention Manager (CRUD forms)
- Sept 18-19: Enhanced Mastery Dashboard + quick actions
- Sept 20: Bug fixes, mobile testing, browser verification

---

## SUCCESS CRITERIA

- [ ] Assessment Creator works (create, edit, delete)
- [ ] Grading Inbox shows all submissions
- [ ] Filter/sort work
- [ ] Grading Interface opens, saves grade + feedback
- [ ] Intervention Manager creates, edits, deletes groups
- [ ] Can add/remove students from groups
- [ ] Mastery Dashboard shows struggling skills colored/grouped
- [ ] Quick action [Create Intervention] works
- [ ] Mobile responsive (600px+)
- [ ] TypeScript: 0 errors
- [ ] All integrated into teacher dashboard

---

## INTEGRATION POINTS

- **Dashboard Route:** `/teachers/class/[classId]/dashboard` (add new tabs/sections)
- **API Calls:** useEffect + fetch (same pattern as Phase 2)
- **Error Handling:** Loading, error, empty states
- **Notifications:** When submission graded, consider notifying parent (optional nice-to-have)

---

## NOTES

- Teacher workflow should be fast: Grading Inbox → Click submission → Grade → [Next] → Grade
- Consider keyboard shortcuts: Tab to next submission, Enter to save
- Show submission count/progress: "Grading 3 of 12"
- Emphasize "Quick Create" for interventions from struggling skills (saves clicks)

---

**Ready? Start building and push to main. Vercel auto-deploys.**

