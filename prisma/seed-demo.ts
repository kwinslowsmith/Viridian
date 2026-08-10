/**
 * Demo/Test Data Seed Script
 *
 * Populates database with realistic test data for demo environment
 * Use: npx ts-node prisma/seed-demo.ts
 *
 * Creates:
 * - Test organization (charter school)
 * - Test users (teacher, admin, students, parents)
 * - Test classes (K12 and Improv)
 * - Test standards and objectives
 * - Test grades and performance data
 * - Test Polymath content
 */

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding demo data...");

  // Clean up existing demo data (DEMO ONLY - do not use on production)
  console.log("Clearing existing demo data...");
  // Note: Only delete demo users/data, preserve real data

  // ============================================
  // CREATE ORGANIZATION
  // ============================================
  console.log("📚 Creating test organization...");
  const organization = await prisma.organization.upsert({
    where: { slug: "demo-charter-school" },
    update: {},
    create: {
      name: "Demo Charter High School",
      slug: "demo-charter-school",
      description: "Test/demo environment with mock data only",
      topic: "education",
      isPublic: false,
      curatorName: "Demo Curator",
      curatorBio: "Test environment curator",
    },
  });
  console.log(`✓ Organization created: ${organization.name}`);

  // ============================================
  // CREATE TEST USERS
  // ============================================
  console.log("👥 Creating test users...");

  const hashedPassword = await bcrypt.hash("demo-password-123", 10);

  // ADMIN
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.test" },
    update: {},
    create: {
      email: "admin@demo.test",
      name: "Demo Admin",
      passwordHash: hashedPassword,
      emailVerified: true,
    },
  });

  // TEACHER
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@demo.test" },
    update: {},
    create: {
      email: "teacher@demo.test",
      name: "Ms. Johnson (Demo)",
      passwordHash: hashedPassword,
      emailVerified: true,
    },
  });

  // STUDENTS (5 test students)
  const studentEmails = [
    { email: "student1@demo.test", name: "Alex Smith" },
    { email: "student2@demo.test", name: "Jordan Davis" },
    { email: "student3@demo.test", name: "Taylor Martinez" },
    { email: "student4@demo.test", name: "Casey Johnson" },
    { email: "student5@demo.test", name: "Morgan Wilson" },
  ];

  const students = await Promise.all(
    studentEmails.map((s) =>
      prisma.user.upsert({
        where: { email: s.email },
        update: {},
        create: {
          email: s.email,
          name: s.name,
          passwordHash: hashedPassword,
          emailVerified: true,
        },
      })
    )
  );

  // PARENTS (one per student)
  const parents = await Promise.all(
    studentEmails.map((s, i) =>
      prisma.user.upsert({
        where: { email: `parent${i + 1}@demo.test` },
        update: {},
        create: {
          email: `parent${i + 1}@demo.test`,
          name: `Parent of ${s.name}`,
          passwordHash: hashedPassword,
          emailVerified: true,
        },
      })
    )
  );

  console.log(`✓ Users created: 1 admin, 1 teacher, 5 students, 5 parents`);

  // ============================================
  // CREATE ORG ROLES
  // ============================================
  console.log("🔐 Setting up roles...");

  await prisma.organizationRole.upsert({
    where: {
      userId_organizationId: { userId: admin.id, organizationId: organization.id },
    },
    update: {},
    create: {
      userId: admin.id,
      organizationId: organization.id,
      role: "SchoolAdmin",
    },
  });

  await prisma.organizationRole.upsert({
    where: {
      userId_organizationId: { userId: teacher.id, organizationId: organization.id },
    },
    update: {},
    create: {
      userId: teacher.id,
      organizationId: organization.id,
      role: "Teacher",
    },
  });

  for (const student of students) {
    await prisma.organizationRole.upsert({
      where: {
        userId_organizationId: { userId: student.id, organizationId: organization.id },
      },
      update: {},
      create: {
        userId: student.id,
        organizationId: organization.id,
        role: "Student",
      },
    });
  }

  console.log("✓ Organization roles assigned");

  // ============================================
  // CREATE K12 CLASS
  // ============================================
  console.log("📖 Creating K12 class...");

  const k12Class = await prisma.k12Class.create({
    data: {
      name: "Demo Literature - Period 3",
      subtitle: "American Literature & Writing",
      organizationId: organization.id,
      instructorId: teacher.id,
      gradeLevel: "11",
      subject: "literature",
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-06-01"),
      numUnits: 4,
      numWeeks: 36,
      status: "active",
    },
  });

  console.log(`✓ K12 Class created: ${k12Class.name}`);

  // ============================================
  // CREATE K12 ENROLLMENTS
  // ============================================
  console.log("📝 Enrolling students in class...");

  for (const student of students) {
    await prisma.k12Enrollment.create({
      data: {
        classId: k12Class.id,
        studentId: student.id,
        status: "active",
      },
    });
  }

  console.log(`✓ ${students.length} students enrolled in class`);

  // ============================================
  // CREATE STANDARDS
  // ============================================
  console.log("🎯 Creating standards and objectives...");

  // Standard 1: Textual Evidence
  const standard1 = await prisma.standard.create({
    data: {
      organizationId: organization.id,
      type: "content",
      code: "CCSS.ELA-LITERACY.RL.11-12.1",
      name: "Cite Textual Evidence",
      description: "Students can cite strong evidence from text to support analysis",
      passPercentage: 80,
      mandatoryObjectiveIds: JSON.stringify(["obj1", "obj2"]),
    },
  });

  // Create objectives for standard 1
  const obj1_1 = await prisma.exampleObjective.create({
    data: {
      standardId: standard1.id,
      label: "A",
      text: "Identify explicit details from text",
      learningTarget: "Locate and mark specific quotes that support analysis",
      sequenceNum: 1,
      source: "curriculum",
      isMandatory: true,
    },
  });

  const obj1_2 = await prisma.exampleObjective.create({
    data: {
      standardId: standard1.id,
      label: "B",
      text: "Analyze implicit meanings",
      learningTarget: "Explain what text suggests without stating directly",
      sequenceNum: 2,
      source: "curriculum",
      isMandatory: true,
    },
  });

  const obj1_3 = await prisma.exampleObjective.create({
    data: {
      standardId: standard1.id,
      label: "C",
      text: "Synthesize multiple sources",
      learningTarget: "Combine evidence from multiple texts for analysis",
      sequenceNum: 3,
      source: "curriculum",
      isMandatory: false,
    },
  });

  // Standard 2: Character Analysis
  const standard2 = await prisma.standard.create({
    data: {
      organizationId: organization.id,
      type: "content",
      code: "CCSS.ELA-LITERACY.RL.11-12.3",
      name: "Character Development",
      description: "Analyze how complex characters develop through interactions",
      passPercentage: 80,
      mandatoryObjectiveIds: JSON.stringify(["obj3"]),
    },
  });

  const obj2_1 = await prisma.exampleObjective.create({
    data: {
      standardId: standard2.id,
      label: "A",
      text: "Identify character traits",
      learningTarget: "List and support character qualities with evidence",
      sequenceNum: 1,
      source: "curriculum",
      isMandatory: true,
    },
  });

  const obj2_2 = await prisma.exampleObjective.create({
    data: {
      standardId: standard2.id,
      label: "B",
      text: "Trace character change",
      learningTarget: "Explain how characters change and why",
      sequenceNum: 2,
      source: "curriculum",
      isMandatory: false,
    },
  });

  console.log(`✓ Created 2 standards with 5 objectives total`);

  // ============================================
  // CREATE CLASS STANDARDS LINK
  // ============================================
  console.log("🔗 Linking standards to class...");

  await prisma.classStandard.create({
    data: {
      classId: k12Class.id,
      standardId: standard1.id,
    },
  });

  await prisma.classStandard.create({
    data: {
      classId: k12Class.id,
      standardId: standard2.id,
    },
  });

  console.log("✓ Standards linked to class");

  // ============================================
  // CREATE STUDENT PROGRESS
  // ============================================
  console.log("📊 Creating student progress data...");

  // Student 1: Mastered both standards
  await prisma.studentObjectiveProgress.create({
    data: {
      userId: students[0].id,
      objectiveId: obj1_1.id,
      completed: true,
      completedAt: new Date("2026-10-15"),
    },
  });

  await prisma.studentObjectiveProgress.create({
    data: {
      userId: students[0].id,
      objectiveId: obj1_2.id,
      completed: true,
      completedAt: new Date("2026-10-20"),
    },
  });

  await prisma.studentObjectiveProgress.create({
    data: {
      userId: students[0].id,
      objectiveId: obj1_3.id,
      completed: true,
      completedAt: new Date("2026-10-25"),
    },
  });

  await prisma.studentObjectiveProgress.create({
    data: {
      userId: students[0].id,
      objectiveId: obj2_1.id,
      completed: true,
      completedAt: new Date("2026-11-05"),
    },
  });

  await prisma.studentObjectiveProgress.create({
    data: {
      userId: students[0].id,
      objectiveId: obj2_2.id,
      completed: true,
      completedAt: new Date("2026-11-10"),
    },
  });

  // Student 2: In progress
  await prisma.studentObjectiveProgress.create({
    data: {
      userId: students[1].id,
      objectiveId: obj1_1.id,
      completed: true,
      completedAt: new Date("2026-10-20"),
    },
  });

  await prisma.studentObjectiveProgress.create({
    data: {
      userId: students[1].id,
      objectiveId: obj1_2.id,
      completed: false, // Not yet completed
    },
  });

  // Student 3: Just started
  await prisma.studentObjectiveProgress.create({
    data: {
      userId: students[2].id,
      objectiveId: obj1_1.id,
      completed: false,
    },
  });

  // Students 4 & 5: No progress yet

  console.log(`✓ Created realistic progress data for 3 students`);

  // ============================================
  // CREATE POLYMATH CONTENT
  // ============================================
  console.log("📰 Creating Polymath Magazine content...");

  const polymathArticle1 = await prisma.polymathArticle.create({
    data: {
      communityId: "demo-community", // Will create community next if needed
      authorId: teacher.id,
      title: "How to Write an Effective Essay",
      abstract: "Tips and strategies for structuring essays that earn high grades",
      content:
        "# How to Write an Effective Essay\n\n## Introduction\nA strong essay begins with a clear thesis...",
      topic: "writing",
      tags: "essays,writing,academic",
      estimatedReadTime: 8,
      status: "published",
      publishedAt: new Date("2026-10-01"),
      coverImage: "https://via.placeholder.com/600x400?text=Essay+Writing",
    },
  });

  console.log(`✓ Created Polymath article for demo`);

  // ============================================
  // NOTE: Improv classes deprecated, using K12 classes only
  // ============================================

  // ============================================
  // SUMMARY
  // ============================================
  console.log("\n✅ Demo data seeded successfully!\n");
  console.log("📋 DEMO CREDENTIALS:");
  console.log("   Admin:     admin@demo.test / demo-password-123");
  console.log("   Teacher:   teacher@demo.test / demo-password-123");
  console.log("   Student:   student1@demo.test / demo-password-123");
  console.log("   Parent:    parent1@demo.test / demo-password-123");
  console.log("\n🏫 TEST DATA:");
  console.log(`   Organization: ${organization.name}`);
  console.log(`   K12 Class: ${k12Class.name}`);
  console.log(`   Students: ${students.length} enrolled`);
  console.log(`   Standards: 2 with 5 objectives`);
  console.log("\n⚠️  This is DEMO DATA ONLY - not for production use!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
