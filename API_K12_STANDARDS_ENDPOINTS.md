# K12 Standards REST API Endpoints

## Overview

Three new REST API endpoints for the Viridian K12 Standards Mastery Tracking System:

1. **Standards Management** - GET/POST/PUT/DELETE standards
2. **Student Progress Tracking** - GET/PUT/DELETE individual student progress
3. **Class Mastery Grid** - GET class-level mastery summary with matrix

All endpoints require:
- Valid NextAuth session (logged-in user)
- Organization scope (domain/organizationId parameter)
- Role-based access control (Teacher, Admin, etc.)

---

## Endpoint 1: Standards Management

### Base Path
```
/api/standards
```

### GET - List All Standards for a Domain

**Endpoint:** `GET /api/standards?domain=[organizationId]`

**Query Parameters:**
- `domain` (required) - Organization ID
- `type` (optional) - Filter by "skill" or "content"
- `unitId` (optional) - Filter by unit ID
- `skillCategoryId` (optional) - Filter by skill category ID

**Authentication:** User logged in + access to organization

**Response (200 OK):**
```json
{
  "standards": [
    {
      "id": "std_001",
      "code": "2.1",
      "name": "Causes of Conflict",
      "description": "Understanding the root causes of historical conflicts",
      "type": "content",
      "passPercentage": 80,
      "unit": {
        "id": "unit_001",
        "name": "Unit 2: The Civil War"
      },
      "skillCategory": null,
      "objectiveCount": 3,
      "objectives": [
        {
          "id": "obj_001",
          "label": "A",
          "text": "Identify 3+ causes",
          "description": "Students should identify at least 3 causes",
          "sequenceNum": 0
        }
      ],
      "stats": {
        "studentsTracked": 24,
        "resourcesLinked": 5
      }
    }
  ],
  "count": 12
}
```

**Curl Example:**
```bash
curl -X GET "http://localhost:3000/api/standards?domain=org_abc123&type=content" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json"
```

**Postman Example:**
```
GET /api/standards?domain=org_abc123&type=content
Headers:
  Authorization: Bearer YOUR_SESSION_TOKEN
  Content-Type: application/json
```

---

### POST - Create New Standard

**Endpoint:** `POST /api/standards`

**Required:** Admin or SchoolAdmin role

**Request Body:**
```json
{
  "domain": "org_abc123",
  "code": "2.2",
  "name": "Political Realignment",
  "description": "Understanding shifts in political alignment",
  "type": "content",
  "unitId": "unit_001",
  "passPercentage": 75,
  "objectives": [
    {
      "label": "A",
      "text": "Identify political parties",
      "description": "Students identify the major political parties of the era"
    },
    {
      "label": "B",
      "text": "Analyze party platforms",
      "description": "Students analyze and compare party platforms"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": "std_002",
  "code": "2.2",
  "name": "Political Realignment",
  "description": "Understanding shifts in political alignment",
  "type": "content",
  "passPercentage": 75,
  "unit": { "id": "unit_001", "name": "Unit 2" },
  "objectives": [...]
}
```

**Curl Example:**
```bash
curl -X POST "http://localhost:3000/api/standards" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "org_abc123",
    "code": "2.2",
    "name": "Political Realignment",
    "type": "content",
    "unitId": "unit_001",
    "objectives": [
      {"label": "A", "text": "Identify political parties"}
    ]
  }'
```

---

### PUT - Update Standard

**Endpoint:** `PUT /api/standards`

**Required:** Admin or SchoolAdmin role

**Request Body:**
```json
{
  "standardId": "std_001",
  "domain": "org_abc123",
  "name": "Updated Standard Name",
  "passPercentage": 85
}
```

**Response (200 OK):**
```json
{
  "id": "std_001",
  "code": "2.1",
  "name": "Updated Standard Name",
  "passPercentage": 85,
  ...
}
```

**Curl Example:**
```bash
curl -X PUT "http://localhost:3000/api/standards" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "standardId": "std_001",
    "domain": "org_abc123",
    "passPercentage": 85
  }'
```

---

### DELETE - Delete Standard

**Endpoint:** `DELETE /api/standards`

**Required:** Admin or SchoolAdmin role

**Request Body:**
```json
{
  "standardId": "std_001",
  "domain": "org_abc123"
}
```

**Response (200 OK):**
```json
{
  "message": "Standard deleted successfully"
}
```

**Curl Example:**
```bash
curl -X DELETE "http://localhost:3000/api/standards" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "standardId": "std_001",
    "domain": "org_abc123"
  }'
```

---

## Endpoint 2: Student Progress Tracking

