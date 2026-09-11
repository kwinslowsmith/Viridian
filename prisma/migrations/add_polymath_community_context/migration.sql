-- Add community support to Conversation model
ALTER TABLE "Conversation" ADD COLUMN "communityId" TEXT;
ALTER TABLE "Conversation" ADD COLUMN "isPinned" BOOLEAN NOT NULL DEFAULT false;

-- Add foreign key for community
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "LearningCommunity"("id") ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX "Conversation_communityId_idx" ON "Conversation"("communityId");

-- Create PolymathMeeting table
CREATE TABLE "PolymathMeeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "communityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "zoomUrl" TEXT,
    "location" TEXT,
    "hostId" TEXT NOT NULL,
    "notes" TEXT,
    "recordingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PolymathMeeting_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "LearningCommunity"("id") ON DELETE CASCADE,
    CONSTRAINT "PolymathMeeting_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Add indexes for PolymathMeeting
CREATE INDEX "PolymathMeeting_communityId_idx" ON "PolymathMeeting"("communityId");
CREATE INDEX "PolymathMeeting_hostId_idx" ON "PolymathMeeting"("hostId");
CREATE INDEX "PolymathMeeting_scheduledAt_idx" ON "PolymathMeeting"("scheduledAt");
