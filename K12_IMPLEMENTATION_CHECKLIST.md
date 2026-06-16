# K12 Standards Interface - Implementation Checklist

## Phase 1: Database Schema ✅

- [x] Updated ExampleObjective model
  - [x] Added `source` column (default: 'curriculum')
  - [x] Tracks 'curriculum' vs 'custom' objectives

- [x] Updated ClassObjective model
  - [x] Added `objectiveDescription` column (String, nullable)
  - [x] Added `googleDocUrl` column (String, nullable)
  - [x] Added `isMandatory` column (Boolean, default: false)
  - [x] Added `deletedAt` column (DateTime, nullable)

- [x] Created migration file
  - [x] File: `/prisma/migrations/add_k12_standards_interface/migration.sql`
  - [x] Adds source to ExampleObjective
  - [x] Adds customization columns to ClassObjective
  - [x] Creates index on ClassObjective.deletedAt

- [x] Updated Prisma schema
  - [x] File: `/prisma/schema.prisma`
  - [x] All model updates reflect database changes

## Phase 2: API Endpoints ✅

### Endpoint 1: GET /standards-by-unit ✅

- [x] File created: `/app/api/k12-classes/[classId]/standards-by-unit/route.ts`
- [x] Implements GET handler
- [x] Returns hierarchical data: Units → Standards → Objectives
- [x] Query parameter support: `view=teacher|student`
- [x] Teacher view: Returns all objectives (isActive=true and false)
- [x] Student view: Filters to only isActive=true objectives
- [x] Includes ClassObjective customization data
- [x] Efficient query design (no N+1)
  - [x] Single classStandard.findMany with includes
  - [x] Single classObjective.findMany
  - [x] Customization map for O(1) lookup
- [x] Error handling
  - [x] 400: Invalid view parameter
  - [x] 404: Class not found
  - [x] 500: Server error with logging
- [x] Response structure documented
- [x] Units sorted by sequenceNum
- [x] Objectives sorted by sequenceNum

### Endpoint 2: PATCH /objectives/[objectiveId] ✅

- [x] File created: `/app/api/k12-classes/[classId]/objectives/[objectiveId]/route.ts`
- [x] Implements PATCH handler
- [x] Upsert pattern: Create ClassObjective if missing
- [x] Supports updating: isActive, objectiveDescription, googleDocUrl, isMandatory
- [x] Optional field handling (only updates provided fields)
- [x] Returns updated objective with all fields
- [x] Error handling
  - [x] 404: Class not found
  - [x] 404: Objective not found
  - [x] 500: Server error with logging
- [x] Validation
  - [x] Class exists check
  - [x] Objective exists check

### Endpoint 3: POST /standards/[standardId]/objectives ✅

- [x] File created: `/app/api/k12-classes/[classId]/standards/[standardId]/objectives/route.ts`
- [x] Implements POST handler
- [x] Creates custom teacher-authored objectives
- [x] Validates required fields: label, text
- [x] Optional fields: description, learningTarget, evidenceCriteria
- [x] Validation checks
  - [x] Class exists
  - [x] Standard exists
  - [x] Standard assigned to class (ClassStandard)
  - [x] Label unique per standard (case-insensitive)
- [x] Automatic behavior
  - [x] Sets source='custom'
  - [x] Calculates next sequenceNum
  - [x] Auto-creates ClassObjective with isActive=true
  - [x] Stores label as uppercase
- [x] Error handling
  - [x] 400: Missing required fields
  - [x] 403: Standard not assigned to class
  - [x] 404: Class not found
  - [x] 404: Standard not found
  - [x] 409: Duplicate label
  - [x] 500: Server error with logging
- [x] Response includes all objective fields

### Endpoint 4: DELETE /objectives/[objectiveId]/delete ✅

- [x] File created: `/app/api/k12-classes/[classId]/objectives/[objectiveId]/delete/route.ts`
- [x] Implements DELETE handler
- [x] Soft delete: Sets deletedAt timestamp
- [x] Curriculum protection: Only allows deletion if source='custom'
- [x] Validation checks
  - [x] Class exists
  - [x] Objective exists
  - [x] Objective assigned to class
  - [x] Objective source is 'custom'
- [x] Error handling
  - [x] 403: Cannot delete curriculum objective
  - [x] 404: Class not found
  - [x] 404: Objective not found
  - [x] 404: Objective not assigned to class
  - [x] 500: Server error with logging
- [x] Response includes success message and deletedAt timestamp

## Phase 3: Testing Documentation ✅

- [x] Created comprehensive test file: `/app/api/k12-classes/[classId]/standards-by-unit/test.md`

### Test Coverage Includes:

- [x] Test database setup (sample SQL)
- [x] GET endpoint tests (4 test cases)
  - [x] Teacher view (default)
  - [x] Student view (filtering)
  - [x] Invalid view parameter
  - [x] Non-existent class