### Base Path
```
/api/students
```

### GET - List Students (Teachers/Admins)

**Endpoint:** `GET /api/students?domain=[organizationId]&classId=[classId]`

**Query Parameters:**
- `domain` (required) - Organization ID
- `classId` (optional) - Filter by class

**Authentication:** User logged in + access to organization

**Access Control:**
- Teachers can only see students in their own classes
- Admins can see all students (if no classId specified)

**Response (200 OK):**
```json
{
  "students": [
    {
      "id": "user_001",
      "name": "Alice Johnson",
      "email": "alice@school.edu",
      "classId": "class_001",
      "className": "AP US History - Period 3",
      "enrolledAt": "2024-08-01T10:30:00Z",
      "status": "active"
    }
  ],
  "count": 28
}
```

**Curl Example:**
```bash
curl -X GET "http://localhost:3000/api/students?domain=org_abc123&classId=class_001" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

---

### GET - Get Student's Progress

**Endpoint:** `GET /api/students/[studentId]/progress?domain=[organizationId]`

**Query Parameters:**
- `domain` (required) - Organization ID
- `classId` (optional) - Filter progress by specific class

**Response (200 OK):**
```json
{
  "student": {
    "id": "user_001",
    "name": "Alice Johnson",
    "email": "alice@school.edu",
    "classes": [
      {
        "id": "class_001",
        "name": "AP US History - Period 3",
        "gradeLevel": "11",
        "subject": "history",
        "enrolledAt": "2024-08-01T10:30:00Z",
        "status": "active"
      }
    ]
  },
  "progress": {
    "standards": [
      {
        "standardId": "std_001",
        "standardCode": "2.1",
        "standardName": "Causes of Conflict",
        "standardDescription": "Understanding root causes",
        "type": "content",
        "masteryLevel": 3,
        "completed": true,
        "lastAssessedAt": "2024-08-15T14:20:00Z",
        "completedAt": "2024-08-15T14:20:00Z",
        "classId": "class_001",
        "unit": {
          "id": "unit_001",
          "name": "Unit 2: The Civil War",
          "code": "2"
        },
        "skillCategory": null
      }
    ],
    "objectives": [
      {
        "objectiveId": "obj_001",
        "objectiveLabel": "A",
        "objectiveText": "Identify 3+ causes",
        "standardId": "std_001",
        "completed": true,
        "completedAt": "2024-08-15T14:20:00Z"
      }
    ]
  },
  "summary": {
    "totalStandards": 12,
    "proficientCount": 8,
    "developingCount": 3,
    "approachingCount": 1,
    "unassessedCount": 0,
    "averageMastery": "3.25"
  }
}
```

**Mastery Levels (1-4 scale):**
- `0` - No data / Not assessed
- `1` - Approaching proficiency
- `2` - Developing proficiency
- `3` - Proficient
- `4` - Advanced/Exceeding

**Curl Example:**
```bash
curl -X GET "http://localhost:3000/api/students/user_001/progress?domain=org_abc123" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

---

### PUT - Update Student Progress

**Endpoint:** `PUT /api/students/[studentId]/progress`

**Required:** Teacher of the class

**Request Body:**
```json
{
  "domain": "org_abc123",
  "classId": "class_001",
  "standardId": "std_001",
  "level": 3,
  "completed": true,
  "objectiveProgressUpdates": [
    {
      "objectiveId": "obj_001",
      "completed": true
    },
    {
      "objectiveId": "obj_002",
      "completed": true
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "message": "Student progress updated",
  "progress": {
    "standardId": "std_001",
    "standardCode": "2.1",
    "standardName": "Causes of Conflict",
    "masteryLevel": 3,
    "completed": true,
    "lastAssessedAt": "2024-08-20T10:15:00Z"
  }
}
```

**Curl Example:**
```bash
curl -X PUT "http://localhost:3000/api/students/user_001/progress" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "org_abc123",
    "classId": "class_001",
    "standardId": "std_001",
    "level": 3,
    "completed": true
  }'
```

---

### DELETE - Delete Student Progress

**Endpoint:** `DELETE /api/students/[studentId]/progress`

**Required:** Admin or SchoolAdmin role

**Request Body:**
```json
{
  "domain": "org_abc123",
  "standardId": "std_001"
}
```

**Response (200 OK):**
```json
{
  "message": "Student progress deleted"
}
```

**Curl Example:**
```bash
curl -X DELETE "http://localhost:3000/api/students/user_001/progress" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "org_abc123",
    "standardId": "std_001"
  }'
```

---

