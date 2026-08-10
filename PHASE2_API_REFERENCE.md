# Phase 2: Standards & Objectives API Reference

**Status**: ✅ APIs Live and Ready for Frontend Implementation

This document provides exact API specifications for T2-T4 frontend components.

---

## Teacher Dashboard API

**Endpoint**: `GET /api/k12/classes/[classId]/standards-objectives-teacher`

**Authentication**: Required (teacher who owns the class)

**Example Call**:
```typescript
const response = await fetch('/api/k12/classes/class_123/standards-objectives-teacher');
const data = await response.json();
```

**Response Schema**:
```typescript
{
  "standards": [
    {
      "standardId": "std_abc123",
      "standardCode": "2.1",
      "standardName": "Analyze Literary Themes",
      "description": "Students can identify and analyze major themes...",
      "unitId": "unit_xyz",
      "unitName": "Unit 2: Literary Analysis",
      "requiredObjectiveCount": 3,
      "totalObjectiveCount": 8,
      "classPassPercentage": 80,
      "objectives": [
        {
          "objectiveId": "obj_def456",
          "label": "A",
          "text": "Identify theme statements",
          "description": "Students can articulate theme statements clearly",
          "sequenceNum": 1,
          "isMandatory": true,
          
          // TEACHER-SPECIFIC: Assessment frequency metrics
          "needsAssessmentFrequency": false,  // true if lastAssessedDaysAgo > 14
          "assessmentFrequencyMetric": {
            "lastAssessedDaysAgo": 7,  // null if never assessed
            "submissionCount": 12,  // total submissions across all students
            "averageScore": 82  // class average mastery %
          },
          
          // TEACHER-SPECIFIC: Student progress grid
          "studentProgress": [
            {
              "studentId": "stu_789",
              "studentName": "Jane Chen",
              "masteryStatus": "proficient",  // proficient|developing|approaching|not_started
              "masteryPercent": 85,  // 0-100
              "submittedAt": "2026-08-08T10:30:00Z",  // null if no submissions
              "grade": "A"  // A-F, null if no grade yet
            },
            {
              "studentId": "stu_790",
              "studentName": "Bob Smith",
              "masteryStatus": "developing",
              "masteryPercent": 65,
              "submittedAt": "2026-08-07T14:15:00Z",
              "grade": "D"
            }
            // ... more students
          ],
          
          // TEACHER-SPECIFIC: Attachments
          "materials": [
            {
              "id": "mat_111",
              "title": "Theme Analysis Rubric",
              "type": "material",  // material|assessment|video|link|template
              "url": "https://...",  // might be null for non-URL materials
              "uploadedAt": "2026-08-01T15:00:00Z"
            }
            // ... more materials
          ],
          
          "teacherNotes": "Focus on symbolism. Students struggled with metaphor last year."
        },
        // ... more objectives
      ]
    },
    // ... more standards
  ]
}
```

---

## Student Dashboard API

**Endpoint**: `GET /api/k12/classes/[classId]/standards-objectives-student`

**Authentication**: Required (authenticated user must be enrolled in the class)

**Example Call**:
```typescript
const response = await fetch(`/api/k12/classes/class_123/standards-objectives-student`);
const data = await response.json();
```

