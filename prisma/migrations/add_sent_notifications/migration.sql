-- Add relations to User model for parent-child relationships
ALTER TABLE "User" ADD COLUMN "childrenRelations" TEXT;
ALTER TABLE "User" ADD COLUMN "parentRelations" TEXT;

-- Create SentNotification table
CREATE TABLE "SentNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentChildId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "errorMessage" TEXT,
    CONSTRAINT "SentNotification_parentChildId_fkey" FOREIGN KEY ("parentChildId") REFERENCES "ParentChild" ("id") ON DELETE CASCADE
);

-- Create indexes for SentNotification
CREATE INDEX "SentNotification_parentChildId_idx" ON "SentNotification"("parentChildId");
CREATE INDEX "SentNotification_type_idx" ON "SentNotification"("type");
CREATE INDEX "SentNotification_sentAt_idx" ON "SentNotification"("sentAt");
CREATE INDEX "SentNotification_status_idx" ON "SentNotification"("status");