## Endpoint 3: Class Mastery Summary Grid

### Base Path
```
/api/classes/[classId]/mastery-summary
```

### GET - Get Class Mastery Grid

**Endpoint:** `GET /api/classes/[classId]/mastery-summary?domain=[organizationId]`

**Query Parameters:**
- `domain` (required) - Organization ID
- `type` (optional) - Filter standards by "skill" or "content"
- `unitId` (optional) - Filter by unit

**Authentication:** User logged in + class instructor or admin

**Response (200 OK):**
```json
{
  "class": {
    "id": "class_001",
    "name": "AP US History - Period 3",
    "gradeLevel": "11",
    "subject": "history",
    "instructorId": "user_teacher_001",
    "instructorName": "Mr. Smith",
    "organizationId": "org_abc123",
    "organizationName": "Match High School"
  },
  "students": [
    {
      "id": "user_001",
      "name": "Alice Johnson",
      "email": "alice@school.edu"
    },
    {
      "id": "user_002",
      "name": "Bob Davis",
      "email": "bob@school.edu"
    }
  ],
  "standards": [
    {
      "id": "std_001",
      "code": "2.1",
      "name": "Causes of Conflict",
      "type": "content",
      "unit": { "id": "unit_001", "code": "2", "name": "Unit 2" },
      "skillCategory": null
    }
  ],
  "matrix": [
    {
      "studentId": "user_001",
      "studentName": "Alice Johnson",
      "studentEmail": "alice@school.edu",
      "masteryByStandard": [
        {
          "standardId": "std_001",
          "standardCode": "2.1",
          "standardName": "Causes of Conflict",
          "masteryLevel": 3,
          "completed": true,
          "lastScoredAt": "2024-08-15T14:20:00Z"
        }
      ]
    },
    {
      "studentId": "user_002",
      "studentName": "Bob Davis",
      "studentEmail": "bob@school.edu",
      "masteryByStandard": [
        {
          "standardId": "std_001",
          "standardCode": "2.1",
          "standardName": "Causes of Conflict",
          "masteryLevel": 2,
          "completed": false,
          "lastScoredAt": null
        }
      ]
    }
  ],
  "summary": {
    "totalStudents": 28,
    "totalStandards": 12,
    "totalAssessments": 336,
    "proficientCount": 224,
    "developingCount": 84,
    "approachingCount": 28,
    "unassessedCount": 0,
    "averageMastery": 3.05,
    "proficiencyRate": "66.7%"
  }
}
```

