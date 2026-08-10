# Consolidated Standards & Objectives Dashboard Spec

**Purpose**: Define backend APIs and frontend specs for unified Standards & Objectives views across teacher/student dashboards.

**Status**: Phase 2 Implementation (replacing separate Standards/Objectives tabs)

---

## Backend API Design

### 1. Teacher Dashboard API
**Endpoint**: `GET /api/k12/classes/[classId]/standards-objectives-teacher`

**Query Params**:
- `classId` (required): The K12 class ID

**Response**:
```json
{
  "standards": [
    {
      "standardId": "std_123",
      "standardCode": "2.1",
      "standardName": "Analyze Literary Themes",
      "unitId": "unit_45",
      "unitName": "Unit 2: Literary Analysis",
      "description": "Students analyze...",
      "requiredObjectiveCount": 3,
      "totalObjectiveCount": 8,
      "classPassPercentage": 80,
      "objectives": [
        {
          "objectiveId": "obj_456",
          "label": "Obj 2.1.A",
          "text": "Identify theme statements",
          "description": "Students can articulate...",
          "sequenceNum": 1,
          "isMandatory": true,
          "needsAssessmentFrequency": true,  // Flag: teacher dashboard should highlight this
          "assessmentFrequencyMetric": {
            "lastAssessedDaysAgo": 14,
            "submissionCount": 2,
            "averageScore": 75
          },
          "studentProgress": [
            {
              "studentId": "stu_789",
              "studentName": "Jane Chen",
              "masteryStatus": "proficient",  // proficient, developing, approaching, needs_support
              "masteryPercent": 85,
              "submittedAt": "2026-08-08T10:30:00Z",
              "grade": "A"
            },
            // ... more students
          ],
          "materials": [
            {
              "id": "mat_111",
              "title": "Theme Analysis Guide",
              "type": "material",  // material, assessment, video, link
              "url": "...",
              "uploadedAt": "2026-08-01T15:00:00Z"
            }
          ],
          "teacherNotes": "Focus on symbolism when teaching this. Some students struggled with metaphor."
        },
        // ... more objectives
      ]
    },
    // ... more standards
  ]
}
```

---

### 2. Student Dashboard API
**Endpoint**: `GET /api/k12/classes/[classId]/standards-objectives-student`

**Query Params**:
- `classId` (required): The K12 class ID
- `studentId` (required): The student's user ID (authenticated user)

**Response**:
```json
{
  "standards": [
    {
      "standardId": "std_123",
      "standardCode": "2.1",
      "standardName": "Analyze Literary Themes",
      "unitId": "unit_45",
      "unitName": "Unit 2: Literary Analysis",
      "description": "Students analyze...",
      "requiredObjectiveCount": 3,
      "totalObjectiveCount": 8,
      "classPassPercentage": 80,
      "standardMasteryPercent": 82,  // This student's overall mastery for this standard
      "standardMasteryStatus": "proficient",
      "objectives": [
        {
          "objectiveId": "obj_456",
          "label": "Obj 2.1.A",
          "text": "Identify theme statements",
          "description": "Students can articulate...",
          "sequenceNum": 1,
          "isMandatory": true,
          "studentProgress": {
            "masteryStatus": "proficient",
            "masteryPercent": 85,
            "submittedAt": "2026-08-08T10:30:00Z",
            "grade": "A",
            "submissions": [
              {
                "id": "sub_999",
                "score": 85,
                "feedback": "Excellent analysis",
                "submittedAt": "2026-08-08T10:30:00Z"
              }
            ]
          },
          "materials": [
            {
              "id": "mat_111",
              "title": "Theme Analysis Guide",
              "type": "material",
              "url": "...",
              "uploadedAt": "2026-08-01T15:00:00Z"
            }
          ],
          "teacherNotes": "Focus on symbolism when teaching this. Some students struggled with metaphor.",
          "masterySummary": "You've mastered this objective!"
        },
        // ... more objectives
      ]
    },
    // ... more standards
  ]
}
```

---

## Frontend Component Specs

### Teacher View: Standards & Objectives Tab

**Layout**:
```
[Standards & Objectives]

Standard 2.1: Analyze Literary Themes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 Unit 2: Literary Analysis
📝 [Description text...]

Required Objectives: 3 | Available Objectives: 8
Pass Threshold: 80%

[▼ Click to expand objectives]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// When expanded:

Objective 2.1.A - Identify theme statements [REQUIRED]
├─ Description: Students can articulate...
├─ Last Assessed: 14 days ago (⚠️ Needs Assessment)
├─ Avg Class Score: 75%
├─ 📊 Student Progress:
│  └─ Jane Chen: 85% (A) - Proficient ✓
│  └─ Bob Smith: 60% (D) - Approaching ✗
│  └─ Alice Wong: 92% (A) - Proficient ✓
├─ 📎 Materials:
│  └─ [+ Add Material] [Theme Analysis Guide] [View/Delete]
└─ 📝 Teacher Notes:
   └─ [Edit] Focus on symbolism...

Objective 2.1.B - Compare symbolic meanings [OPTIONAL]
├─ Description: ...
// ... etc
```

