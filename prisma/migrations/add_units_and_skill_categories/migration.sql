-- Create Unit table (for organizing content standards)
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "standardsBankId" TEXT,
    "organizationId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "sequenceNum" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Unit_standardsBankId_fkey" FOREIGN KEY ("standardsBankId") REFERENCES "StandardsBank" ("id") ON DELETE CASCADE,
    CONSTRAINT "Unit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE
);

-- Create SkillCategory table (for organizing skill standards)
CREATE TABLE "SkillCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "standardsBankId" TEXT,
    "organizationId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sequenceNum" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SkillCategory_standardsBankId_fkey" FOREIGN KEY ("standardsBankId") REFERENCES "StandardsBank" ("id") ON DELETE CASCADE,
    CONSTRAINT "SkillCategory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE
);

-- Add indexes for Unit
CREATE UNIQUE INDEX "Unit_standardsBankId_code_key" ON "Unit"("standardsBankId", "code");
CREATE INDEX "Unit_standardsBankId_idx" ON "Unit"("standardsBankId");
CREATE INDEX "Unit_organizationId_idx" ON "Unit"("organizationId");

-- Add indexes for SkillCategory
CREATE UNIQUE INDEX "SkillCategory_standardsBankId_code_key" ON "SkillCategory"("standardsBankId", "code");
CREATE INDEX "SkillCategory_standardsBankId_idx" ON "SkillCategory"("standardsBankId");
CREATE INDEX "SkillCategory_organizationId_idx" ON "SkillCategory"("organizationId");

-- Add columns to Standard table
ALTER TABLE "Standard" ADD COLUMN "unitId" TEXT;
ALTER TABLE "Standard" ADD COLUMN "skillCategoryId" TEXT;

-- Add foreign key constraints
ALTER TABLE "Standard" ADD CONSTRAINT "Standard_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE SET NULL;
ALTER TABLE "Standard" ADD CONSTRAINT "Standard_skillCategoryId_fkey" FOREIGN KEY ("skillCategoryId") REFERENCES "SkillCategory" ("id") ON DELETE SET NULL;

-- Add indexes for Standard's new columns
CREATE INDEX "Standard_unitId_idx" ON "Standard"("unitId");
CREATE INDEX "Standard_skillCategoryId_idx" ON "Standard"("skillCategoryId");

-- Add columns to ExampleObjective table
ALTER TABLE "ExampleObjective" ADD COLUMN "learningTarget" TEXT;
ALTER TABLE "ExampleObjective" ADD COLUMN "evidenceCriteria" TEXT;
