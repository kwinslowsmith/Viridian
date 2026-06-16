# K12 Standards Interface API - Testing Guide

This document outlines testing scenarios for the 4 new K12 Standards API endpoints.

## Test Database Setup

Before running tests, ensure you have:
1. A K12Class record with at least one Standard assigned
2. Standards grouped by Units
3. ExampleObjectives for the standards
4. Some ClassObjective customizations with isActive=true/false
5. A custom objective created by a teacher

### Sample SQL to Create Test Data

```sql
-- Create organization
INSERT INTO "Organization" (id, name, slug, topic, "isPublic", "createdAt", "updatedAt")
VALUES ('org-test', 'Test School', 'test-school', 'education', false, NOW(), NOW());

-- Create user (teacher)
INSERT INTO "User" (id, email, name, role, "emailVerified", "createdAt", "updatedAt")
VALUES ('user-teacher', 'teacher@test.com', 'Mr. Teacher', 'instructor', true, NOW(), NOW());

-- Create standards bank
INSERT INTO "StandardsBank" (id, name, subject, "gradeLevel", "createdAt", "updatedAt")
VALUES ('bank-apush', 'AP US History 2024', 'History', '11', NOW(), NOW());

-- Create units
INSERT INTO "Unit" (id, "standardsBankId", code, name, subtitle, "sequenceNum", "createdAt", "updatedAt")
VALUES 
  ('unit-1', 'bank-apush', '1', 'Unit 1: Period 1 (1491-1607)', NULL, 1, NOW(), NOW()),
  ('unit-2', 'bank-apush', '2', 'Unit 2: Period 2 (1607-1754)', NULL, 2, NOW(), NOW());

-- Create standards
INSERT INTO "Standard" (id, "standardsBankId", code, name, description, "type", "unitId", "passPercentage", "createdAt", "updatedAt")
VALUES
  ('std-1-1', 'bank-apush', '1.1', 'Native Americans and the Land', 'Understanding pre-Columbian societies', 'content', 'unit-1', 80, NOW(), NOW()),
  ('std-1-2', 'bank-apush', '1.2', 'Exploration and Contact', 'European exploration and early contact', 'content', 'unit-1', 80, NOW(), NOW()),
  ('std-2-1', 'bank-apush', '2.1', 'Colonial Foundations', 'Establishment of colonies', 'content', 'unit-2', 80, NOW(), NOW());

-- Create example objectives for std-1-1
INSERT INTO "ExampleObjective" (id, "standardId", label, text, description, "learningTarget", "evidenceCriteria", "source", "sequenceNum", "createdAt", "updatedAt")
VALUES
  ('obj-1-1-a', 'std-1-1', 'A', 'Identify major Native American civilizations', NULL, 'Know the names and basic characteristics', 'Can list 3+ major civilizations', 'curriculum', 1, NOW(), NOW()),
  ('obj-1-1-b', 'std-1-1', 'B', 'Analyze geographic and economic factors', NULL, 'Understand how geography shaped societies', 'Can explain 2+ connections', 'curriculum', 2, NOW(), NOW()),
  ('obj-1-1-c', 'std-1-1', 'C', 'Evaluate pre-Columbian achievements', NULL, 'Advanced analysis of achievements', 'Written essay with 3+ examples', 'curriculum', 3, NOW(), NOW());

-- Create example objectives for std-2-1
INSERT INTO "ExampleObjective" (id, "standardId", label, text, description, "learningTarget", "evidenceCriteria", "source", "sequenceNum", "createdAt", "updatedAt")
VALUES
  ('obj-2-1-a', 'std-2-1', 'A', 'Describe key colonial charter', NULL, 'Identify major charter features', 'Can explain 2+ charters', 'curriculum', 1, NOW(), NOW()),
  ('obj-2-1-b', 'std-2-1', 'B', 'Compare colonial regions', NULL, 'Understand regional differences', 'Can compare 2+ regions', 'curriculum', 2, NOW(), NOW());

-- Create K12 class
INSERT INTO "K12Class" (id, name, "organizationId", "instructorId", "gradeLevel", subject, "startDate", "endDate", "numUnits", "numWeeks", status, "createdAt", "updatedAt")
VALUES ('class-apush', 'AP US History Period 3', 'org-test', 'user-teacher', '11', 'history', '2024-09-01', '2025-05-30', 8, 36, 'active', NOW(), NOW());

-- Assign standards to class
INSERT INTO "ClassStandard" (id, "classId", "standardId", "createdAt", "updatedAt")
VALUES
  ('cs-1', 'class-apush', 'std-1-1', NOW(), NOW()),
  ('cs-2', 'class-apush', 'std-1-2', NOW(), NOW()),
  ('cs-3', 'class-apush', 'std-2-1', NOW(), NOW());

-- Create class objective customizations
INSERT INTO "ClassObjective" (id, "classId", "exampleObjectiveId", "customText", "isActive", "objectiveDescription", "googleDocUrl", "isMandatory", "deletedAt", "createdAt", "updatedAt")
VALUES
  ('co-1', 'class-apush', 'obj-1-1-a', NULL, true, 'Focus on the three main civilizations covered in chapter 2', 'https://docs.google.com/document/d/1abc123', false, NULL, NOW(), NOW()),
  ('co-2', 'class-apush', 'obj-1-1-b', NULL, true, NULL, NULL, true, NULL, NOW(), NOW()),
  ('co-3', 'class-apush', 'obj-1-1-c', NULL, false, 'Save this for the AP practice exam review', NULL, false, NULL, NOW(), NOW()),
  ('co-4', 'class-apush', 'obj-2-1-a', NULL, true, NULL, NULL, false, NULL, NOW(), NOW());
```

