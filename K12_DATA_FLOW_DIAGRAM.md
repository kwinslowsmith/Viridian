# K12 Standards Interface - Data Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Viridian Frontend                        │
│                     (Teacher & Student Apps)                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   GET (view)     PATCH (update)  POST (create)  DELETE (custom)
        │              │              │              │
        ▼              ▼              ▼              ▼
   ┌──────────────────────────────────────────────────────────┐
   │          K12 Standards Interface API Endpoints          │
   ├──────────────────────────────────────────────────────────┤
   │ 1. GET /standards-by-unit (teacher/student view filter)  │
   │ 2. PATCH /objectives/[id] (upsert customization)         │
   │ 3. POST /objectives (create custom)                      │
   │ 4. DELETE /objectives/[id] (soft delete)                 │
   └──────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   ┌────────────┐ ┌────────────┐ ┌───────────────┐
   │ Validation │ │Query Prep  │ │Authorization  │
   │            │ │            │ │               │
   │ - Class OK │ │ - Fetch    │ │ - Curriculum  │
   │ - Standard │ │   relations│ │   protection  │
   │ - Objective│ │ - Map      │ │ - Ownership   │
   │ - Label DUP│ │   customs  │ │   checks      │
   └────────────┘ └────────────┘ └───────────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │                           │
        │   Prisma ORM Layer        │
        │                           │
        │ • classStandard.findMany  │
        │ • standard.include        │
        │ • classObjective          │
        │ • exampleObjective        │
        │ • upsert/create/update    │
        │                           │
        └─────────────┬─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │                           │
        │    PostgreSQL Database    │
        │                           │
        │  Schema:                  │
        │  ├─ Unit                  │
        │  ├─ Standard              │
        │  ├─ ExampleObjective      │
        │  ├─ ClassStandard         │
        │  ├─ ClassObjective        │
        │  └─ K12Class              │
        │                           │
        └───────────────────────────┘
```

---

## Endpoint Flow: GET /standards-by-unit

```
Client Request
     │
     │ ?view=teacher|student
     │
     ▼
┌──────────────────────────┐
│ Validate Parameters      │
├──────────────────────────┤
│ • Check view value       │
│ • Verify class exists    │
└──────────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Fetch All Data (2 queries)
├──────────────────────────┤
│ Query 1:                 │
│ SELECT classStandard *   │
│   INCLUDE standard       │
│     INCLUDE unit         │
│     INCLUDE objectives   │
│                          │
│ Query 2:                 │
│ SELECT classObjective *  │
│   WHERE classId          │
│   AND deletedAt IS NULL  │
└──────────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Build Customization Map  │
├──────────────────────────┤
│ Map<objectiveId,         │
│     classObjective>      │
└──────────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Transform to Hierarchical │
├──────────────────────────┤
│ Group by Unit            │
│ │                        │
│ ├─ Standard 1            │
│ │  ├─ Objective A        │
│ │  ├─ Objective B        │
│ │  └─ Objective C        │
│ │                        │
│ └─ Standard 2            │
│    ├─ Objective A        │
│    └─ Objective B        │
└──────────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Apply View Filter        │
├──────────────────────────┤
│ if view = 'student':     │
│   Remove isActive=false  │
│   objectives             │
│ else:                    │
│   Keep all              │
└──────────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Return JSON Response     │
├──────────────────────────┤
│ 200 OK + hierarchical    │
│ data structure           │
└──────────────────────────┘
```

---

## Endpoint Flow: PATCH /objectives/[objectiveId]

```
Client Request
     │
     │ { isActive, description, url, mandatory }
     │
     ▼
┌──────────────────────────┐
│ Validate Request         │
├──────────────────────────┤
│ • Parse JSON             │
│ • Verify class exists    │
│ • Verify objective       │
│   exists                 │
└──────────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Upsert ClassObjective    │
├──────────────────────────┤
│ IF EXISTS:               │
│   UPDATE with provided   │
│   fields                 │
│ ELSE:                    │
│   CREATE with defaults   │
│   + provided fields      │
└──────────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Fetch Full Objective     │
├──────────────────────────┤
│ SELECT ExampleObjective  │
│   + ClassObjective       │
│   metadata               │
└──────────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Return Complete Data     │
├──────────────────────────┤
│ 200 OK + full objective  │
│ with all customizations  │
└──────────────────────────┘
```

---

## Endpoint Flow: POST /objectives (Create Custom)

```
Client Request
     │
     │ { label, text, description?, ... }
     │
     ▼
