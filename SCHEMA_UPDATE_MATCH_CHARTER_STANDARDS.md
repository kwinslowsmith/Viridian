# Schema Update: Content + Skill Standards Organization for Match Charter

**Date:** June 14, 2026  
**Scope:** Standards restructuring to support distinct Content and Skill hierarchies  
**Status:** ✅ Schema updated, migration created (ready to apply)

---

## Problem Statement

Previously, standards were flat structures with a `type` field ("content" | "skill") but no organizational grouping. Match Charter needed:

1. **Content Standards** grouped by **Unit** (e.g., "Unit 1: The Ancient World")
2. **Skill Standards** grouped by **Skill Category** (e.g., "Reasoning Skills", "Historical Thinking Skills")
3. Rich proficiency level details (A/B/C with learning targets + evidence criteria)

The viridian.html reference file showed 20+ objectives per unit with detailed learning targets and evaluation criteria that weren't captured in the simplified Match Charter seed.

---

## Solution: Schema Changes

### 1. New Models

#### `Unit` (for grouping Content Standards)
```prisma
model Unit {
  id              String   @id @default(cuid())
  standardsBankId String?  // Can adopt from standards bank
  organizationId  String?  // Or create org-specific units
  
  code            String   // "1", "Unit 1", "pw-p1"
  name            String   // "Unit 1: The Ancient World"
  subtitle        String?  // "c. 3500 BCE–c. 600 CE"
  description     String?  // Rich description of unit focus
  
  sequenceNum     Int      // Visual order
  
  standards       Standard[] // Content standards in this unit
}
```

#### `SkillCategory` (for grouping Skill Standards)
```prisma
model SkillCategory {
  id              String   @id @default(cuid())
  standardsBankId String?
  organizationId  String?
  
  code            String   // "RS", "HTS", "reasoning-skills"
  name            String   // "Reasoning Skills", "Historical Thinking Skills"
  description     String?
  icon            String?  // Emoji or icon code
  
  sequenceNum     Int      // Visual order
  
  standards       Standard[] // Skill standards in this category
}
```

### 2. Updated Models

#### `Standard` (now categorized)
```prisma
type        String  // "skill" | "content"

// For content standards: grouped by unit
unitId      String?
unit        Unit?

// For skill standards: grouped by skill category
skillCategoryId String?
skillCategory   SkillCategory?
```

#### `ExampleObjective` (now with proficiency details)
```prisma
label              String   // "A", "B", "C"
text               String   // Short learning target
description        String?
learningTarget     String?  // What students can do at this level
evidenceCriteria   String?  // How to know they achieved it
```

### 3. Organizational Relationships

Both `Unit` and `SkillCategory` support:
- **Standards bank adoption** — reference shared standards from a bank (e.g., "AP Standards Bank")
- **Organization customization** — org-specific units/categories for custom standards

This allows:
- Match Charter to adopt AP standards via the bank
- Match Charter to create org-specific skill categories
- Flexible mixing of bank + custom standards

---

## Migration

**File:** `prisma/migrations/add_units_and_skill_categories/migration.sql`

Creates:
- `Unit` table with indexes
- `SkillCategory` table with indexes
- Foreign key columns on `Standard` (unitId, skillCategoryId)
- New columns on `ExampleObjective` (learningTarget, evidenceCriteria)

**To apply:** Run `prisma migrate deploy` in production or `prisma migrate dev` in development (non-interactive deployment uses deploy).

---

## Match Charter Data Restructuring (Next Steps)

The schema is ready. The existing 28 standards + 84 objectives need to be reorganized:

1. **Map current standards to Units**
   - Pre-AP World (Grade 9) — Unit 1 through Unit 5
   - AP World History (Grade 10) — Unit 1 through Unit 9
   - AP Seminar (Grade 11) — Units (simplified scope)
   - AP US History (Grade 11) — Units (simplified scope)
   - AP US Government (Grade 12) — Units (simplified scope)

2. **Populate learning targets + evidence criteria**
   - For each Objective (A/B/C), fill in:
     - `learningTarget`: What students do at this level (from viridian.html)
     - `evidenceCriteria`: How we know they achieved it (rubric language)

3. **Create Skill Categories**
   - "Reasoning Skills" (foundation skills across all courses)
   - "Historical Thinking Skills" (for AP History classes)
   - Others as needed per course

---

## Data Migration Script (To Be Created)

Seed script needed: `scripts/seed-match-charter-standards-v2.ts`

This will:
1. Create Unit records for each course's units
2. Create SkillCategory records
3. Associate existing Standard records with appropriate Unit/SkillCategory
4. Populate learningTarget and evidenceCriteria for each ExampleObjective

---

## Benefits

✅ **Rich pedagogical structure** — Learning targets + evidence criteria per proficiency level  
✅ **Content organization** — Units group related standards  
✅ **Skill organization** — Skill categories show transferable skills  
✅ **Flexible sourcing** — Adopt standards from bank or create custom ones  
✅ **Scalable** — Works for any subject/grade level  

---

## Next: UI Integration

Once data is populated, build UI to:
- Browse units and their standards
- View skill categories and progression
- Display A/B/C objectives with learning targets + evidence
- Filter resources by unit/standard/objective
