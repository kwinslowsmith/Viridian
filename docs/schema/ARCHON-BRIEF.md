# Archon — Start Here

You're designing the database schema for Viridian P1 (Improv Mastery Tracker).

## Your Task

Design a Prisma schema that captures:

1. **Classes** (instructor view: class list, students, weeks)
2. **Students** (per class enrollment)
3. **Skills** (with anchor flags)
4. **Objectives** (nested under skills, with "active" toggle for reassessment)
5. **Weeks** (class timeline)
6. **Student Ratings** (self-evaluation: level + narrative + evidence)
7. **Teacher Ratings** (proficiency assessment: level only)
8. **Assessment Log** (how/when student was assessed: method + date + context)
9. **Feedback** (instructor notes, tied to skills, visible to student)

## Key Decisions (Locked)

✓ **3-level mastery:** Approaching / Developing / Proficient  
✓ **Skill-level ratings:** Not objective-level (objectives are curriculum reference)  
✓ **Student self-rating BEFORE teacher:** Enforced in schema design  
✓ **Revision tracking:** `revised_at` timestamp (replaces original, no version history)  
✓ **Anchor standards:** `isAnchorForUnit` boolean on Skills  
✓ **Active objectives:** `isActive` boolean on Objectives (teacher marks for reassessment)  
✓ **Assessment log:** Separate table tracking method + date + context (not full student response)  
✓ **Discrepancy detection:** Any mismatch between student/teacher levels flags for intervention  

## Deliverables

1. **Prisma schema** (`prisma/schema.prisma`) with all tables, relationships, constraints documented
2. **API specification** (`docs/schema/API.md`) with endpoint shapes for:
   - `GET /api/improv/classes/{classId}/weeks/{weekId}` — week data + all ratings + feedback
   - `POST /api/improv/student-ratings` — submit self-rating
   - `PATCH /api/improv/student-ratings/{id}` — revise self-rating after teacher feedback
   - `POST /api/improv/teacher-ratings` — submit teacher rating
   - `GET /api/improv/student/{studentId}/ratings-comparison?weekId={weekId}` — side-by-side comparison
   - `POST /api/improv/feedback` — submit feedback
   - `GET /api/improv/assessment-log?studentId={studentId}&weekId={weekId}` — assessment history

3. **Design notes** (`docs/schema/DESIGN.md`) documenting:
   - Entity relationships and why they're shaped this way
   - Indexing strategy (what queries need to be fast?)
   - Data integrity constraints (what makes invalid states impossible?)
   - Migration strategy for production

## References

- Filled-in brief: `/Users/kylewinslowsmith/Desktop/KyleOS/team-inbox/BRIEF-REVISED-Archon-Viridian-P1-Schema.md`
- Reference app: `github.com/kwinslowsmith/mastery-app` (NestJS + Next.js, multi-tenant)
- Kyle's data shapes: `improv-tracker.jsx` (in KyleOS)

## Timeline

**Start:** Tuesday June 2  
**Due:** Friday June 5 (working model)  
**Coordination:** Daily async with Iris (data requirements) and Sage (API contracts)

---

Ready? Create the schema file and design doc in this directory. Push to GitHub when ready.
