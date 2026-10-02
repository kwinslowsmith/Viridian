-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "role" TEXT NOT NULL DEFAULT 'student',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "topic" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "curatorName" TEXT,
    "curatorBio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandardsBank" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "gradeLevel" TEXT,
    "description" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StandardsBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "standardsBankId" TEXT,
    "organizationId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "sequenceNum" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillCategory" (
    "id" TEXT NOT NULL,
    "standardsBankId" TEXT,
    "organizationId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sequenceNum" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Standard" (
    "id" TEXT NOT NULL,
    "standardsBankId" TEXT,
    "organizationId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'content',
    "unitId" TEXT,
    "skillCategoryId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "passPercentage" INTEGER NOT NULL DEFAULT 80,
    "mandatoryObjectiveIds" TEXT,
    "domainId" TEXT,
    "verificationLevel" TEXT NOT NULL DEFAULT 'unreviewed',
    "endorsedBy" TEXT,
    "aliasOfId" TEXT,
    "supersededBy" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Standard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassStandard" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassStandard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExampleObjective" (
    "id" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "description" TEXT,
    "learningTarget" TEXT,
    "evidenceCriteria" TEXT,
    "sequenceNum" INTEGER NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'curriculum',
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ExampleObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandardResource" (
    "id" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "fileId" TEXT,
    "format" TEXT,
    "objectiveLabels" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StandardResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandardsDistribution" (
    "id" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "distributedBy" TEXT NOT NULL,
    "distributedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" TIMESTAMP(3),

    CONSTRAINT "StandardsDistribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherStandardAssignment" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherStandardAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherObjectiveNote" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "teacherNotes" TEXT,
    "updatedBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherObjectiveNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObjectiveMaterial" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "fileId" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ObjectiveMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandardsDomain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "primaryStewardId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StandardsDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainSteward" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'steward',
    "verificationAuthority" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainSteward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandardAudit" (
    "id" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changeDetails" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StandardAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolAssessment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'major-assessment',
    "assessmentDate" TIMESTAMP(3) NOT NULL,
    "standardsAssessed" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'organization',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterventionGroup" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "meetingSchedule" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterventionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterventionGroupStudent" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "InterventionGroupStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyGuide" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "standardId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "focusObjectives" TEXT,
    "resourceIds" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyGuide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "K12Assessment" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "objectiveIds" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'formative',
    "dueDate" TIMESTAMP(3),
    "visibility" TEXT NOT NULL DEFAULT 'class',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "K12Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "K12Submission" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "grade" INTEGER,
    "feedback" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not-submitted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "K12Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentRating" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "ratedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ratedBy" TEXT NOT NULL,

    CONSTRAINT "StudentRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherRating" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "ratedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ratedBy" TEXT NOT NULL,

    CONSTRAINT "TeacherRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "K12Class" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "organizationId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "numUnits" INTEGER NOT NULL DEFAULT 8,
    "numWeeks" INTEGER NOT NULL DEFAULT 36,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "K12Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "K12Enrollment" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "K12Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "K12Week" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "weekNum" INTEGER NOT NULL,
    "title" TEXT,
    "unit" TEXT,
    "agenda" TEXT,
    "assessments" TEXT,
    "materialsJson" TEXT,
    "sessionNotes" TEXT,
    "sessionNotesUpdatedAt" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "K12Week_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "K12Day" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'lesson',
    "homework" TEXT,
    "materialsJson" TEXT,
    "standardsJson" TEXT,
    "isMajor" BOOLEAN NOT NULL DEFAULT false,
    "googleDocUrl" TEXT,
    "pdfFileKey" TEXT,
    "pdfFileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "K12Day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassObjective" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "exampleObjectiveId" TEXT NOT NULL,
    "customText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "objectiveDescription" TEXT,
    "googleDocUrl" TEXT,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterventionBlock" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "weekNum" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterventionBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "weekNum" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "isStudentCreated" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningCommunity" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "scope" TEXT NOT NULL,
    "organizationId" TEXT,
    "curatorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "requiresApprovalToJoin" BOOLEAN NOT NULL DEFAULT false,
    "topic" TEXT,
    "difficulty" TEXT,
    "estimatedHours" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningCommunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningModule" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sequenceNum" INTEGER NOT NULL,
    "estimatedHours" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningCommunityMember" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "status" TEXT NOT NULL DEFAULT 'active',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "LearningCommunityMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityJoinRequest" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "respondedById" TEXT,

    CONSTRAINT "CommunityJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "preferredMaterialTypes" TEXT,
    "learningInterests" TEXT,
    "preferredTopics" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentCalendarPreference" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "className" TEXT,
    "classType" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "communityId" TEXT,
    "communityName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentCalendarPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationStandardsBankAdoption" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "standardsBankId" TEXT NOT NULL,
    "adoptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationStandardsBankAdoption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentStandardProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "classId" TEXT,
    "level" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "lastScoredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentStandardProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentObjectiveProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentObjectiveProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT,
    "k12ClassId" TEXT,
    "communityId" TEXT,
    "createdById" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "recurrenceType" TEXT NOT NULL DEFAULT 'none',
    "recurrenceEndDate" TIMESTAMP(3),
    "maxAttendees" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRSVP" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'attending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRSVP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "k12ClassId" TEXT,
    "eventId" TEXT,
    "organizationId" TEXT,
    "communityId" TEXT,
    "title" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "isMail" BOOLEAN NOT NULL DEFAULT false,
    "allowReplies" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "googleDocUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "fileKey" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "type" TEXT NOT NULL,
    "format" TEXT,
    "tags" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'org',
    "organizationId" TEXT,
    "createdById" TEXT NOT NULL,
    "k12ClassId" TEXT,
    "communityId" TEXT,
    "resourceLibraryId" TEXT,
    "moduleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceLibrary" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "librarianId" TEXT,
    "organizationalUnitId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationalUnit" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'restricted',
    "accessLevel" TEXT NOT NULL DEFAULT 'admin-assigned',
    "leaderId" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationalUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationalUnitMember" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationalUnitMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "scope" TEXT NOT NULL,
    "organizationId" TEXT,
    "departmentId" TEXT,
    "communityId" TEXT,
    "leadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectClass" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,

    CONSTRAINT "ProjectClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolymathArticle" (
    "id" TEXT NOT NULL,
    "authorType" TEXT NOT NULL DEFAULT 'individual',
    "authorId" TEXT NOT NULL,
    "communityId" TEXT,
    "organizationId" TEXT,
    "eventId" TEXT,
    "title" TEXT NOT NULL,
    "abstract" TEXT,
    "content" TEXT NOT NULL,
    "topic" TEXT,
    "tags" TEXT,
    "estimatedReadTime" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvalChain" TEXT,
    "publishedAt" TIMESTAMP(3),
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolymathArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolymathTool" (
    "id" TEXT NOT NULL,
    "authorType" TEXT NOT NULL DEFAULT 'individual',
    "authorId" TEXT NOT NULL,
    "communityId" TEXT,
    "organizationId" TEXT,
    "eventId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "toolType" TEXT NOT NULL,
    "toolUrl" TEXT,
    "iframeUrl" TEXT,
    "codeRepository" TEXT,
    "thumbnail" TEXT,
    "difficulty" TEXT,
    "estimatedUsageTime" INTEGER,
    "languages" TEXT,
    "accessibilityFeatures" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvalChain" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolymathTool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolymathModule" (
    "id" TEXT NOT NULL,
    "authorType" TEXT NOT NULL DEFAULT 'individual',
    "authorId" TEXT NOT NULL,
    "communityId" TEXT,
    "organizationId" TEXT,
    "eventId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "topic" TEXT,
    "tags" TEXT,
    "lessonsJson" TEXT,
    "estimatedHours" INTEGER,
    "difficulty" TEXT,
    "sequenceNum" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvalChain" TEXT,
    "publishedAt" TIMESTAMP(3),
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolymathModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolymathResourceCollection" (
    "id" TEXT NOT NULL,
    "authorType" TEXT NOT NULL DEFAULT 'individual',
    "authorId" TEXT NOT NULL,
    "communityId" TEXT,
    "organizationId" TEXT,
    "eventId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "topic" TEXT,
    "tags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvalChain" TEXT,
    "publishedAt" TIMESTAMP(3),
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolymathResourceCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolymathArticleResource" (
    "articleId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "sequenceNum" INTEGER NOT NULL,

    CONSTRAINT "PolymathArticleResource_pkey" PRIMARY KEY ("articleId","resourceId")
);

-- CreateTable
CREATE TABLE "PolymathToolResource" (
    "toolId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,

    CONSTRAINT "PolymathToolResource_pkey" PRIMARY KEY ("toolId","resourceId")
);

-- CreateTable
CREATE TABLE "PolymathModuleResource" (
    "moduleId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "sequenceNum" INTEGER NOT NULL,

    CONSTRAINT "PolymathModuleResource_pkey" PRIMARY KEY ("moduleId","resourceId")
);

-- CreateTable
CREATE TABLE "PolymathCollectionResource" (
    "collectionId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "sequenceNum" INTEGER NOT NULL,

    CONSTRAINT "PolymathCollectionResource_pkey" PRIMARY KEY ("collectionId","resourceId")
);

-- CreateTable
CREATE TABLE "PolymathPost" (
    "id" TEXT NOT NULL,
    "authorType" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "organizationId" TEXT,
    "communityId" TEXT,
    "classId" TEXT,
    "title" TEXT NOT NULL,
    "abstract" TEXT,
    "content" TEXT NOT NULL,
    "topic" TEXT,
    "tags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "publishedAt" TIMESTAMP(3),
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolymathPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkingCode" (
    "code" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkingCode_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "ParentChild" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentChild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentNotificationPreference" (
    "id" TEXT NOT NULL,
    "parentChildId" TEXT NOT NULL,
    "enableWeeklyDigest" BOOLEAN NOT NULL DEFAULT true,
    "enableCelebrations" BOOLEAN NOT NULL DEFAULT true,
    "enableAlerts" BOOLEAN NOT NULL DEFAULT true,
    "digestFrequency" TEXT NOT NULL DEFAULT 'weekly',
    "digestDay" INTEGER NOT NULL DEFAULT 0,
    "digestHour" INTEGER NOT NULL DEFAULT 18,
    "digestMinute" INTEGER NOT NULL DEFAULT 0,
    "alertThreshold" INTEGER NOT NULL DEFAULT 60,
    "minDaysBetweenAlerts" INTEGER NOT NULL DEFAULT 7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentNotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentNotification" (
    "id" TEXT NOT NULL,
    "parentChildId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "errorMessage" TEXT,

    CONSTRAINT "SentNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolymathMeeting" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "PolymathMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StandardToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerificationToken_key" ON "User"("emailVerificationToken");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_emailVerificationToken_idx" ON "User"("emailVerificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "Organization"("name");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "OrganizationRole_organizationId_idx" ON "OrganizationRole"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationRole_role_idx" ON "OrganizationRole"("role");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationRole_userId_organizationId_key" ON "OrganizationRole"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "StandardsBank_subject_idx" ON "StandardsBank"("subject");

-- CreateIndex
CREATE INDEX "StandardsBank_gradeLevel_idx" ON "StandardsBank"("gradeLevel");

-- CreateIndex
CREATE INDEX "Unit_standardsBankId_idx" ON "Unit"("standardsBankId");

-- CreateIndex
CREATE INDEX "Unit_organizationId_idx" ON "Unit"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_standardsBankId_code_key" ON "Unit"("standardsBankId", "code");

-- CreateIndex
CREATE INDEX "SkillCategory_standardsBankId_idx" ON "SkillCategory"("standardsBankId");

-- CreateIndex
CREATE INDEX "SkillCategory_organizationId_idx" ON "SkillCategory"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillCategory_standardsBankId_code_key" ON "SkillCategory"("standardsBankId", "code");

-- CreateIndex
CREATE INDEX "Standard_standardsBankId_idx" ON "Standard"("standardsBankId");

-- CreateIndex
CREATE INDEX "Standard_organizationId_idx" ON "Standard"("organizationId");

-- CreateIndex
CREATE INDEX "Standard_type_idx" ON "Standard"("type");

-- CreateIndex
CREATE INDEX "Standard_unitId_idx" ON "Standard"("unitId");

-- CreateIndex
CREATE INDEX "Standard_skillCategoryId_idx" ON "Standard"("skillCategoryId");

-- CreateIndex
CREATE INDEX "Standard_domainId_idx" ON "Standard"("domainId");

-- CreateIndex
CREATE INDEX "Standard_verificationLevel_idx" ON "Standard"("verificationLevel");

-- CreateIndex
CREATE INDEX "Standard_visibility_idx" ON "Standard"("visibility");

-- CreateIndex
CREATE UNIQUE INDEX "Standard_standardsBankId_code_key" ON "Standard"("standardsBankId", "code");

-- CreateIndex
CREATE INDEX "ClassStandard_classId_idx" ON "ClassStandard"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassStandard_classId_standardId_key" ON "ClassStandard"("classId", "standardId");

-- CreateIndex
CREATE INDEX "ExampleObjective_standardId_idx" ON "ExampleObjective"("standardId");

-- CreateIndex
CREATE UNIQUE INDEX "ExampleObjective_standardId_label_key" ON "ExampleObjective"("standardId", "label");

-- CreateIndex
CREATE INDEX "StandardResource_standardId_idx" ON "StandardResource"("standardId");

-- CreateIndex
CREATE INDEX "StandardResource_type_idx" ON "StandardResource"("type");

-- CreateIndex
CREATE INDEX "StandardResource_createdById_idx" ON "StandardResource"("createdById");

-- CreateIndex
CREATE INDEX "StandardsDistribution_organizationId_idx" ON "StandardsDistribution"("organizationId");

-- CreateIndex
CREATE INDEX "StandardsDistribution_status_idx" ON "StandardsDistribution"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StandardsDistribution_standardId_organizationId_key" ON "StandardsDistribution"("standardId", "organizationId");

-- CreateIndex
CREATE INDEX "TeacherStandardAssignment_organizationId_idx" ON "TeacherStandardAssignment"("organizationId");

-- CreateIndex
CREATE INDEX "TeacherStandardAssignment_teacherId_idx" ON "TeacherStandardAssignment"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherStandardAssignment_teacherId_standardId_organization_key" ON "TeacherStandardAssignment"("teacherId", "standardId", "organizationId");

-- CreateIndex
CREATE INDEX "TeacherObjectiveNote_classId_idx" ON "TeacherObjectiveNote"("classId");

-- CreateIndex
CREATE INDEX "TeacherObjectiveNote_objectiveId_idx" ON "TeacherObjectiveNote"("objectiveId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherObjectiveNote_classId_objectiveId_key" ON "TeacherObjectiveNote"("classId", "objectiveId");

-- CreateIndex
CREATE INDEX "ObjectiveMaterial_objectiveId_idx" ON "ObjectiveMaterial"("objectiveId");

-- CreateIndex
CREATE INDEX "ObjectiveMaterial_classId_idx" ON "ObjectiveMaterial"("classId");

-- CreateIndex
CREATE INDEX "ObjectiveMaterial_uploadedBy_idx" ON "ObjectiveMaterial"("uploadedBy");

-- CreateIndex
CREATE INDEX "StandardsDomain_organizationId_idx" ON "StandardsDomain"("organizationId");

-- CreateIndex
CREATE INDEX "StandardsDomain_visibility_idx" ON "StandardsDomain"("visibility");

-- CreateIndex
CREATE INDEX "StandardsDomain_primaryStewardId_idx" ON "StandardsDomain"("primaryStewardId");

-- CreateIndex
CREATE INDEX "DomainSteward_domainId_idx" ON "DomainSteward"("domainId");

-- CreateIndex
CREATE INDEX "DomainSteward_userId_idx" ON "DomainSteward"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DomainSteward_domainId_userId_key" ON "DomainSteward"("domainId", "userId");

-- CreateIndex
CREATE INDEX "StandardAudit_standardId_idx" ON "StandardAudit"("standardId");

-- CreateIndex
CREATE INDEX "StandardAudit_domainId_idx" ON "StandardAudit"("domainId");

-- CreateIndex
CREATE INDEX "StandardAudit_action_idx" ON "StandardAudit"("action");

-- CreateIndex
CREATE INDEX "StandardAudit_createdAt_idx" ON "StandardAudit"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "SchoolAssessment_organizationId_idx" ON "SchoolAssessment"("organizationId");

-- CreateIndex
CREATE INDEX "SchoolAssessment_assessmentDate_idx" ON "SchoolAssessment"("assessmentDate");

-- CreateIndex
CREATE INDEX "SchoolAssessment_type_idx" ON "SchoolAssessment"("type");

-- CreateIndex
CREATE INDEX "SchoolAssessment_visibility_idx" ON "SchoolAssessment"("visibility");

-- CreateIndex
CREATE INDEX "InterventionGroup_classId_idx" ON "InterventionGroup"("classId");

-- CreateIndex
CREATE INDEX "InterventionGroup_objectiveId_idx" ON "InterventionGroup"("objectiveId");

-- CreateIndex
CREATE INDEX "InterventionGroup_createdBy_idx" ON "InterventionGroup"("createdBy");

-- CreateIndex
CREATE INDEX "InterventionGroup_startDate_idx" ON "InterventionGroup"("startDate");

-- CreateIndex
CREATE INDEX "InterventionGroupStudent_groupId_idx" ON "InterventionGroupStudent"("groupId");

-- CreateIndex
CREATE INDEX "InterventionGroupStudent_enrollmentId_idx" ON "InterventionGroupStudent"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "InterventionGroupStudent_groupId_enrollmentId_key" ON "InterventionGroupStudent"("groupId", "enrollmentId");

-- CreateIndex
CREATE INDEX "StudyGuide_studentId_idx" ON "StudyGuide"("studentId");

-- CreateIndex
CREATE INDEX "StudyGuide_classId_idx" ON "StudyGuide"("classId");

-- CreateIndex
CREATE INDEX "StudyGuide_standardId_idx" ON "StudyGuide"("standardId");

-- CreateIndex
CREATE INDEX "StudyGuide_status_idx" ON "StudyGuide"("status");

-- CreateIndex
CREATE INDEX "StudyGuide_visibility_idx" ON "StudyGuide"("visibility");

-- CreateIndex
CREATE INDEX "K12Assessment_classId_idx" ON "K12Assessment"("classId");

-- CreateIndex
CREATE INDEX "K12Assessment_standardId_idx" ON "K12Assessment"("standardId");

-- CreateIndex
CREATE INDEX "K12Assessment_type_idx" ON "K12Assessment"("type");

-- CreateIndex
CREATE INDEX "K12Assessment_dueDate_idx" ON "K12Assessment"("dueDate");

-- CreateIndex
CREATE INDEX "K12Assessment_visibility_idx" ON "K12Assessment"("visibility");

-- CreateIndex
CREATE INDEX "K12Submission_assessmentId_idx" ON "K12Submission"("assessmentId");

-- CreateIndex
CREATE INDEX "K12Submission_enrollmentId_idx" ON "K12Submission"("enrollmentId");

-- CreateIndex
CREATE INDEX "K12Submission_status_idx" ON "K12Submission"("status");

-- CreateIndex
CREATE INDEX "K12Submission_submittedAt_idx" ON "K12Submission"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "K12Submission_assessmentId_enrollmentId_key" ON "K12Submission"("assessmentId", "enrollmentId");

-- CreateIndex
CREATE INDEX "StudentRating_studentId_idx" ON "StudentRating"("studentId");

-- CreateIndex
CREATE INDEX "StudentRating_objectiveId_idx" ON "StudentRating"("objectiveId");

-- CreateIndex
CREATE INDEX "StudentRating_ratedAt_idx" ON "StudentRating"("ratedAt");

-- CreateIndex
CREATE INDEX "TeacherRating_teacherId_idx" ON "TeacherRating"("teacherId");

-- CreateIndex
CREATE INDEX "TeacherRating_standardId_idx" ON "TeacherRating"("standardId");

-- CreateIndex
CREATE INDEX "TeacherRating_ratedAt_idx" ON "TeacherRating"("ratedAt");

-- CreateIndex
CREATE INDEX "K12Class_instructorId_idx" ON "K12Class"("instructorId");

-- CreateIndex
CREATE INDEX "K12Class_organizationId_idx" ON "K12Class"("organizationId");

-- CreateIndex
CREATE INDEX "K12Enrollment_classId_idx" ON "K12Enrollment"("classId");

-- CreateIndex
CREATE INDEX "K12Enrollment_studentId_idx" ON "K12Enrollment"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "K12Enrollment_classId_studentId_key" ON "K12Enrollment"("classId", "studentId");

-- CreateIndex
CREATE INDEX "K12Week_classId_idx" ON "K12Week"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "K12Week_classId_weekNum_key" ON "K12Week"("classId", "weekNum");

-- CreateIndex
CREATE INDEX "K12Day_weekId_idx" ON "K12Day"("weekId");

-- CreateIndex
CREATE INDEX "K12Day_date_idx" ON "K12Day"("date");

-- CreateIndex
CREATE INDEX "ClassObjective_classId_idx" ON "ClassObjective"("classId");

-- CreateIndex
CREATE INDEX "ClassObjective_exampleObjectiveId_idx" ON "ClassObjective"("exampleObjectiveId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassObjective_classId_exampleObjectiveId_key" ON "ClassObjective"("classId", "exampleObjectiveId");

-- CreateIndex
CREATE INDEX "InterventionBlock_classId_idx" ON "InterventionBlock"("classId");

-- CreateIndex
CREATE INDEX "InterventionBlock_organizationId_idx" ON "InterventionBlock"("organizationId");

-- CreateIndex
CREATE INDEX "InterventionBlock_weekNum_idx" ON "InterventionBlock"("weekNum");

-- CreateIndex
CREATE INDEX "InterventionBlock_createdById_idx" ON "InterventionBlock"("createdById");

-- CreateIndex
CREATE INDEX "StudySession_classId_idx" ON "StudySession"("classId");

-- CreateIndex
CREATE INDEX "StudySession_organizationId_idx" ON "StudySession"("organizationId");

-- CreateIndex
CREATE INDEX "StudySession_weekNum_idx" ON "StudySession"("weekNum");

-- CreateIndex
CREATE INDEX "StudySession_createdById_idx" ON "StudySession"("createdById");

-- CreateIndex
CREATE INDEX "LearningCommunity_scope_idx" ON "LearningCommunity"("scope");

-- CreateIndex
CREATE INDEX "LearningCommunity_status_idx" ON "LearningCommunity"("status");

-- CreateIndex
CREATE INDEX "LearningCommunity_topic_idx" ON "LearningCommunity"("topic");

-- CreateIndex
CREATE INDEX "LearningCommunity_curatorId_idx" ON "LearningCommunity"("curatorId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningCommunity_organizationId_slug_key" ON "LearningCommunity"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "LearningModule_communityId_idx" ON "LearningModule"("communityId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningModule_communityId_sequenceNum_key" ON "LearningModule"("communityId", "sequenceNum");

-- CreateIndex
CREATE INDEX "LearningCommunityMember_communityId_idx" ON "LearningCommunityMember"("communityId");

-- CreateIndex
CREATE INDEX "LearningCommunityMember_userId_idx" ON "LearningCommunityMember"("userId");

-- CreateIndex
CREATE INDEX "LearningCommunityMember_status_idx" ON "LearningCommunityMember"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LearningCommunityMember_communityId_userId_key" ON "LearningCommunityMember"("communityId", "userId");

-- CreateIndex
CREATE INDEX "CommunityJoinRequest_communityId_idx" ON "CommunityJoinRequest"("communityId");

-- CreateIndex
CREATE INDEX "CommunityJoinRequest_status_idx" ON "CommunityJoinRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityJoinRequest_communityId_userId_key" ON "CommunityJoinRequest"("communityId", "userId");

-- CreateIndex
CREATE INDEX "StudentPreference_userId_idx" ON "StudentPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentPreference_userId_organizationId_key" ON "StudentPreference"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "StudentCalendarPreference_studentId_idx" ON "StudentCalendarPreference"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentCalendarPreference_studentId_classId_classType_key" ON "StudentCalendarPreference"("studentId", "classId", "classType");

-- CreateIndex
CREATE INDEX "OrganizationStandardsBankAdoption_organizationId_idx" ON "OrganizationStandardsBankAdoption"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationStandardsBankAdoption_organizationId_standardsB_key" ON "OrganizationStandardsBankAdoption"("organizationId", "standardsBankId");

-- CreateIndex
CREATE INDEX "StudentStandardProgress_organizationId_idx" ON "StudentStandardProgress"("organizationId");

-- CreateIndex
CREATE INDEX "StudentStandardProgress_userId_idx" ON "StudentStandardProgress"("userId");

-- CreateIndex
CREATE INDEX "StudentStandardProgress_standardId_idx" ON "StudentStandardProgress"("standardId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentStandardProgress_userId_standardId_organizationId_key" ON "StudentStandardProgress"("userId", "standardId", "organizationId");

-- CreateIndex
CREATE INDEX "StudentObjectiveProgress_userId_idx" ON "StudentObjectiveProgress"("userId");

-- CreateIndex
CREATE INDEX "StudentObjectiveProgress_objectiveId_idx" ON "StudentObjectiveProgress"("objectiveId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentObjectiveProgress_userId_objectiveId_key" ON "StudentObjectiveProgress"("userId", "objectiveId");

-- CreateIndex
CREATE INDEX "Event_organizationId_idx" ON "Event"("organizationId");

-- CreateIndex
CREATE INDEX "Event_communityId_idx" ON "Event"("communityId");

-- CreateIndex
CREATE INDEX "Event_createdById_idx" ON "Event"("createdById");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX "EventRSVP_eventId_idx" ON "EventRSVP"("eventId");

-- CreateIndex
CREATE INDEX "EventRSVP_userId_idx" ON "EventRSVP"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRSVP_eventId_userId_key" ON "EventRSVP"("eventId", "userId");

-- CreateIndex
CREATE INDEX "Conversation_type_idx" ON "Conversation"("type");

-- CreateIndex
CREATE INDEX "Conversation_k12ClassId_idx" ON "Conversation"("k12ClassId");

-- CreateIndex
CREATE INDEX "Conversation_eventId_idx" ON "Conversation"("eventId");

-- CreateIndex
CREATE INDEX "Conversation_organizationId_idx" ON "Conversation"("organizationId");

-- CreateIndex
CREATE INDEX "Conversation_communityId_idx" ON "Conversation"("communityId");

-- CreateIndex
CREATE INDEX "Conversation_createdById_idx" ON "Conversation"("createdById");

-- CreateIndex
CREATE INDEX "ConversationParticipant_conversationId_idx" ON "ConversationParticipant"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "ConversationParticipant"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Resource_organizationId_idx" ON "Resource"("organizationId");

-- CreateIndex
CREATE INDEX "Resource_k12ClassId_idx" ON "Resource"("k12ClassId");

-- CreateIndex
CREATE INDEX "Resource_communityId_idx" ON "Resource"("communityId");

-- CreateIndex
CREATE INDEX "Resource_resourceLibraryId_idx" ON "Resource"("resourceLibraryId");

-- CreateIndex
CREATE INDEX "Resource_visibility_idx" ON "Resource"("visibility");

-- CreateIndex
CREATE INDEX "Resource_type_idx" ON "Resource"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceLibrary_organizationalUnitId_key" ON "ResourceLibrary"("organizationalUnitId");

-- CreateIndex
CREATE INDEX "ResourceLibrary_organizationId_idx" ON "ResourceLibrary"("organizationId");

-- CreateIndex
CREATE INDEX "ResourceLibrary_librarianId_idx" ON "ResourceLibrary"("librarianId");

-- CreateIndex
CREATE INDEX "ResourceLibrary_organizationalUnitId_idx" ON "ResourceLibrary"("organizationalUnitId");

-- CreateIndex
CREATE INDEX "OrganizationalUnit_organizationId_idx" ON "OrganizationalUnit"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationalUnit_type_idx" ON "OrganizationalUnit"("type");

-- CreateIndex
CREATE INDEX "OrganizationalUnit_leaderId_idx" ON "OrganizationalUnit"("leaderId");

-- CreateIndex
CREATE INDEX "OrganizationalUnitMember_unitId_idx" ON "OrganizationalUnitMember"("unitId");

-- CreateIndex
CREATE INDEX "OrganizationalUnitMember_userId_idx" ON "OrganizationalUnitMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationalUnitMember_unitId_userId_key" ON "OrganizationalUnitMember"("unitId", "userId");

-- CreateIndex
CREATE INDEX "Project_organizationId_idx" ON "Project"("organizationId");

-- CreateIndex
CREATE INDEX "Project_departmentId_idx" ON "Project"("departmentId");

-- CreateIndex
CREATE INDEX "Project_communityId_idx" ON "Project"("communityId");

-- CreateIndex
CREATE INDEX "Project_scope_idx" ON "Project"("scope");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMember_userId_idx" ON "ProjectMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");

-- CreateIndex
CREATE INDEX "ProjectClass_projectId_idx" ON "ProjectClass"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectClass_projectId_classId_key" ON "ProjectClass"("projectId", "classId");

-- CreateIndex
CREATE INDEX "Announcement_organizationId_idx" ON "Announcement"("organizationId");

-- CreateIndex
CREATE INDEX "Announcement_createdById_idx" ON "Announcement"("createdById");

-- CreateIndex
CREATE INDEX "Announcement_publishedAt_idx" ON "Announcement"("publishedAt");

-- CreateIndex
CREATE INDEX "PolymathArticle_communityId_idx" ON "PolymathArticle"("communityId");

-- CreateIndex
CREATE INDEX "PolymathArticle_organizationId_idx" ON "PolymathArticle"("organizationId");

-- CreateIndex
CREATE INDEX "PolymathArticle_authorId_idx" ON "PolymathArticle"("authorId");

-- CreateIndex
CREATE INDEX "PolymathArticle_authorType_idx" ON "PolymathArticle"("authorType");

-- CreateIndex
CREATE INDEX "PolymathArticle_status_idx" ON "PolymathArticle"("status");

-- CreateIndex
CREATE INDEX "PolymathArticle_visibility_idx" ON "PolymathArticle"("visibility");

-- CreateIndex
CREATE INDEX "PolymathArticle_publishedAt_idx" ON "PolymathArticle"("publishedAt");

-- CreateIndex
CREATE INDEX "PolymathArticle_topic_idx" ON "PolymathArticle"("topic");

-- CreateIndex
CREATE INDEX "PolymathArticle_status_visibility_publishedAt_idx" ON "PolymathArticle"("status", "visibility", "publishedAt");

-- CreateIndex
CREATE INDEX "PolymathTool_communityId_idx" ON "PolymathTool"("communityId");

-- CreateIndex
CREATE INDEX "PolymathTool_organizationId_idx" ON "PolymathTool"("organizationId");

-- CreateIndex
CREATE INDEX "PolymathTool_authorId_idx" ON "PolymathTool"("authorId");

-- CreateIndex
CREATE INDEX "PolymathTool_authorType_idx" ON "PolymathTool"("authorType");

-- CreateIndex
CREATE INDEX "PolymathTool_status_idx" ON "PolymathTool"("status");

-- CreateIndex
CREATE INDEX "PolymathTool_visibility_idx" ON "PolymathTool"("visibility");

-- CreateIndex
CREATE INDEX "PolymathTool_publishedAt_idx" ON "PolymathTool"("publishedAt");

-- CreateIndex
CREATE INDEX "PolymathTool_toolType_idx" ON "PolymathTool"("toolType");

-- CreateIndex
CREATE INDEX "PolymathModule_communityId_idx" ON "PolymathModule"("communityId");

-- CreateIndex
CREATE INDEX "PolymathModule_organizationId_idx" ON "PolymathModule"("organizationId");

-- CreateIndex
CREATE INDEX "PolymathModule_authorId_idx" ON "PolymathModule"("authorId");

-- CreateIndex
CREATE INDEX "PolymathModule_authorType_idx" ON "PolymathModule"("authorType");

-- CreateIndex
CREATE INDEX "PolymathModule_status_idx" ON "PolymathModule"("status");

-- CreateIndex
CREATE INDEX "PolymathModule_visibility_idx" ON "PolymathModule"("visibility");

-- CreateIndex
CREATE INDEX "PolymathModule_publishedAt_idx" ON "PolymathModule"("publishedAt");

-- CreateIndex
CREATE INDEX "PolymathModule_topic_idx" ON "PolymathModule"("topic");

-- CreateIndex
CREATE UNIQUE INDEX "PolymathModule_communityId_sequenceNum_key" ON "PolymathModule"("communityId", "sequenceNum");

-- CreateIndex
CREATE INDEX "PolymathResourceCollection_communityId_idx" ON "PolymathResourceCollection"("communityId");

-- CreateIndex
CREATE INDEX "PolymathResourceCollection_organizationId_idx" ON "PolymathResourceCollection"("organizationId");

-- CreateIndex
CREATE INDEX "PolymathResourceCollection_authorId_idx" ON "PolymathResourceCollection"("authorId");

-- CreateIndex
CREATE INDEX "PolymathResourceCollection_authorType_idx" ON "PolymathResourceCollection"("authorType");

-- CreateIndex
CREATE INDEX "PolymathResourceCollection_status_idx" ON "PolymathResourceCollection"("status");

-- CreateIndex
CREATE INDEX "PolymathResourceCollection_visibility_idx" ON "PolymathResourceCollection"("visibility");

-- CreateIndex
CREATE INDEX "PolymathResourceCollection_publishedAt_idx" ON "PolymathResourceCollection"("publishedAt");

-- CreateIndex
CREATE INDEX "PolymathResourceCollection_topic_idx" ON "PolymathResourceCollection"("topic");

-- CreateIndex
CREATE INDEX "PolymathArticleResource_resourceId_idx" ON "PolymathArticleResource"("resourceId");

-- CreateIndex
CREATE INDEX "PolymathToolResource_resourceId_idx" ON "PolymathToolResource"("resourceId");

-- CreateIndex
CREATE INDEX "PolymathModuleResource_resourceId_idx" ON "PolymathModuleResource"("resourceId");

-- CreateIndex
CREATE INDEX "PolymathCollectionResource_resourceId_idx" ON "PolymathCollectionResource"("resourceId");

-- CreateIndex
CREATE INDEX "PolymathPost_authorType_idx" ON "PolymathPost"("authorType");

-- CreateIndex
CREATE INDEX "PolymathPost_organizationId_idx" ON "PolymathPost"("organizationId");

-- CreateIndex
CREATE INDEX "PolymathPost_communityId_idx" ON "PolymathPost"("communityId");

-- CreateIndex
CREATE INDEX "PolymathPost_classId_idx" ON "PolymathPost"("classId");

-- CreateIndex
CREATE INDEX "PolymathPost_creatorId_idx" ON "PolymathPost"("creatorId");

-- CreateIndex
CREATE INDEX "PolymathPost_status_idx" ON "PolymathPost"("status");

-- CreateIndex
CREATE INDEX "PolymathPost_publishedAt_idx" ON "PolymathPost"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LinkingCode_code_key" ON "LinkingCode"("code");

-- CreateIndex
CREATE INDEX "LinkingCode_parentId_idx" ON "LinkingCode"("parentId");

-- CreateIndex
CREATE INDEX "LinkingCode_childId_idx" ON "LinkingCode"("childId");

-- CreateIndex
CREATE INDEX "LinkingCode_expiresAt_idx" ON "LinkingCode"("expiresAt");

-- CreateIndex
CREATE INDEX "ParentChild_parentId_idx" ON "ParentChild"("parentId");

-- CreateIndex
CREATE INDEX "ParentChild_childId_idx" ON "ParentChild"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentChild_parentId_childId_key" ON "ParentChild"("parentId", "childId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentNotificationPreference_parentChildId_key" ON "ParentNotificationPreference"("parentChildId");

-- CreateIndex
CREATE INDEX "ParentNotificationPreference_parentChildId_idx" ON "ParentNotificationPreference"("parentChildId");

-- CreateIndex
CREATE INDEX "SentNotification_parentChildId_idx" ON "SentNotification"("parentChildId");

-- CreateIndex
CREATE INDEX "SentNotification_type_idx" ON "SentNotification"("type");

-- CreateIndex
CREATE INDEX "SentNotification_sentAt_idx" ON "SentNotification"("sentAt");

-- CreateIndex
CREATE INDEX "SentNotification_status_idx" ON "SentNotification"("status");

-- CreateIndex
CREATE INDEX "PolymathMeeting_communityId_idx" ON "PolymathMeeting"("communityId");

-- CreateIndex
CREATE INDEX "PolymathMeeting_hostId_idx" ON "PolymathMeeting"("hostId");

-- CreateIndex
CREATE INDEX "PolymathMeeting_scheduledAt_idx" ON "PolymathMeeting"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "_StandardToTag_AB_unique" ON "_StandardToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_StandardToTag_B_index" ON "_StandardToTag"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationRole" ADD CONSTRAINT "OrganizationRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationRole" ADD CONSTRAINT "OrganizationRole_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_standardsBankId_fkey" FOREIGN KEY ("standardsBankId") REFERENCES "StandardsBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillCategory" ADD CONSTRAINT "SkillCategory_standardsBankId_fkey" FOREIGN KEY ("standardsBankId") REFERENCES "StandardsBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillCategory" ADD CONSTRAINT "SkillCategory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Standard" ADD CONSTRAINT "Standard_standardsBankId_fkey" FOREIGN KEY ("standardsBankId") REFERENCES "StandardsBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Standard" ADD CONSTRAINT "Standard_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Standard" ADD CONSTRAINT "Standard_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Standard" ADD CONSTRAINT "Standard_skillCategoryId_fkey" FOREIGN KEY ("skillCategoryId") REFERENCES "SkillCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Standard" ADD CONSTRAINT "Standard_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "StandardsDomain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Standard" ADD CONSTRAINT "Standard_aliasOfId_fkey" FOREIGN KEY ("aliasOfId") REFERENCES "Standard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassStandard" ADD CONSTRAINT "ClassStandard_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "Standard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExampleObjective" ADD CONSTRAINT "ExampleObjective_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "Standard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardResource" ADD CONSTRAINT "StandardResource_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "Standard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardResource" ADD CONSTRAINT "StandardResource_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardsDistribution" ADD CONSTRAINT "StandardsDistribution_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "Standard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardsDistribution" ADD CONSTRAINT "StandardsDistribution_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherStandardAssignment" ADD CONSTRAINT "TeacherStandardAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherStandardAssignment" ADD CONSTRAINT "TeacherStandardAssignment_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "Standard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherStandardAssignment" ADD CONSTRAINT "TeacherStandardAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherObjectiveNote" ADD CONSTRAINT "TeacherObjectiveNote_classId_fkey" FOREIGN KEY ("classId") REFERENCES "K12Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherObjectiveNote" ADD CONSTRAINT "TeacherObjectiveNote_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "ExampleObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectiveMaterial" ADD CONSTRAINT "ObjectiveMaterial_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "ExampleObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectiveMaterial" ADD CONSTRAINT "ObjectiveMaterial_classId_fkey" FOREIGN KEY ("classId") REFERENCES "K12Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardsDomain" ADD CONSTRAINT "StandardsDomain_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardsDomain" ADD CONSTRAINT "StandardsDomain_primaryStewardId_fkey" FOREIGN KEY ("primaryStewardId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainSteward" ADD CONSTRAINT "DomainSteward_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "StandardsDomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainSteward" ADD CONSTRAINT "DomainSteward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardAudit" ADD CONSTRAINT "StandardAudit_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "StandardsDomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardAudit" ADD CONSTRAINT "StandardAudit_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAssessment" ADD CONSTRAINT "SchoolAssessment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventionGroup" ADD CONSTRAINT "InterventionGroup_classId_fkey" FOREIGN KEY ("classId") REFERENCES "K12Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventionGroup" ADD CONSTRAINT "InterventionGroup_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "ExampleObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventionGroup" ADD CONSTRAINT "InterventionGroup_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventionGroupStudent" ADD CONSTRAINT "InterventionGroupStudent_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "InterventionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventionGroupStudent" ADD CONSTRAINT "InterventionGroupStudent_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "K12Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGuide" ADD CONSTRAINT "StudyGuide_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "Standard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGuide" ADD CONSTRAINT "StudyGuide_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "K12Assessment" ADD CONSTRAINT "K12Assessment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "K12Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "K12Assessment" ADD CONSTRAINT "K12Assessment_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "Standard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "K12Assessment" ADD CONSTRAINT "K12Assessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "K12Submission" ADD CONSTRAINT "K12Submission_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "K12Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "K12Submission" ADD CONSTRAINT "K12Submission_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "K12Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRating" ADD CONSTRAINT "StudentRating_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "ExampleObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherRating" ADD CONSTRAINT "TeacherRating_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherRating" ADD CONSTRAINT "TeacherRating_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "Standard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "K12Class" ADD CONSTRAINT "K12Class_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "K12Class" ADD CONSTRAINT "K12Class_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "K12Enrollment" ADD CONSTRAINT "K12Enrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "K12Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "K12Enrollment" ADD CONSTRAINT "K12Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "K12Week" ADD CONSTRAINT "K12Week_classId_fkey" FOREIGN KEY ("classId") REFERENCES "K12Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "K12Day" ADD CONSTRAINT "K12Day_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "K12Week"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassObjective" ADD CONSTRAINT "ClassObjective_exampleObjectiveId_fkey" FOREIGN KEY ("exampleObjectiveId") REFERENCES "ExampleObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventionBlock" ADD CONSTRAINT "InterventionBlock_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterventionBlock" ADD CONSTRAINT "InterventionBlock_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningCommunity" ADD CONSTRAINT "LearningCommunity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningCommunity" ADD CONSTRAINT "LearningCommunity_curatorId_fkey" FOREIGN KEY ("curatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningModule" ADD CONSTRAINT "LearningModule_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "LearningCommunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningCommunityMember" ADD CONSTRAINT "LearningCommunityMember_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "LearningCommunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningCommunityMember" ADD CONSTRAINT "LearningCommunityMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityJoinRequest" ADD CONSTRAINT "CommunityJoinRequest_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "LearningCommunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityJoinRequest" ADD CONSTRAINT "CommunityJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPreference" ADD CONSTRAINT "StudentPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPreference" ADD CONSTRAINT "StudentPreference_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCalendarPreference" ADD CONSTRAINT "StudentCalendarPreference_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationStandardsBankAdoption" ADD CONSTRAINT "OrganizationStandardsBankAdoption_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationStandardsBankAdoption" ADD CONSTRAINT "OrganizationStandardsBankAdoption_standardsBankId_fkey" FOREIGN KEY ("standardsBankId") REFERENCES "StandardsBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentStandardProgress" ADD CONSTRAINT "StudentStandardProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentStandardProgress" ADD CONSTRAINT "StudentStandardProgress_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "Standard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentStandardProgress" ADD CONSTRAINT "StudentStandardProgress_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentObjectiveProgress" ADD CONSTRAINT "StudentObjectiveProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentObjectiveProgress" ADD CONSTRAINT "StudentObjectiveProgress_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "ExampleObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_k12ClassId_fkey" FOREIGN KEY ("k12ClassId") REFERENCES "K12Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "LearningCommunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRSVP" ADD CONSTRAINT "EventRSVP_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRSVP" ADD CONSTRAINT "EventRSVP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_k12ClassId_fkey" FOREIGN KEY ("k12ClassId") REFERENCES "K12Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "LearningCommunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_k12ClassId_fkey" FOREIGN KEY ("k12ClassId") REFERENCES "K12Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "LearningCommunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_resourceLibraryId_fkey" FOREIGN KEY ("resourceLibraryId") REFERENCES "ResourceLibrary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceLibrary" ADD CONSTRAINT "ResourceLibrary_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceLibrary" ADD CONSTRAINT "ResourceLibrary_librarianId_fkey" FOREIGN KEY ("librarianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceLibrary" ADD CONSTRAINT "ResourceLibrary_organizationalUnitId_fkey" FOREIGN KEY ("organizationalUnitId") REFERENCES "OrganizationalUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationalUnit" ADD CONSTRAINT "OrganizationalUnit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationalUnit" ADD CONSTRAINT "OrganizationalUnit_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationalUnit" ADD CONSTRAINT "OrganizationalUnit_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "OrganizationalUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationalUnitMember" ADD CONSTRAINT "OrganizationalUnitMember_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "OrganizationalUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationalUnitMember" ADD CONSTRAINT "OrganizationalUnitMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "OrganizationalUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "LearningCommunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectClass" ADD CONSTRAINT "ProjectClass_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectClass" ADD CONSTRAINT "ProjectClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "K12Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolymathArticleResource" ADD CONSTRAINT "PolymathArticleResource_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "PolymathArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolymathArticleResource" ADD CONSTRAINT "PolymathArticleResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolymathToolResource" ADD CONSTRAINT "PolymathToolResource_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "PolymathTool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolymathToolResource" ADD CONSTRAINT "PolymathToolResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolymathModuleResource" ADD CONSTRAINT "PolymathModuleResource_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "PolymathModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolymathModuleResource" ADD CONSTRAINT "PolymathModuleResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolymathCollectionResource" ADD CONSTRAINT "PolymathCollectionResource_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "PolymathResourceCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolymathCollectionResource" ADD CONSTRAINT "PolymathCollectionResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolymathPost" ADD CONSTRAINT "PolymathPost_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolymathPost" ADD CONSTRAINT "PolymathPost_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolymathPost" ADD CONSTRAINT "PolymathPost_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "LearningCommunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolymathPost" ADD CONSTRAINT "PolymathPost_classId_fkey" FOREIGN KEY ("classId") REFERENCES "K12Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentChild" ADD CONSTRAINT "ParentChild_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentChild" ADD CONSTRAINT "ParentChild_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentNotificationPreference" ADD CONSTRAINT "ParentNotificationPreference_parentChildId_fkey" FOREIGN KEY ("parentChildId") REFERENCES "ParentChild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentNotification" ADD CONSTRAINT "SentNotification_parentChildId_fkey" FOREIGN KEY ("parentChildId") REFERENCES "ParentChild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolymathMeeting" ADD CONSTRAINT "PolymathMeeting_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "LearningCommunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolymathMeeting" ADD CONSTRAINT "PolymathMeeting_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StandardToTag" ADD CONSTRAINT "_StandardToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Standard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StandardToTag" ADD CONSTRAINT "_StandardToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

┌─────────────────────────────────────────────────────────┐
│  Update available 5.22.0 -> 8.0.0-rc.19                 │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