## Test Endpoint 1: GET /api/k12-classes/[classId]/standards-by-unit

**Purpose:** Returns hierarchical data: Units → Standards → Objectives with teacher/student view filtering

### Test Case 1.1: Teacher View (Default)
```bash
curl -X GET "http://localhost:3000/api/k12-classes/class-apush/standards-by-unit"
```

**Expected Response:**
- Returns all units with their standards and objectives
- All objectives returned (even if isActive=false)
- Includes ClassObjective customization data
- No N+1 queries (single efficient query)

**Assertions:**
- Status: 200
- Response includes Units array sorted by sequenceNum
- Each unit has standards array
- Each standard has objectives array
- Objectives include: id, label, text, isActive, objectiveDescription, googleDocUrl, isMandatory
- No duplicate data in response

### Test Case 1.2: Student View
```bash
curl -X GET "http://localhost:3000/api/k12-classes/class-apush/standards-by-unit?view=student"
```

**Expected Response:**
- Only returns objectives where isActive=true
- Excludes obj-1-1-c (which has isActive=false)
- Includes only 3 objectives per standard shown

**Assertions:**
- Status: 200
- Total objectives returned < total objectives in database
- Only objectives with isActive=true are in response
- obj-1-1-c is NOT in response (was marked isActive=false)

### Test Case 1.3: Invalid View Parameter
```bash
curl -X GET "http://localhost:3000/api/k12-classes/class-apush/standards-by-unit?view=invalid"
```

**Expected Response:**
- Status: 400
- Error: "Invalid view parameter..."

### Test Case 1.4: Non-existent Class
```bash
curl -X GET "http://localhost:3000/api/k12-classes/nonexistent/standards-by-unit"
```

**Expected Response:**
- Status: 404
- Error: "Class not found"

---

## Test Endpoint 2: PATCH /api/k12-classes/[classId]/objectives/[objectiveId]

**Purpose:** Update objective customization with upsert pattern

### Test Case 2.1: Update Existing ClassObjective
```bash
curl -X PATCH "http://localhost:3000/api/k12-classes/class-apush/objectives/obj-1-1-a" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false,
    "objectiveDescription": "Updated description for testing",
    "googleDocUrl": "https://docs.google.com/document/d/1xyz789",
    "isMandatory": true
  }'
```

