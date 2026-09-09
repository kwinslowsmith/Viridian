# T2 Phase 3 Briefing: Student Grades & Study Guides

**Status:** Backend APIs ready ✅ | UI work: START NOW

---

## YOUR MISSION

Add 2 new features to the student experience:
1. **My Grades tab** — Show all assessments, due dates, grades, teacher feedback
2. **Study Guide Generator** — Auto-generate study materials from objectives

**Timeline:** Sept 9-20 (2 weeks)  
**Dependency:** T1 Assessment + Mastery APIs (READY ✅)

---

## WHAT TO BUILD

### 1. My Grades Tab

**Location:** `/students/class/[classId]/dashboard` → Add "My Grades" tab

**Features:**
- List all assessments for this class
- For each assessment: title, description, due date, submission status, grade (if graded), teacher feedback
- Color-coded status:
  - Gray: Not submitted yet
  - Yellow: Submitted but not graded
  - Green: Graded (90+%)
  - Orange: Graded (70-89%)
  - Red: Graded (<70%)
- Click assessment to see full details + feedback
- Responsive (375px+)

**API to Use:**
```
GET /api/k12-classes/[classId]/assessments
  Returns: [{ 
    id, title, description, type, dueDate, 
    submissionCount, gradedCount 
  }]

GET /api/k12-classes/[classId]/submissions?studentId=[userId]
  Returns: [{
    submissionId, assessmentId, assessmentTitle,
    submittedAt, grade, feedback, gradedAt
  }]
```

**Mock Data:** Already in test DB (3 assessments, 12 submissions across students)

**Component Structure:**
```
<StudentGradesTab classId={classId}>
  <GradesList submissions={submissions} />
    - For each: assessment name, grade, status badge
  <GradeDetail submissionId={id}>
    - Full submission details + teacher feedback + optional upload/resubmit
```

---

### 2. Study Guide Generator

**Location:** New component in Standards & Objectives tab
- Next to each objective, add "📚 Study Guide" button
- Click → generates study materials

**Features:**
- Generates: learning target, key concepts, practice questions (3-5), related materials
- Can be downloaded as PDF (optional nice-to-have)
- For now: use mock/static data, can integrate real LLM later
- Show linked materials from ObjectiveMaterial API

**API to Use:**
```
GET /api/k12-classes/[classId]/objectives/[objectiveId]/materials
  Returns: [{ id, title, url, type }]
```

**Component Structure:**
```
<StudyGuideGenerator objectiveId={id} objectiveLabel="A">
  - Learning target (from ExampleObjective.learningTarget)
  - Key concepts (generate from description)
  - Practice questions (mock/static for now)
  - Related materials (link to materials API)
</StudyGuideGenerator>
```

---

### 3. Enhanced Mastery Progress

**Update:** Standards & Objectives tab

**Add to each standard:**
- Current mastery % (from Mastery API)
- Pass threshold (80% default)
- Visual: progress bar showing path to mastery
- Text: "Currently 65%. Need 80% to demonstrate standard."

**API to Use:**
```
GET /api/k12-classes/[classId]/students/[studentId]/mastery
  Returns: {
    standards: [{
      standardId, standardName, masteryPercent, passed,
      objectives: [{ objectiveId, score, isMandatory, complete }]
    }]
  }
```

---

## DEPENDENCIES

✅ All APIs ready:
- `/api/k12-classes/[classId]/assessments`
- `/api/k12-classes/[classId]/submissions`
- `/api/k12-classes/[classId]/students/[studentId]/mastery`

✅ Test data seeded:
- 3 assessments per class
- 12 submissions (various grades: 60, 75, 85, 90)
- 3 students enrolled

---

## WORK SCHEDULE

**Week 1 (Sept 9-15):**
- Sept 9-10: Design My Grades tab, integrate Assessment + Submission APIs
- Sept 11-12: Build GradesList component (list + color-coding)
- Sept 13-15: Build GradeDetail component (click into submission)

**Week 2 (Sept 16-20):**
- Sept 16: Study Guide Generator component (static version)
- Sept 17-18: Mastery Progress UI (progress bar + threshold text)
- Sept 19-20: Bug fixes, mobile testing, browser verification

---

## SUCCESS CRITERIA

- [ ] My Grades tab loads assessments
- [ ] Grades display with correct color-coding (gray/yellow/green/orange/red)
- [ ] Click assessment shows full details + feedback
- [ ] Study Guide Generator renders (static data OK)
- [ ] Mastery Progress shows % + threshold
- [ ] Mobile responsive (375px+)
- [ ] TypeScript: 0 errors
- [ ] All components integrated into `/students/class/[classId]/dashboard`

---

## INTEGRATION POINTS

- **Dashboard Route:** `/students/class/[classId]/dashboard` (already exists, add My Grades tab)
- **Standards Tab:** Add Study Guide button + Mastery Progress UI
- **API Calls:** useEffect + fetch (same pattern as Phase 2)
- **Error Handling:** Loading, error, empty states

---

**Ready? Start building and push to main. Vercel auto-deploys.**