**Response Schema**:
```typescript
{
  "standards": [
    {
      "standardId": "std_abc123",
      "standardCode": "2.1",
      "standardName": "Analyze Literary Themes",
      "description": "Students can identify and analyze major themes...",
      "unitId": "unit_xyz",
      "unitName": "Unit 2: Literary Analysis",
      "requiredObjectiveCount": 3,
      "totalObjectiveCount": 8,
      "classPassPercentage": 80,
      
      // STUDENT-SPECIFIC: Standard-level mastery
      "standardMasteryPercent": 82,  // This student's avg across all objectives
      "standardMasteryStatus": "proficient",  // proficient|developing|approaching|not_started
      
      "objectives": [
        {
          "objectiveId": "obj_def456",
          "label": "A",
          "text": "Identify theme statements",
          "description": "Students can articulate theme statements clearly",
          "sequenceNum": 1,
          "isMandatory": true,
          
          // STUDENT-SPECIFIC: Personal progress only
          "studentProgress": {
            "masteryStatus": "proficient",  // proficient|developing|approaching|not_started
            "masteryPercent": 85,  // 0-100
            "submittedAt": "2026-08-08T10:30:00Z",  // null if no submissions
            "grade": "A",  // A-F, null if no grade yet
            "submissions": [  // array of all submissions for this objective
              {
                "score": 85,  // submission score
                "submittedAt": "2026-08-08T10:30:00Z"
              }
              // ... more submissions
            ]
          },
          
          // STUDENT-VISIBLE: Materials
          "materials": [
            {
              "id": "mat_111",
              "title": "Theme Analysis Rubric",
              "type": "material",  // material|assessment|video|link|template
              "url": "https://...",  // link to download/access
              "uploadedAt": "2026-08-01T15:00:00Z"
            }
            // ... more materials
          ],
          
          // STUDENT-VISIBLE: Teacher guidance
          "teacherNotes": "Focus on symbolism. Some examples from class might help!",
          
          // STUDENT-SPECIFIC: Summary message
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

## Status Values

### Mastery Status
- `proficient` — Student has achieved mastery (≥ pass threshold, typically 80%)
- `developing` — Student is making progress (60-79%)
- `approaching` — Student has attempted but needs more work (1-59%)
- `not_started` — No submissions yet (0%)

### Material Types
- `material` — Learning material (guides, articles, PDFs)
- `assessment` — Assessment/rubric files
- `video` — Video links or embeddings
- `link` — External URL reference
- `template` — Templates for student work

---

## Frontend Implementation Notes

### For T4 (Teacher Component)

1. **Call API**:
   ```typescript
   const response = await fetch(`/api/k12/classes/${classId}/standards-objectives-teacher`);
   const data = await response.json();
   ```

2. **Iterate through standards and objectives**:
   - Build expandable standard rows
   - When expanded, show objectives for that standard
   - Display `requiredObjectiveCount` and `totalObjectiveCount`

3. **Color code students by mastery**:
   - `proficient` → Green ✓
   - `developing` → Yellow/Orange
   - `approaching` → Red/Orange
   - `not_started` → Gray

4. **Highlight "Needs Assessment"**:
   - If `needsAssessmentFrequency === true`, show red badge
   - Indicates objective hasn't been assessed in 14+ days

5. **Material Management**:
   - Show materials list under each objective
   - Add upload button to attach new materials
   - Allow delete functionality

6. **Teacher Notes**:
   - Display as editable text (inline edit or modal)
   - Provide PATCH endpoint (T1 can add if needed)

### For T2 (Student Component)

1. **Call API**:
   ```typescript
   const response = await fetch(`/api/k12/classes/${classId}/standards-objectives-student`);
   const data = await response.json();
   ```

2. **Show standard-level summary**:
   - Display `standardMasteryPercent` with status
   - Color code the entire standard row by status

3. **Show objectives on expand**:
   - Display `studentProgress.masteryStatus` for each objective
   - Color code badge (green/yellow/red/gray)
   - Show `studentProgress.masteryPercent` as progress bar

4. **Teacher feedback**:
   - Display `teacherNotes` prominently
   - Show `masterySummary` as encouraging message

5. **Material links**:
   - Make materials clickable/downloadable
   - Use appropriate icons for types (📄 for material, 🎥 for video, 🔗 for link)

---

## Testing with Live Data

### Get a Class ID
```bash
# Login as teacher1@riverside.edu
# Navigate to American Literature class
# Class ID appears in URL: /class/[classId]
# Or check database: SELECT id FROM "K12Class" LIMIT 1
```

### Test Teacher API
```bash
curl -H "Cookie: __Secure-next-auth.session-token=..." \
  https://viridian.vercel.app/api/k12/classes/CLASS_ID/standards-objectives-teacher
```

### Test Student API
```bash
curl -H "Cookie: __Secure-next-auth.session-token=..." \
  https://viridian.vercel.app/api/k12/classes/CLASS_ID/standards-objectives-student
```

---

## Known Limitations (Phase 2)

- ✋ PATCH endpoints for teacher notes/materials not yet implemented (T1 can add if needed)
- ✋ Assessment frequency calculation assumes K12Assessment.objectiveIds is properly populated
- ✋ Grade letter mapping is simplified (A-F based on 20-point bands)
- ✋ No real-time updates (refresh required to see new submissions)

---

## Next Phase (Phase 3)

- [ ] Add PATCH `/api/k12/classes/[classId]/objectives/[objectiveId]/notes` for teacher note edits
- [ ] Add POST/DELETE `/api/k12/classes/[classId]/objectives/[objectiveId]/materials` for material management
- [ ] Real-time updates via WebSocket or polling
- [ ] Mastery calculation refinements (weighted objectives, custom pass thresholds)