┌──────────────────────────┐
│ Validate Request         │
├──────────────────────────┤
│ • Required: label, text  │
│ • Label not empty        │
└──────────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Check Prerequisites      │
├──────────────────────────┤
│ • Class exists?          │
│ • Standard exists?       │
│ • Standard assigned to   │
│   class? (ClassStandard) │
│ • Label unique per       │
│   standard?              │
└──────────────────────────┘
     │
     ├─ Fail? → Error 403/404/409
     │
     ▼
┌──────────────────────────┐
│ Calculate NextSeqNum     │
├──────────────────────────┤
│ SELECT MAX(sequenceNum)  │
│   FROM ExampleObjective  │
│ Set nextSeq = max + 1    │
└──────────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Create ExampleObjective  │
├──────────────────────────┤
│ INSERT:                  │
│ • standardId             │
│ • label (uppercase)      │
│ • text                   │
│ • source: 'custom'       │
│ • sequenceNum: nextSeq   │
└──────────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Auto-Create ClassObjective
├──────────────────────────┤
│ INSERT:                  │
│ • classId                │
│ • exampleObjectiveId     │
│ • isActive: true         │
└──────────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Return New Objective     │
├──────────────────────────┤
│ 201 Created + full       │
│ objective data           │
└──────────────────────────┘
```

---

## Endpoint Flow: DELETE /objectives/[objectiveId]

```
Client Request
     │
     │ DELETE /objectives/ID/delete
     │
     ▼
┌──────────────────────────┐
│ Validate Prerequisites   │
├──────────────────────────┤
│ • Class exists?          │
│ • Objective exists?      │
│ • Assigned to class?     │
│   (ClassObjective)       │
└──────────────────────────┘
     │
     ├─ Fail? → Error 404
     │
     ▼
┌──────────────────────────┐
│ Check Source             │
├──────────────────────────┤
│ SELECT source FROM       │
│   ExampleObjective       │
│                          │
│ IF source != 'custom':   │
│   → Error 403 ❌         │
│ ELSE:                    │
│   → Continue ✓           │
└──────────────────────────┘
     │
     ├─ Fail? → Error 403
     │
     ▼
┌──────────────────────────┐
│ Soft Delete              │
├──────────────────────────┤
│ UPDATE ClassObjective    │
│ SET deletedAt = NOW()    │
│ WHERE id = classObjId    │
└──────────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Return Success           │
├──────────────────────────┤
│ 200 OK + success message │
│ + deletedAt timestamp    │
└──────────────────────────┘

Note: ExampleObjective record preserved
      in database for audit trail