**Expected Response:**
- Status: 200
- Returns full objective with ClassObjective data updated
- objectiveDescription, googleDocUrl, isMandatory are updated
- isActive is set to false

**Assertions:**
- Updated ClassObjective reflects all changes
- Objective metadata (text, label, etc.) returned unchanged

### Test Case 2.2: Create New ClassObjective (Upsert)
```bash
curl -X PATCH "http://localhost:3000/api/k12-classes/class-apush/objectives/obj-2-1-b" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": true,
    "objectiveDescription": "Newly added customization",
    "isMandatory": false
  }'
```

**Expected Response:**
- Status: 200
- Creates new ClassObjective if it didn't exist
- classObjectiveId is returned (new record created)
- All fields set to provided values

**Assertions:**
- New ClassObjective created
- isActive defaults to true if not specified
- isMandatory defaults to false if not specified

### Test Case 2.3: Partial Update
```bash
curl -X PATCH "http://localhost:3000/api/k12-classes/class-apush/objectives/obj-1-1-b" \
  -H "Content-Type: application/json" \
  -d '{
    "googleDocUrl": "https://docs.google.com/document/d/1newdoc"
  }'
```

**Expected Response:**
- Status: 200
- Only googleDocUrl is updated
- Other fields remain unchanged

### Test Case 2.4: Non-existent Objective
```bash
curl -X PATCH "http://localhost:3000/api/k12-classes/class-apush/objectives/nonexistent" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

**Expected Response:**
- Status: 404
- Error: "Objective not found"

---

## Test Endpoint 3: POST /api/k12-classes/[classId]/standards/[standardId]/objectives

**Purpose:** Create custom teacher-authored objectives

### Test Case 3.1: Create Valid Custom Objective
```bash
curl -X POST "http://localhost:3000/api/k12-classes/class-apush/standards/std-1-1/objectives" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "D",
    "text": "Synthesize complex patterns across civilizations",
    "description": "Advanced synthesis task",
    "learningTarget": "Create connections between civilizations",
    "evidenceCriteria": "Venn diagram with 5+ connections"
  }'
```

**Expected Response:**
- Status: 201
- Returns new custom objective with:
  - id: (new cuid)
  - label: "D"
  - text: (as provided)
  - source: "custom"
  - sequenceNum: 4 (next in sequence)
  - classObjectiveId: (auto-created ClassObjective id)
  - isActive: true

**Assertions:**
- New ExampleObjective created with source="custom"
- New ClassObjective auto-created with isActive=true
- sequenceNum incremented correctly
- Label stored as uppercase

### Test Case 3.2: Duplicate Label
```bash
curl -X POST "http://localhost:3000/api/k12-classes/class-apush/standards/std-1-1/objectives" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "A",
    "text": "Duplicate objective"
  }'
```

**Expected Response:**
- Status: 409
- Error: "Objective with label 'A' already exists..."

### Test Case 3.3: Standard Not Assigned to Class
```bash
-- First create another class without std-1-2 assigned
curl -X POST "http://localhost:3000/api/k12-classes/class-other/standards/std-1-2/objectives" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "E",
    "text": "Test custom objective"
  }'
```

**Expected Response:**
- Status: 403
- Error: "Standard not assigned to this class"

### Test Case 3.4: Missing Required Fields
```bash
curl -X POST "http://localhost:3000/api/k12-classes/class-apush/standards/std-1-1/objectives" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "E"
  }'
```

**Expected Response:**
- Status: 400
- Error: "label and text are required"

### Test Case 3.5: Non-existent Standard
```bash
curl -X POST "http://localhost:3000/api/k12-classes/class-apush/standards/nonexistent/objectives" \
  -H "Content-Type: application/json" \
  -d '{"label": "X", "text": "Test"}'
