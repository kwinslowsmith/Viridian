-- Add source column to ExampleObjective (track curriculum vs custom)
ALTER TABLE "ExampleObjective" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'curriculum';

-- Add new customization columns to ClassObjective
ALTER TABLE "ClassObjective" ADD COLUMN "objectiveDescription" TEXT;
ALTER TABLE "ClassObjective" ADD COLUMN "googleDocUrl" TEXT;
ALTER TABLE "ClassObjective" ADD COLUMN "isMandatory" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ClassObjective" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Add index for soft-deleted objectives in ClassObjective
CREATE INDEX "ClassObjective_deletedAt_idx" ON "ClassObjective"("deletedAt");