**Curl Example:**
```bash
curl -X GET "http://localhost:3000/api/classes/class_001/mastery-summary?domain=org_abc123" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

---

### POST - Bulk Update Mastery Levels

**Endpoint:** `POST /api/classes/[classId]/mastery-summary/bulk-update`

**Required:** Class instructor

**Request Body:**
```json
{
  "domain": "org_abc123",
  "updates": [
    {
      "studentId": "user_001",
      "standardId": "std_001",
      "level": 3
    },
    {
      "studentId": "user_002",
      "standardId": "std_001",
      "level": 2
    },
    {
      "studentId": "user_001",
      "standardId": "std_002",
      "level": 4
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "message": "Bulk update complete",
  "results": [
    {
      "studentId": "user_001",
      "standardId": "std_001",
      "status": "success",
      "level": 3
    },
    {
      "studentId": "user_002",
      "standardId": "std_001",
      "status": "success",
      "level": 2
    },
    {
      "studentId": "user_001",
      "standardId": "std_002",
      "status": "success",
      "level": 4
    }
  ],
  "successCount": 3,
  "errorCount": 0
}
```

**Curl Example:**
```bash
curl -X POST "http://localhost:3000/api/classes/class_001/mastery-summary/bulk-update" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "org_abc123",
    "updates": [
      {"studentId": "user_001", "standardId": "std_001", "level": 3},
      {"studentId": "user_002", "standardId": "std_001", "level": 2}
    ]
  }'
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required query parameter: domain (organizationId)"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied to this organization"
}
```

### 404 Not Found
```json
{
  "error": "Standard not found in this organization"
}
```

### 409 Conflict
```json
{
  "error": "Standard code already exists in this organization"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch standards"
}
```

---

## Postman Collection

Import this into Postman as a new collection:

```json
{
  "info": {
    "name": "K12 Standards API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Standards",
      "item": [
        {
          "name": "List Standards",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/api/standards?domain={{org_id}}&type=content",
              "protocol": "http",
              "host": ["localhost:3000"],
              "path": ["api", "standards"],
              "query": [
                {"key": "domain", "value": "{{org_id}}"},
                {"key": "type", "value": "content"}
              ]
            },
            "header": [
              {"key": "Authorization", "value": "Bearer {{session_token}}"}
            ]
          }
        },
        {
          "name": "Create Standard",
          "request": {
            "method": "POST",
            "url": {"raw": "{{base_url}}/api/standards", "path": ["api", "standards"]},
            "header": [{"key": "Authorization", "value": "Bearer {{session_token}}"}],
            "body": {
              "mode": "raw",
              "raw": "{\"domain\": \"{{org_id}}\", \"code\": \"2.2\", \"name\": \"New Standard\", \"type\": \"content\", \"unitId\": \"{{unit_id}}\"}"
            }
          }
        }
      ]
    },
    {
      "name": "Students",
      "item": [
        {
          "name": "Get Student Progress",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/api/students/{{student_id}}/progress?domain={{org_id}}",
              "path": ["api", "students", "{{student_id}}", "progress"],
              "query": [{"key": "domain", "value": "{{org_id}}"}]
            },
            "header": [{"key": "Authorization", "value": "Bearer {{session_token}}"}]
          }
        },
        {
          "name": "Update Student Progress",
          "request": {
            "method": "PUT",
            "url": {"raw": "{{base_url}}/api/students/{{student_id}}/progress", "path": ["api", "students", "{{student_id}}", "progress"]},
            "header": [{"key": "Authorization", "value": "Bearer {{session_token}}"}],
            "body": {
              "mode": "raw",
              "raw": "{\"domain\": \"{{org_id}}\", \"classId\": \"{{class_id}}\", \"standardId\": \"{{standard_id}}\", \"level\": 3}"
            }
          }
        }
      ]
    },
    {
      "name": "Classes",
      "item": [
        {
          "name": "Get Class Mastery Summary",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/api/classes/{{class_id}}/mastery-summary?domain={{org_id}}",
              "path": ["api", "classes", "{{class_id}}", "mastery-summary"],
              "query": [{"key": "domain", "value": "{{org_id}}"}]
            },
            "header": [{"key": "Authorization", "value": "Bearer {{session_token}}"}]
          }
        },
        {
          "name": "Bulk Update Mastery",
          "request": {
            "method": "POST",
            "url": {"raw": "{{base_url}}/api/classes/{{class_id}}/mastery-summary/bulk-update", "path": ["api", "classes", "{{class_id}}", "mastery-summary", "bulk-update"]},
            "header": [{"key": "Authorization", "value": "Bearer {{session_token}}"}],
            "body": {
              "mode": "raw",
              "raw": "{\"domain\": \"{{org_id}}\", \"updates\": [{\"studentId\": \"{{student_id}}\", \"standardId\": \"{{standard_id}}\", \"level\": 3}]}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## Implementation Notes

### File Locations
- `/app/api/standards/route.ts` - Standard CRUD operations
- `/app/api/students/route.ts` - List students
- `/app/api/students/[studentId]/route.ts` - Student progress operations
- `/app/api/classes/[classId]/mastery-summary/route.ts` - Class mastery grid

### Database Tables Used
- `Standard` - Standard definitions
- `StudentStandardProgress` - Student mastery tracking (1-4 scale)
- `StudentObjectiveProgress` - Objective completion tracking
- `K12Class` - Class information
- `K12Enrollment` - Student enrollment
- `OrganizationRole` - Access control

### Access Control Summary
| Endpoint | GET | POST | PUT | DELETE |
|----------|-----|------|-----|--------|
| /api/standards | Any user in org | Admin | Admin | Admin |
| /api/students | Teacher/Admin | - | - | - |
| /api/students/[id]/progress | Teacher/Admin | - | Teacher | Admin |
| /api/classes/[id]/mastery-summary | Teacher/Admin | Teacher | - | - |

### Session Management
All endpoints use NextAuth.js session validation via `getServerSession(authOptions)`. The authOptions are defined in `/lib/auth.ts`.

---

## Testing Instructions

1. **Ensure authenticated session:** All endpoints require valid NextAuth session
2. **Pass organization context:** All requests require `domain` (organizationId) parameter
3. **Use correct HTTP methods:** GET (retrieve), POST (create), PUT (update), DELETE (remove)
4. **Handle responses:** Check status codes; errors include descriptive messages

---

## Next Steps for Frontend Integration

Theia and Daedalus can now wire these endpoints to build:
- Standards picker component
- Student progress dashboard
- Class mastery grid visualization
- Bulk grade entry interface
- Progress charts and analytics

See `/app/components` for existing component patterns to follow.