```

**Expected Response:**
- Status: 404
- Error: "Standard not found"

---

## Test Endpoint 4: DELETE /api/k12-classes/[classId]/objectives/[objectiveId]/delete

**Purpose:** Soft delete custom objectives (protection against curriculum deletion)

### Test Case 4.1: Delete Custom Objective
```bash
-- First create a custom objective to delete
# (Use Test 3.1 response to get the objectiveId)

curl -X DELETE "http://localhost:3000/api/k12-classes/class-apush/objectives/obj-custom-d/delete"
```

**Expected Response:**
- Status: 200
- Returns: { success: true, message: "...", deletedAt: timestamp }
- ClassObjective.deletedAt is set to current timestamp

**Assertions:**
- Soft delete occurred (deletedAt column populated)
- Physical record not deleted
- Objective no longer appears in GET requests (filtered by deletedAt IS NULL)

### Test Case 4.2: Delete Curriculum Objective (Should Fail)
```bash
curl -X DELETE "http://localhost:3000/api/k12-classes/class-apush/objectives/obj-1-1-a/delete"
```

**Expected Response:**
- Status: 403
- Error: "Cannot delete curriculum objective..."

**Assertions:**
- obj-1-1-a has source="curriculum"
- Deletion blocked
- No changes made to database

### Test Case 4.3: Non-existent Objective
```bash
curl -X DELETE "http://localhost:3000/api/k12-classes/class-apush/objectives/nonexistent/delete"
```

**Expected Response:**
- Status: 404
- Error: "Objective not found"

### Test Case 4.4: Objective Not Assigned to Class
```bash
curl -X DELETE "http://localhost:3000/api/k12-classes/class-other/objectives/obj-1-1-a/delete"
```

**Expected Response:**
- Status: 404
- Error: "Objective not assigned to this class"

---

## Integration Test: Full Workflow

```bash
# 1. Get standards with teacher view
curl -X GET "http://localhost:3000/api/k12-classes/class-apush/standards-by-unit"

# 2. Create custom objective
curl -X POST "http://localhost:3000/api/k12-classes/class-apush/standards/std-1-1/objectives" \
  -H "Content-Type: application/json" \
  -d '{"label": "Z", "text": "Custom test objective"}'

# Save the returned objectiveId

# 3. Update the custom objective
curl -X PATCH "http://localhost:3000/api/k12-classes/class-apush/objectives/{objectiveId}" \
  -H "Content-Type: application/json" \
  -d '{"googleDocUrl": "https://example.com", "isMandatory": true}'

# 4. Verify it appears in student view
curl -X GET "http://localhost:3000/api/k12-classes/class-apush/standards-by-unit?view=student"

# 5. Delete it
curl -X DELETE "http://localhost:3000/api/k12-classes/class-apush/objectives/{objectiveId}/delete"

# 6. Verify it no longer appears in student view
curl -X GET "http://localhost:3000/api/k12-classes/class-apush/standards-by-unit?view=student"
```

---

## Performance Checklist

- [ ] Endpoint 1 (GET by unit) uses single efficient query (no N+1)
- [ ] Response time < 100ms for classes with 100+ objectives
- [ ] Endpoint 2 (PATCH) completes in < 50ms
- [ ] Endpoint 3 (POST) completes in < 50ms
- [ ] Endpoint 4 (DELETE) completes in < 50ms
- [ ] All endpoints properly index on classId, exampleObjectiveId, deletedAt

---

## Error Handling Checklist

- [ ] All 400 errors return actionable messages
- [ ] All 403 errors explain permission restrictions
- [ ] All 404 errors clearly identify missing resource
- [ ] All 500 errors log full error message
- [ ] No sensitive data in error responses
- [ ] Consistent error response format

---

## Database State Checklist After Tests

After running all tests, verify:
- [ ] ExampleObjective table has source column with curriculum/custom values
- [ ] ClassObjective has objectiveDescription, googleDocUrl, isMandatory columns
- [ ] ClassObjective has deletedAt column with soft-deleted records
- [ ] Custom objectives have deletedAt=NULL or timestamp
- [ ] Curriculum objectives cannot have source='custom'
- [ ] All indexes created as specified
