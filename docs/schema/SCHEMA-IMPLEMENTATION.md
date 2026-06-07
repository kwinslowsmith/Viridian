# Viridian P1 Prisma Schema — Implementation Guide

**Status:** ✅ Complete  
**Created:** June 7, 2026  
**Database:** PostgreSQL + Prisma ORM

---

## Overview

This schema powers Viridian P1 (Improv Mastery Tracker). It tracks:
- **Students** and their mastery of **improv skills**
- **Classes** and weekly **skill assessments**
- **Self-ratings** (student's perception) vs **teacher ratings** (instructor's assessment)
- **Feedback** and **learning objectives**

The schema is **domain-agnostic** — same structure works for K-12 Humanities (Phase 2).

---

## Database Setup

### 1. Install Dependencies

```bash
npm install
# This installs @prisma/client and prisma dev dependency
```

### 2. Set Database URL

Create or update `.env.local` in the `prisma/` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/viridian_p1"
```

**Options for PostgreSQL:**
- **Local:** PostgreSQL running on machine (localhost:5432)
- **Docker:** PostgreSQL in Docker container
- **Supabase:** Managed PostgreSQL (recommended for deployment)
- **Railway/Render:** Managed hosting platforms

### 3. Run Migrations

```bash
npm run prisma:migrate
```

This:
1. Creates all tables and relationships in your database
2. Generates Prisma client types
3. Creates migration file in `prisma/migrations/`

### 4. Seed Test Data

```bash
npm run prisma:seed
```

This populates:
- 3 test students (Maya, Jordan, Alex)
- 1 instructor (Kyle)
- 1 test class (Musical Improv Level 2)
- 11 improv skills (all foundation, scene-work, musical)
- 4 weeks of data
- Sample ratings, feedback, and assessments

---

## Schema Overview

### Core Models

#### **User**
Represents instructors and students.

```prisma
User {
  id: String          // UUID
  email: String       // Unique
  name: String
  role: String        // "instructor", "student", "admin"
  
  instructorClasses: ImprovClass[]    // Classes they teach
  improvEnrollments: ImprovEnrollment[] // Classes they're in
}
```

#### **ImprovClass**
A course instance (e.g., "Musical Improv Level 2").

```prisma
ImprovClass {
  id: String
  name: String
  subtitle: String?
  instructorId: String  // FK → User
  
  numWeeks: Int
  status: String        // "active", "archived", "draft"
  startDate, endDate: DateTime
  
  weeks: ImprovWeek[]
  enrollments: ImprovEnrollment[]
}
```

#### **ImprovEnrollment**
Links students to classes (many-to-many with metadata).

```prisma
ImprovEnrollment {
  id: String
  classId: String       // FK → ImprovClass
  studentId: String     // FK → User
  
  status: String        // "active", "dropped", "completed"
  enrolledAt: DateTime
  
  studentRatings: ImprovStudentRating[]
  teacherRatings: ImprovTeacherRating[]
  feedback: ImprovFeedback[]
}
```

#### **ImprovWeek**
A weekly session within a class.

```prisma
ImprovWeek {
  id: String
  classId: String       // FK → ImprovClass
  weekNum: Int          // 1-24 (unique per class)
  
  title: String?        // "Listening and Agreement"
  focusAreas: String?   // Markdown description
  sessionNotes: String? // Instructor observations
  
  weekSkills: ImprovWeekSkill[]      // Anchor skills this week
  studentRatings: ImprovStudentRating[]
  teacherRatings: ImprovTeacherRating[]
  feedback: ImprovFeedback[]
}
```

#### **ImprovSkill**
Curriculum standard (e.g., "Yes And"). Shared across all classes.

```prisma
ImprovSkill {
  id: String
  slug: String          // "yes-and" (URL-safe)
  name: String          // "Yes And"
  category: String      // "foundation", "scene-work", "musical"
  
  description: String?
  levelDefinitions: String? // JSON: { approaching, developing, proficient }
  
  isActive: Boolean     // Soft-delete pattern
  version: Int          // Schema versioning
  
  objectives: ImprovObjective[]
  weekSkills: ImprovWeekSkill[]
}
```

#### **ImprovObjective**
Nested learning targets under a skill (e.g., "Identify offers your partner makes").

```prisma
ImprovObjective {
  id: String
  skillId: String       // FK → ImprovSkill
  sequenceNum: Int      // Order (1, 2, 3...)
  
  text: String          // Learning target
  description: String?
  examples: String?     // Markdown with examples
}
```

#### **ImprovWeekSkill**
Declares which skills are assessed ("anchor") for a given week.

```prisma
ImprovWeekSkill {
  id: String
  weekId: String        // FK → ImprovWeek
  skillId: String       // FK → ImprovSkill
  
  isAnchor: Boolean     // true = assessed this week
  sequenceNum: Int      // Visual order in UI
  
  @@unique([weekId, skillId]) // One entry per skill per week
}
```

#### **ImprovStudentRating**
Student's self-assessment on a skill for a given week.

```prisma
ImprovStudentRating {
  id: String
  enrollmentId: String  // FK → ImprovEnrollment
  weekId: String        // FK → ImprovWeek
  skillId: String       // FK → ImprovSkill
  
  level: String         // "approaching", "developing", "proficient"
  narrative: String?    // "Why I rated myself here..."
  evidence: String?     // "Work that supports this..."
  
  createdAt: DateTime
  revisedAt: DateTime?  // Set if student revises rating
  
  @@unique([enrollmentId, weekId, skillId])
}
```

**Key behavior:** Student can only submit once per skill per week initially. If they revise after teacher feedback, we **update** this record and set `revisedAt`. No version history — just tracks when it changed.

#### **ImprovTeacherRating**
Teacher's observed mastery assessment.

```prisma
ImprovTeacherRating {
  id: String
  enrollmentId: String
  weekId: String
  skillId: String
  
  level: String         // "approaching", "developing", "proficient"
  instructorNotes: String? // Private teacher notes
  
  createdAt, updatedAt: DateTime
  
  @@unique([enrollmentId, weekId, skillId])
}
```

#### **ImprovFeedback**
Instructor feedback tied to a skill.

```prisma
ImprovFeedback {
  id: String
  enrollmentId: String
  weekId: String
  skillId: String?      // Optional (can be week-level feedback)
  
  note: String          // Feedback text
  isVisible: Boolean    // Teacher can hide drafts
  
  createdAt, updatedAt: DateTime
}
```

---

## Query Patterns

### Get All Classes for an Instructor

```typescript
const classes = await prisma.improvClass.findMany({
  where: { instructorId: 'teacher-uuid' },
  include: { enrollments: true, weeks: true },
});
```

### Get Week with All Student/Teacher Ratings

```typescript
const weekDetail = await prisma.improvWeek.findUnique({
  where: { id: 'week-uuid' },
  include: {
    weekSkills: { include: { skill: true } },
    studentRatings: true,
    teacherRatings: true,
    feedback: true,
    class: { include: { enrollments: true } }, // for student names
  },
});
```

### Get Student's Ratings for a Week

```typescript
const studentRatings = await prisma.improvStudentRating.findMany({
  where: {
    enrollment: { studentId: 'student-uuid', classId: 'class-uuid' },
    weekId: 'week-uuid',
  },
  include: { skill: true },
});
```

### Get Ratings Comparison (Student vs Teacher)

```typescript
const comparison = await prisma.improvStudentRating.findMany({
  where: {
    enrollment: { studentId: 'student-uuid' },
    weekId: 'week-uuid',
  },
  include: {
    skill: true,
    enrollment: {
      include: {
        teacherRatings: { where: { weekId: 'week-uuid' } },
      },
    },
  },
});
```

### Get All Feedback for a Student/Week

```typescript
const feedback = await prisma.improvFeedback.findMany({
  where: {
    enrollmentId: 'enrollment-uuid',
    weekId: 'week-uuid',
    isVisible: true,
  },
  include: { skill: true },
});
```

---

## Indexes & Performance

Indexes are automatically created on:
- `ImprovEnrollment`: `(classId, studentId)`
- `ImprovWeek`: `(classId)`
- `ImprovStudentRating`: `(enrollmentId, weekId, skillId)`, `(enrollmentId)`, `(weekId)`, `(skillId)`
- `ImprovTeacherRating`: Same as student ratings
- `ImprovFeedback`: `(enrollmentId, weekId)`, `(skillId)`
- `ImprovSkill`: `(isActive)` for active skills only

These queries should all run in <100ms on typical class sizes (50 students, 12 weeks).

---

## Data Integrity

### Constraints Enforced

1. **Unique enrollments:** One record per student per class
2. **Unique ratings:** One rating per enrollment/week/skill
3. **Unique week skills:** One assignment per skill per week
4. **Cascade deletes:** If a class is deleted, all its data cascades

### What You Can't Do

- Rate a student on a skill not assigned to that week
- Enroll a student in a class twice
- Create rating without enrollment

---

## Phase 2: K-12 Humanities

The schema includes placeholder models for Phase 2:
- `K12Class`
- `K12Enrollment`

These follow the same pattern as Improv models. Full implementation comes June 23-July 7 (design phase).

---

## Troubleshooting

### "Error: P1001 Can't reach database server"
- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Test with: `psql postgresql://...` command

### "Error: P1014 The underlying table does not exist"
- Run migrations: `npm run prisma:migrate`

### "Unique constraint violation"
- Check for duplicate enrollments or ratings
- Run seed cleanup script

### Type generation issues
- Delete `node_modules/.prisma/`
- Run `npm run prisma:generate`

---

## Next Steps

1. ✅ Schema created and migrations ready
2. **Sage's task (June 8):** Build API routes using this schema
3. **Testing (June 11-12):** End-to-end teacher/student workflows

---

**Built by Viridian on June 7, 2026**
