-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "Organization"("name");

-- Insert default organization
INSERT INTO "Organization" (id, name, "createdAt", "updatedAt")
VALUES ('default-org-001', 'Default Organization', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable - Add organizationId with default value
ALTER TABLE "ImprovClass" ADD COLUMN "organizationId" TEXT NOT NULL DEFAULT 'default-org-001';

-- AlterTable - Add organizationId with default value
ALTER TABLE "K12Class" ADD COLUMN "organizationId" TEXT NOT NULL DEFAULT 'default-org-001';

-- AddForeignKey
ALTER TABLE "ImprovClass" ADD CONSTRAINT "ImprovClass_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "K12Class" ADD CONSTRAINT "K12Class_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
