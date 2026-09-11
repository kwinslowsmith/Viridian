import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Phase 3 test data (Assessments, Submissions, Mastery, Interventions)...');

  // Get or find existing test data
  let org = await prisma.organization.findFirst({
    where: { slug: 'demo-charter-school' },
  });

  if (!org) {
    org = await prisma.organization.findFirst({
      where: { slug: 'mf-improv' },
    });
  }

  if (!org) {
    console.error('Error: No suitable organization found. Run demo or main seed first.');
    process.exit(1);
  }

  // Get first teacher and students
  const teacher = await prisma.user.findFirst({
    where: {
      organizationRoles: {
        some: {
          organizationId: org.id,
          role: 'Teacher',
        },
      },
    },
  });

  if (!teacher) {
    console.error('Error: No teacher found in organization. Run main seed first.');
    process.exit(1);
  }

  // Get first K12 class
  const k12Class = await prisma.k12Class.findFirst({
    where: {
      organizationId: org.id,
      instructorId: teacher.id,
    },
  });

  if (!k12Class) {
    console.error('Error: No K12Class found for teacher. Run main seed first.');
    process.exit(1);
  }

  // Get enrolled students
  const enrollments = await prisma.k12Enrollment.findMany({
    where: { classId: k12Class.id },
    include: { student: true },
    take: 3,
  });

  if (enrollments.length === 0) {
    console.error('Error: No students enrolled in class. Run main seed first.');
    process.exit(1);
  }

  console.log(`Using class: ${k12Class.name}`);
  console.log(`Using ${enrollments.length} students for test data`);

  // Get standards linked to the class
  const classStandards = await prisma.classStandard.findMany({
    where: { classId: k12Class.id },
    include: {
      standard: {
        include: {
          exampleObjectives: true,
        },
      },
    },
    take: 2,
  });

  if (classStandards.length === 0) {
    console.error('Error: No standards linked to class. Run main seed first.');
    process.exit(1);
  }

  console.log(`Using ${classStandards.length} standards`);

  // Create 3 assessments
  console.log('\n📝 Creating assessments...');
  const assessments = [];

  const standard1 = classStandards[0]?.standard;
  const standard2 = classStandards[1]?.standard || standard1;

  // Assessment 1: Formative
  const formativeObjectiveIds = standard1?.exampleObjectives
    ?.slice(0, 2)
    .map((o) => o.id) || [];

  const assessment1 = await prisma.k12Assessment.create({
    data: {
      classId: k12Class.id,
      standardId: standard1.id,
      title: 'Unit 1 Quick Check',
      description: 'Formative assessment on foundational concepts',
      type: 'formative',
      objectiveIds: JSON.stringify(formativeObjectiveIds),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdBy: teacher.id,
    },
  });
  assessments.push(assessment1);
  console.log(`✓ Created formative assessment: ${assessment1.title}`);

  // Assessment 2: Summative
  const summativeObjectiveIds = standard1?.exampleObjectives
    ?.map((o) => o.id) || [];

  const assessment2 = await prisma.k12Assessment.create({
    data: {
      classId: k12Class.id,
      standardId: standard1.id,
      title: 'Unit 1 Mastery Test',
      description: 'Summative assessment covering all Unit 1 objectives',
      type: 'summative',
      objectiveIds: JSON.stringify(summativeObjectiveIds),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      createdBy: teacher.id,
    },
  });
  assessments.push(assessment2);
  console.log(`✓ Created summative assessment: ${assessment2.title}`);

  // Assessment 3: Formative (for standard 2)
  const standard2ObjectiveIds = standard2?.exampleObjectives
    ?.slice(0, 2)
    .map((o) => o.id) || [];

  const assessment3 = await prisma.k12Assessment.create({
    data: {
      classId: k12Class.id,
      standardId: standard2.id,
      title: 'Unit 2 Formative Check',
      description: 'Quick check on early Unit 2 concepts',
      type: 'formative',
      objectiveIds: JSON.stringify(standard2ObjectiveIds),
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      createdBy: teacher.id,
    },
  });
  assessments.push(assessment3);
  console.log(`✓ Created formative assessment: ${assessment3.title}`);

  // Create submissions with varied grades
  console.log('\n📤 Creating submissions with grades...');
  const grades = [60, 75, 85, 90]; // Varied scores to show mastery spread
  let submissionCount = 0;

  for (const assessment of assessments) {
    for (let i = 0; i < enrollments.length; i++) {
      const enrollment = enrollments[i];
      const grade = grades[i % grades.length];

      // Create submission
      const submission = await prisma.k12Submission.create({
        data: {
          assessmentId: assessment.id,
          studentId: enrollment.studentId,
          enrollmentId: enrollment.id,
          submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Submitted within last week
          grade,
          feedback: `Good effort! Focus on ${assessment.title.includes('Quick') ? 'deeper analysis' : 'application'}. Keep practicing!`,
          status: 'graded',
        },
      });

      submissionCount++;
      console.log(
        `  ✓ Student "${enrollment.student.name}" submitted "${assessment.title}" with grade ${grade}`
      );
    }
  }
  console.log(`✓ Created ${submissionCount} submissions total`);

  // Create intervention groups
  console.log('\n👥 Creating intervention groups...');

  // Get an objective to target for intervention
  const targetObjective = standard1?.exampleObjectives?.[0];
  if (!targetObjective) {
    console.error('Error: No objectives found for intervention group creation');
    process.exit(1);
  }

  // Intervention Group 1: For students struggling with foundational concepts
  const interventionGroup1 = await prisma.interventionGroup.create({
    data: {
      classId: k12Class.id,
      name: `Reteach: ${targetObjective.text}`,
      objectiveId: targetObjective.id,
      meetingSchedule: 'Tuesday & Thursday after school',
      startDate: new Date(),
      createdBy: teacher.id,
    },
  });
  console.log(`✓ Created intervention group: ${interventionGroup1.name}`);

  // Add 2 students to first intervention group (students with lower grades)
  for (let i = 0; i < Math.min(2, enrollments.length); i++) {
    const enrollment = enrollments[i];
    await prisma.interventionGroupStudent.create({
      data: {
        groupId: interventionGroup1.id,
        studentId: enrollment.studentId,
        enrollmentId: enrollment.id,
        status: 'active',
      },
    });
    console.log(
      `  ✓ Added "${enrollment.student.name}" to intervention group`
    );
  }

  // Intervention Group 2: For another objective (if available)
  const targetObjective2 = standard2?.exampleObjectives?.[0];
  if (targetObjective2) {
    const interventionGroup2 = await prisma.interventionGroup.create({
      data: {
        classId: k12Class.id,
        name: `Enrichment: ${targetObjective2.text}`,
        objectiveId: targetObjective2.id,
        meetingSchedule: 'Monday & Wednesday before school',
        startDate: new Date(),
        createdBy: teacher.id,
      },
    });
    console.log(`✓ Created intervention group: ${interventionGroup2.name}`);

    // Add 1 student to second intervention group
    if (enrollments.length > 1) {
      const enrollment = enrollments[enrollments.length - 1];
      await prisma.interventionGroupStudent.create({
        data: {
          groupId: interventionGroup2.id,
          studentId: enrollment.studentId,
          enrollmentId: enrollment.id,
          status: 'active',
        },
      });
      console.log(
        `  ✓ Added "${enrollment.student.name}" to enrichment group`
      );
    }
  }

  console.log('\n✅ Phase 3 test data seeded successfully!');
  console.log(`
📊 Summary:
  - Assessments: ${assessments.length}
  - Submissions: ${submissionCount}
  - Intervention Groups: ${targetObjective2 ? 2 : 1}

🎯 Test Data Ready For:
  - Assessment CRUD endpoints
  - Submission & Grading APIs
  - Mastery calculation
  - Intervention group management
  `);
}

main()
  .catch((e) => {
    console.error('Error seeding Phase 3 data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
