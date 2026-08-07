-- Create LinkingCode table for parent-child linking
CREATE TABLE "LinkingCode" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL
);

-- Create indexes for performance and cleanup
CREATE INDEX "LinkingCode_parentId_idx" ON "LinkingCode"("parentId");
CREATE INDEX "LinkingCode_childId_idx" ON "LinkingCode"("childId");
CREATE INDEX "LinkingCode_expiresAt_idx" ON "LinkingCode"("expiresAt");