```

---

## Data Structure: Hierarchical Response

```
{
  "classId": "class-123",
  "className": "AP US History",
  "view": "teacher",
  "units": [
    {
      "id": "unit-1",
      "code": "1",
      "name": "Unit 1: Period 1",
      "sequenceNum": 1,
      "standards": [
        {
          "id": "std-1-1",
          "code": "1.1",
          "name": "Native Americans",
          "passPercentage": 80,
          "objectives": [
            {
              "id": "obj-1-1-a",
              "label": "A",
              "text": "Identify civilizations",
              ┌─────────────────────────────┐
              │ From ExampleObjective:      │
              │ • description               │
              │ • learningTarget            │
              │ • evidenceCriteria          │
              │ • source (curriculum|custom)│
              │                             │
              │ From ClassObjective:        │
              │ • customText (override)     │
              │ • isActive (show/hide)      │
              │ • objectiveDescription      │
              │ • googleDocUrl              │
              │ • isMandatory (required)    │
              └─────────────────────────────┘
              "source": "curriculum",
              "isActive": true,
              "isMandatory": false,
              "classObjectiveId": "co-1"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Database State Machine

### ExampleObjective States

```
┌─────────────────────┐
│  ExampleObjective   │
├─────────────────────┤
│ source = 'custom'   │  ← Teacher-created
│ source = 'curriculum'│  ← From Standards Bank
└─────────────────────┘
```

### ClassObjective States

```
┌──────────────────────────────────┐
│     ClassObjective Lifecycle     │
├──────────────────────────────────┤
│                                  │
│  CREATED (when standard          │
│    assigned to class)            │
│  ↓                               │
│  ACTIVE (isActive = true)        │
│  ↓                               │
│  INACTIVE (isActive = false)     │
│     OR                           │
│  DELETED (deletedAt != null)     │
│                                  │
└──────────────────────────────────┘

Notes:
• Upsert creates if missing
• Can toggle isActive unlimited times
• Can soft-delete custom only
• GET filters by deletedAt IS NULL
```

---

## Query Performance Profile

```
GET /standards-by-unit
├─ Query 1: classStandard.findMany + includes
│  └─ Cost: O(n standards) + O(m objectives)
│  └─ Indexes: classId, unitId
│  └─ Time: ~30ms
├─ Query 2: classObjective.findMany
│  └─ Cost: O(k customizations)
│  └─ Indexes: classId, deletedAt
│  └─ Time: ~10ms
└─ Client-side mapping
   └─ Cost: O(k) = hash map lookup
   └─ Time: ~5ms
   TOTAL: ~45ms (no N+1)

PATCH /objectives/[id]
├─ Validation: ~5ms
├─ Upsert: ~20ms (1 query)
└─ Fetch full: ~15ms
   TOTAL: ~40ms

POST /objectives
├─ Validation: ~5ms
├─ Create ExampleObjective: ~15ms
├─ Create ClassObjective: ~10ms
└─ Return: ~5ms
   TOTAL: ~35ms

DELETE /objectives/[id]
├─ Validation: ~5ms
├─ Check source: ~5ms
├─ Soft delete: ~10ms
└─ Return: ~5ms
   TOTAL: ~25ms
```

---

## Teacher-Student Data Flow

```
TEACHER VIEW                    STUDENT VIEW
     │                               │
     ▼                               ▼
GET /standards-by-unit         GET /standards-by-unit
     │                          ?view=student
     │                               │
     ├─ Fetch ALL objectives         ├─ Fetch ALL objectives
     │ (isActive=T & F)              │ (isActive=T & F)
     │                               │
     └─ Return ALL in JSON           ├─ Filter by isActive=true
        │                            │
        └─> Teacher App UI           └─> Student App UI
           ├─ Shows all              ├─ Shows only:
           │ ├─ Can customize        │ ├─ Active objectives
           │ ├─ Can toggle isActive  │ ├─ (gray out inactive)
           │ ├─ Can add google doc   │ │
           │ └─ Can mark mandatory   │ └─ Cannot edit
           │                         │
           └─> Can create custom     └─> Can only view
               └─> Can delete custom
```

---

## Error Handling Flow

```
Request → Validation Layer
           │
           ├─ Missing fields? → 400 Bad Request
           ├─ Invalid format? → 400 Bad Request
           │
           ├─ Class not found? → 404 Not Found
           ├─ Standard not found? → 404 Not Found
           ├─ Objective not found? → 404 Not Found
           │
           ├─ Standard not assigned? → 403 Forbidden
           ├─ Cannot delete curriculum? → 403 Forbidden
           │
           ├─ Duplicate label? → 409 Conflict
           │
           └─ Database error? → 500 Server Error
                                    (logged, not exposed)

All errors return:
{
  "error": "Descriptive message"
}
```

---

## Integration Points

```
┌──────────────────────────────────────────┐
│        K12 Standards Interface           │
└──────────────────────┬───────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    ┌────────┐   ┌────────┐   ┌─────────────┐
    │ Teacher│   │Student │   │Assessment   │
    │  App   │   │  App   │   │    System   │
    │        │   │        │   │             │
    │ • View │   │ • View │   │ • Track     │
    │ • Edit │   │ • Study│   │   progress  │
    │ • Create   │ • Submit   │ • Score     │
    │ • Delete   │ assessment │ • Report    │
    └────────┘   └────────┘   └─────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
              ┌────────▼────────┐
              │  K12 Standards  │
              │   Interface     │
              │   (These 4 APIs)│
              └─────────────────┘
```

---

## Summary

- **4 Endpoints** manage complete K12 standards workflow
- **Zero N+1 queries** using efficient Prisma patterns
- **Dual-view design** serves both teachers and students
- **Source tracking** prevents curriculum deletion
- **Soft deletion** preserves audit trail
- **Upsert pattern** simplifies customization
- **Hierarchical response** matches UI needs