**Key Features**:
- Standards expandable/collapsible
- Required/Optional badges on each objective
- "Needs Assessment" flag (red badge) if not assessed in X days
- Quick student progress grid showing mastery status
- Material upload/management inline
- Teacher notes editable
- Color-coded mastery status (green=proficient, yellow=developing, red=needs_support)

---

### Student View: Standards & Objectives Tab

**Layout**:
```
[Standards & Objectives]

Standard 2.1: Analyze Literary Themes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 Unit 2: Literary Analysis
📝 [Description text...]

Your Mastery: 82% ✓ Proficient
Required Objectives: 3 | Available Objectives: 8
Pass Threshold: 80%

[▼ Click to expand objectives]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// When expanded:

Objective 2.1.A - Identify theme statements [REQUIRED]
├─ Your Status: ✓ Proficient (85%)
├─ Your Grade: A
├─ Last Submitted: Aug 8, 2026
├─ Feedback: "Excellent analysis"
├─ 📎 Materials:
│  └─ [Theme Analysis Guide] [Download/Open]
└─ 📝 Teacher Notes:
   └─ Focus on symbolism when teaching this...

Objective 2.1.B - Compare symbolic meanings [OPTIONAL]
├─ Your Status: ⏳ Developing (65%)
├─ Your Grade: C
// ... etc
```

**Key Features**:
- Overall standard mastery % and status
- Expandable objectives showing student's personal progress
- Mastery status clear (✓ Proficient, ⏳ Developing, ⚠️ Approaching, ❌ Needs Support)
- Teacher notes visible to student
- Downloadable materials
- No student comparison or assessment frequency metrics

---

## Database Additions

### Needed Models/Fields

1. **TeacherObjectiveNote** (new model)
   ```prisma
   model TeacherObjectiveNote {
     id String @id @default(cuid())
     classId String
     objectiveId String
     teacherNotes String?
     lastUpdatedBy String
     updatedAt DateTime @updatedAt
     createdAt DateTime @default(now())
   }
   ```

2. **ObjectiveMaterial** (new model)
   ```prisma
   model ObjectiveMaterial {
     id String @id @default(cuid())
     objectiveId String
     classId String
     title String
     type String  // material, assessment, video, link
     url String
     uploadedBy String
     uploadedAt DateTime @default(now())
   }
   ```

3. **ExampleObjective** — Add field:
   ```prisma
   assessmentFrequency Int?  // Days since last assessment (auto-calculated)
   ```

---

## Implementation Timeline

### T1 (Orchestrator) — Backend
- [ ] Create new API endpoints (teacher + student)
- [ ] Query and aggregate student progress data
- [ ] Add TeacherObjectiveNote and ObjectiveMaterial models
- [ ] Create PATCH endpoint for teacher notes
- [ ] Create POST/DELETE endpoints for material uploads
- [ ] Remove old "Skill Setup" tab from navigation

### T4 (Teacher Experience)
- [ ] Remove "Skill Setup" from tab list
- [ ] Build `<StandardsObjectivesTeacher />` component
- [ ] Call new teacher API
- [ ] Implement expand/collapse logic
- [ ] Build inline material upload UI
- [ ] Build inline note editor
- [ ] Add "Needs Assessment" highlighting
- [ ] Test with live data

### T2 (Student Experience)
- [ ] Add "Standards & Objectives" tab to student dashboard
- [ ] Build `<StandardsObjectivesStudent />` component
- [ ] Call new student API
- [ ] Implement expand/collapse logic
- [ ] Display mastery status with color coding
- [ ] Show teacher notes
- [ ] Test with live data

---

## Success Criteria

✅ Teacher can view all standards → expand to see objectives with:
  - Required/optional status
  - Student progress for each objective
  - Material attachments
  - Editable teacher notes
  - "Needs Assessment" flags

✅ Student can view standards → expand to see objectives with:
  - Personal mastery status
  - Teacher notes for context
  - Downloadable materials
  - Clear progress indicators

✅ Both views call unified backend APIs
✅ No duplicate Standards/Objectives tabs
✅ "Skill Setup" tab removed
✅ Build passes TypeScript
✅ Mobile responsive (375px+ students, 600px+ teachers)
