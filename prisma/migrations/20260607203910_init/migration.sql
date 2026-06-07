-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImprovClass" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "instructorId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "numWeeks" INTEGER NOT NULL DEFAULT 8,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImprovClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImprovEnrollment" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "role" TEXT NOT NULL DEFAULT 'student',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImprovEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImprovWeek" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "weekNum" INTEGER NOT NULL,
    "title" TEXT,
    "focusAreas" TEXT,
    "sessionNotes" TEXT,
    "sessionNotesUpdatedAt" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImprovWeek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImprovSkill" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "categoryIcon" TEXT,
    "categoryColor" TEXT,
    "description" TEXT,
    "levelDefinitions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "retiredAt" TIMESTAMP(3),

    CONSTRAINT "ImprovSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImprovObjective" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "sequenceNum" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "description" TEXT,
    "examples" TEXT,

    CONSTRAINT "ImprovObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImprovWeekSkill" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "isAnchor" BOOLEAN NOT NULL DEFAULT true,
    "sequenceNum" INTEGER NOT NULL,

    CONSTRAINT "ImprovWeekSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImprovStudentRating" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "narrative" TEXT,
    "evidence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisedAt" TIMESTAMP(3),

    CONSTRAINT "ImprovStudentRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImprovTeacherRating" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "instructorNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImprovTeacherRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImprovFeedback" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "skillId" TEXT,
    "note" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImprovFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "K12Class" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "numUnits" INTEGER NOT NULL DEFAULT 8,
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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "ImprovClass_instructorId_idx" ON "ImprovClass"("instructorId");

-- CreateIndex
CREATE INDEX "ImprovEnrollment_classId_idx" ON "ImprovEnrollment"("classId");

-- CreateIndex
CREATE INDEX "ImprovEnrollment_studentId_idx" ON "ImprovEnrollment"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ImprovEnrollment_classId_studentId_key" ON "ImprovEnrollment"("classId", "studentId");

-- CreateIndex
CREATE INDEX "ImprovWeek_classId_idx" ON "ImprovWeek"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "ImprovWeek_classId_weekNum_key" ON "ImprovWeek"("classId", "weekNum");

-- CreateIndex
CREATE UNIQUE INDEX "ImprovSkill_slug_key" ON "ImprovSkill"("slug");

-- CreateIndex
CREATE INDEX "ImprovSkill_isActive_idx" ON "ImprovSkill"("isActive");

-- CreateIndex
CREATE INDEX "ImprovObjective_skillId_idx" ON "ImprovObjective"("skillId");

-- CreateIndex
CREATE INDEX "ImprovWeekSkill_weekId_idx" ON "ImprovWeekSkill"("weekId");

-- CreateIndex
CREATE INDEX "ImprovWeekSkill_skillId_idx" ON "ImprovWeekSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "ImprovWeekSkill_weekId_skillId_key" ON "ImprovWeekSkill"("weekId", "skillId");

-- CreateIndex
CREATE INDEX "ImprovStudentRating_enrollmentId_idx" ON "ImprovStudentRating"("enrollmentId");

-- CreateIndex
CREATE INDEX "ImprovStudentRating_weekId_idx" ON "ImprovStudentRating"("weekId");

-- CreateIndex
CREATE INDEX "ImprovStudentRating_skillId_idx" ON "ImprovStudentRating"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "ImprovStudentRating_enrollmentId_weekId_skillId_key" ON "ImprovStudentRating"("enrollmentId", "weekId", "skillId");

-- CreateIndex
CREATE INDEX "ImprovTeacherRating_enrollmentId_idx" ON "ImprovTeacherRating"("enrollmentId");

-- CreateIndex
CREATE INDEX "ImprovTeacherRating_weekId_idx" ON "ImprovTeacherRating"("weekId");

-- CreateIndex
CREATE INDEX "ImprovTeacherRating_skillId_idx" ON "ImprovTeacherRating"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "ImprovTeacherRating_enrollmentId_weekId_skillId_key" ON "ImprovTeacherRating"("enrollmentId", "weekId", "skillId");

-- CreateIndex
CREATE INDEX "ImprovFeedback_enrollmentId_idx" ON "ImprovFeedback"("enrollmentId");

-- CreateIndex
CREATE INDEX "ImprovFeedback_weekId_idx" ON "ImprovFeedback"("weekId");

-- CreateIndex
CREATE INDEX "ImprovFeedback_skillId_idx" ON "ImprovFeedback"("skillId");

-- CreateIndex
CREATE INDEX "K12Class_instructorId_idx" ON "K12Class"("instructorId");

-- CreateIndex
CREATE INDEX "K12Enrollment_studentId_idx" ON "K12Enrollment"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "K12Enrollment_classId_studentId_key" ON "K12Enrollment"("classId", "studentId");

-- AddForeignKey
ALTER TABLE "ImprovClass" ADD CONSTRAINT "ImprovClass_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovEnrollment" ADD CONSTRAINT "ImprovEnrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ImprovClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovEnrollment" ADD CONSTRAINT "ImprovEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovWeek" ADD CONSTRAINT "ImprovWeek_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ImprovClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovObjective" ADD CONSTRAINT "ImprovObjective_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ImprovSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovWeekSkill" ADD CONSTRAINT "ImprovWeekSkill_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "ImprovWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovWeekSkill" ADD CONSTRAINT "ImprovWeekSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ImprovSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovStudentRating" ADD CONSTRAINT "ImprovStudentRating_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "ImprovEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovStudentRating" ADD CONSTRAINT "ImprovStudentRating_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "ImprovWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovStudentRating" ADD CONSTRAINT "ImprovStudentRating_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ImprovSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovTeacherRating" ADD CONSTRAINT "ImprovTeacherRating_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "ImprovEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovTeacherRating" ADD CONSTRAINT "ImprovTeacherRating_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "ImprovWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovTeacherRating" ADD CONSTRAINT "ImprovTeacherRating_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ImprovSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovFeedback" ADD CONSTRAINT "ImprovFeedback_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "ImprovEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovFeedback" ADD CONSTRAINT "ImprovFeedback_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "ImprovWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovFeedback" ADD CONSTRAINT "ImprovFeedback_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ImprovSkill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "K12Class" ADD CONSTRAINT "K12Class_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "K12Enrollment" ADD CONSTRAINT "K12Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
