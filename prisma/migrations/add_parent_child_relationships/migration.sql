-- Add parent-child relationships table
CREATE TABLE "ParentChild" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "parentId" TEXT NOT NULL,
  "childId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ParentChild_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User" ("id") ON DELETE CASCADE,
  CONSTRAINT "ParentChild_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- Create unique constraint
CREATE UNIQUE INDEX "ParentChild_parentId_childId_key" ON "ParentChild"("parentId", "childId");

-- Create indexes for faster lookups
CREATE INDEX "ParentChild_parentId_idx" ON "ParentChild"("parentId");
CREATE INDEX "ParentChild_childId_idx" ON "ParentChild"("childId");
