# Standards Grouping UI — Setup Instructions

**Status:** ✅ Schema + UI updated | ⏳ Migration needs to be applied | ⏳ Data needs to be populated

---

## What's Done

1. **Schema:** Unit and SkillCategory models created
2. **UI:** K12ObjectivesGrid updated to show:
   - 🎯 Skill Standards section
   - 📖 Content Standards section (grouped by Unit)
3. **API:** `/api/k12-classes/[classId]/objectives` updated to return unit information

---

## What Needs to Happen

### Step 1: Apply the Migration

The migration file exists at:
```
prisma/migrations/add_units_and_skill_categories/migration.sql
```

**To apply:**
```bash
cd /Users/kylewinslowsmith/Desktop/Viridian

# Development (interactive):
npx prisma migrate dev

# Production/Non-interactive:
npx prisma migrate deploy
```

This will:
- Create `Unit` table
- Create `SkillCategory` table
- Add `unitId` and `skillCategoryId` columns to `Standard`
- Add `learningTarget` and `evidenceCriteria` columns to `ExampleObjective`

---

### Step 2: Create Units for Match Charter

Once the migration is applied, create Unit records in the database:

```sql
-- Units for AP World History (Grade 10)
INSERT INTO "Unit" (id, "organizationId", code, name, subtitle, "sequenceNum", "createdAt", "updatedAt")
VALUES
  ('unit-pw-1', '<org-id>', 'Unit 1', 'Unit 1: The Ancient World', 'c. 3500 BCE–c. 600 CE', 1, NOW(), NOW()),
  ('unit-pw-2', '<org-id>', 'Unit 2', 'Unit 2: The Postclassical World', 'c. 600–c. 1450', 2, NOW(), NOW()),
  ('unit-pw-3', '<org-id>', 'Unit 3', 'Unit 3: The Early Modern World', 'c. 1450–c. 1750', 3, NOW(), NOW()),
  ('unit-pw-4', '<org-id>', 'Unit 4', 'Unit 4: Revolutions and Industrialization', 'c. 1750–c. 1900', 4, NOW(), NOW()),
  ('unit-pw-5', '<org-id>', 'Unit 5', 'Unit 5: The Modern World', 'c. 1900–Present', 5, NOW(), NOW());

-- Units for AP US History (Grade 11)
INSERT INTO "Unit" (id, "organizationId", code, name, subtitle, "sequenceNum", "createdAt", "updatedAt")
VALUES
  ('unit-us-1', '<org-id>', 'Period 1', 'Period 1: European Contact to Confederation', '(1491–1607)', 1, NOW(), NOW()),
  ('unit-us-2', '<org-id>', 'Period 2', 'Period 2: Colonial Period', '(1607–1754)', 2, NOW(), NOW()),
  ('unit-us-3', '<org-id>', 'Period 3', 'Period 3: Revolution and Early Republic', '(1754–1800)', 3, NOW(), NOW()),
  ('unit-us-4', '<org-id>', 'Period 4', 'Period 4: Expansion', '(1800–1848)', 4, NOW(), NOW()),
  ('unit-us-5', '<org-id>', 'Period 5', 'Period 5: Civil War and Reconstruction', '(1844–1877)', 5, NOW(), NOW());
```

Replace `<org-id>` with the actual Match Charter organization ID from your database.

---

### Step 3: Link Standards to Units

For each content standard, update the `unitId`:

```sql
-- Example: Link AP World History standards to units
UPDATE "Standard" 
SET "unitId" = 'unit-pw-1' 
WHERE code LIKE 'pw-p1%';  -- Period 1 standards

UPDATE "Standard" 
SET "unitId" = 'unit-pw-2' 
WHERE code LIKE 'pw-p2%';  -- Period 2 standards

-- etc.
```

---

### Step 4: (Optional) Populate Learning Targets & Evidence Criteria

Update ExampleObjectives with detailed learning targets:

```sql
UPDATE "ExampleObjective"
SET 
  "learningTarget" = 'Accurately describes key features of early river valley civilizations',
  "evidenceCriteria" = 'Student identifies agricultural surpluses, social hierarchies, writing systems, and monumental architecture as markers of early civilizations'
WHERE id = '<objective-id>' AND label = 'A';
```

---

## Testing

Once migration + data are applied:

1. Go to a K12 class page → Standards tab
2. You should see:
   - 🎯 Skill Standards (top section)
   - 📖 Content Standards (grouped by Unit below)

---

## Files Changed

- `prisma/schema.prisma` — Added Unit, SkillCategory models
- `app/modules/k12/components/K12ObjectivesGrid.tsx` — Updated UI to group standards
- `app/api/k12-classes/[classId]/objectives/route.ts` — Updated API to return unit info
- `prisma/migrations/add_units_and_skill_categories/migration.sql` — Migration file

---

## Next: Improv Standards

The same separation (Skill vs Content) should be applied to Improv classes, but Improv uses a different schema (ImprovSkill/ImprovObjective instead of Standard/ExampleObjective). This is a separate task.