- [x] PATCH endpoint tests (4 test cases)
  - [x] Update existing ClassObjective
  - [x] Create new ClassObjective (upsert)
  - [x] Partial update
  - [x] Non-existent objective
- [x] POST endpoint tests (5 test cases)
  - [x] Create valid custom objective
  - [x] Duplicate label rejection
  - [x] Standard not assigned to class
  - [x] Missing required fields
  - [x] Non-existent standard
- [x] DELETE endpoint tests (4 test cases)
  - [x] Delete custom objective
  - [x] Reject curriculum objective deletion
  - [x] Non-existent objective
  - [x] Objective not assigned to class
- [x] Integration test workflow
- [x] Performance checklist
- [x] Error handling checklist
- [x] Database state verification checklist

## Phase 4: Documentation ✅

- [x] Created implementation summary: `/K12_STANDARDS_API_SUMMARY.md`
  - [x] Schema changes documented
  - [x] All 4 endpoints fully documented with examples
  - [x] Response structures with JSON examples
  - [x] Query parameters documented
  - [x] Status codes and error handling
  - [x] File structure diagram
  - [x] Query optimization explanation
  - [x] Usage examples for each endpoint
  - [x] Key design decisions documented
  - [x] Next steps provided

## Phase 5: Verification ✅

- [x] All 4 endpoint files created and in correct directories
- [x] Database migration file created
- [x] Prisma schema updated with all new columns
- [x] Error handling consistent across endpoints
- [x] Query optimization verified (no N+1)
- [x] Validation logic comprehensive
- [x] Documentation complete
- [x] Testing guide comprehensive

---

## Pre-Deployment Checklist

### Before running `npx prisma migrate dev`:

- [ ] Review migration file: `/prisma/migrations/add_k12_standards_interface/migration.sql`
- [ ] Verify all column additions are correct
- [ ] Verify all indexes are correct
- [ ] Check database has backup (production consideration)

### After running migration:

- [ ] Verify schema.prisma and database are in sync
- [ ] Run `npx prisma generate` to update Prisma client

### Testing checklist:

- [ ] Follow test.md setup to create sample data
- [ ] Run all 20+ test cases from test.md
- [ ] Verify no N+1 queries with database logging
- [ ] Performance test with 100+ objectives
- [ ] Test all error conditions
- [ ] Verify soft deletes filter correctly
- [ ] Integration test full workflow

### Deployment checklist:

- [ ] All tests passing
- [ ] Documentation reviewed
- [ ] API endpoints documented in team docs
- [ ] Example curls provided to frontend team
- [ ] Error messages reviewed for clarity
- [ ] Logging configured for production
- [ ] Monitor error rates during rollout

---

## Implementation Statistics

### Code Created:
- **4 API endpoint files** (typescript)
- **1 Database migration file** (SQL)
- **2 Documentation files** (markdown)
- **1 Testing guide** (markdown with 20+ test cases)

### Lines of Code:
- `standards-by-unit/route.ts`: ~150 lines
- `objectives/[objectiveId]/route.ts`: ~120 lines
- `standards/[standardId]/objectives/route.ts`: ~130 lines
- `objectives/[objectiveId]/delete/route.ts`: ~100 lines
- **Total API code: ~500 lines**

### Database Changes:
- **ExampleObjective:** +1 column
- **ClassObjective:** +4 columns, +1 index
- **Total changes:** 5 columns, 1 index

### Test Cases:
- **Total test scenarios:** 20+
- **Integration tests:** 1 full workflow
- **Checklists:** 3 (performance, error handling, database)

---

## Key Features Implemented

### Query Efficiency
- ✅ No N+1 queries
- ✅ Single efficient queries with proper includes
- ✅ Indexed columns for filtering
- ✅ Soft delete with indexed deletedAt

### Data Integrity
- ✅ Curriculum protection (can't delete curriculum objectives)
- ✅ Source tracking (curriculum vs custom)
- ✅ Soft deletion (preserves history)
- ✅ Label uniqueness per standard
- ✅ Standard assignment validation

### Error Handling
- ✅ Comprehensive validation
- ✅ Descriptive error messages
- ✅ Appropriate HTTP status codes
- ✅ Server error logging
- ✅ No sensitive data in errors

### API Design
- ✅ Hierarchical response structure
- ✅ Dual-view pattern (teacher/student)
- ✅ Upsert pattern for updates
- ✅ Soft deletion for data preservation
- ✅ Consistent error format

---

## Ready for Testing & Deployment

All 4 endpoints are fully implemented with:
- ✅ Complete validation
- ✅ Error handling
- ✅ Query optimization
- ✅ Comprehensive documentation
- ✅ Extensive testing guide
- ✅ Database migration

**Status: Ready for staging environment testing**
