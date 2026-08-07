import { prisma } from '@/lib/prisma';

async function seedTestData() {
  console.log('🌱 Starting K12 test data seed...\n');

  try {
    // 1. CREATE ORGANIZATION (School)
    console.log('📍 Creating school organization...');
    const org = await prisma.organization.create({
      data: {
        name: 'Riverside High School',
        slug: 'riverside-high',
        description: 'A progressive high school focused on mastery-based learning',
        topic: 'education',
        isPublic: true,
        curatorName: 'Sarah Chen',
        curatorBio: 'High school principal',
      },
    });
    console.log(`   ✓ Created organization: ${org.name}\n`);

    // 2. CREATE USERS (Teachers + Students)
    console.log('👥 Creating users...');

    const teachers = [];
    for (let i = 1; i <= 2; i++) {
      const teacher = await prisma.user.create({
        data: {
          email: `teacher${i}@riverside.edu`,
          name: `Teacher ${i} ${['Rodriguez', 'Williams'][i - 1]}`,
          emailVerified: true,
          role: 'instructor',
        },
      });
      teachers.push(teacher);
      console.log(`   ✓ Created teacher: ${teacher.name}`);
    }

    const students = [];
    for (let i = 1; i <= 6; i++) {
      const student = await prisma.user.create({
        data: {
          email: `student${i}@riverside.edu`,
          name: `Student ${i} ${['Chen', 'Johnson', 'Lee', 'Martinez', 'Brown', 'Davis'][i - 1]}`,
          emailVerified: true,
          role: 'student',
        },
      });
      students.push(student);
      console.log(`   ✓ Created student: ${student.name}`);
    }
    console.log();

    // 3. CREATE K12 CLASSES
    console.log('🎓 Creating K12 classes...');
    const classes: Array<{ id: string; name: string; instructorId: string }> = [];

    const classConfigs = [
      {
        name: 'American Literature, Period 3',
        instructor: teachers[0],
        gradeLevel: '11',
        subject: 'literature',
        startDate: new Date('2026-08-15'),
        endDate: new Date('2027-05-30'),
      },
      {
        name: 'Algebra II, Period 4',
        instructor: teachers[1],
        gradeLevel: '10',
        subject: 'mathematics',
        startDate: new Date('2026-08-15'),
        endDate: new Date('2027-05-30'),
      },
    ];

    for (const config of classConfigs) {
      const k12Class = await prisma.k12Class.create({
        data: {
          name: config.name,
          organizationId: org.id,
          instructorId: config.instructor.id,
          gradeLevel: config.gradeLevel,
          subject: config.subject,
          startDate: config.startDate,
          endDate: config.endDate,
          numUnits: 8,
          numWeeks: 36,
        },
      });
      classes.push(k12Class);
      console.log(`   ✓ Created class: ${k12Class.name}`);
    }
    console.log();

    // 4. ENROLL STUDENTS IN CLASSES
    console.log('📝 Enrolling students in classes...');
    const enrollments = [];

    // 3 students per class
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 3; j++) {
        const enrollment = await prisma.k12Enrollment.create({
          data: {
            classId: classes[i].id,
            studentId: students[i * 3 + j].id,
            status: 'active',
          },
        });
        enrollments.push(enrollment);
      }
      console.log(`   ✓ Enrolled 3 students in ${classes[i].name}`);
    }
    console.log();

    // 5. CREATE STANDARDS & OBJECTIVES
    console.log('📚 Creating standards with objectives...');
    const standards = [];

    const standardConfigs = [
      {
        code: 'ELA.11.A',
        name: 'Analyze Literary Themes',
        description: 'Students can identify and analyze major themes in classic literature',
      },
      {
        code: 'ELA.11.B',
        name: 'Essay Writing & Argument',
        description: 'Students can construct evidence-based arguments in persuasive essays',
      },
      {
        code: 'MATH.10.A',
        name: 'Quadratic Equations',
        description: 'Students can solve and graph quadratic equations',
      },
      {
        code: 'MATH.10.B',
        name: 'Polynomial Operations',
        description: 'Students can perform operations with polynomials',
      },
    ];

    for (const config of standardConfigs) {
      const standard = await prisma.standard.create({
        data: {
          code: config.code,
          name: config.name,
          description: config.description,
          organizationId: org.id,
          type: 'content',
          passPercentage: 80,
          visibility: 'organization',
        },
      });

      // Create objectives for this standard
      const objectives = [
        { label: 'A', text: 'Identify primary and secondary themes' },
        { label: 'B', text: 'Analyze how themes develop throughout text' },
        { label: 'C', text: 'Compare themes across multiple texts' },
      ];

      for (let i = 0; i < objectives.length; i++) {
        const obj = objectives[i];
        await prisma.exampleObjective.create({
          data: {
            standardId: standard.id,
            label: obj.label,
            text: obj.text,
            sequenceNum: i + 1,
            source: 'curriculum',
            isMandatory: i < 2, // First 2 objectives are mandatory
          },
        });
      }

      standards.push(standard);
      console.log(`   ✓ Created standard: ${standard.name} (3 objectives)`);
    }
    console.log();

    // 6. LINK STANDARDS TO CLASSES
    console.log('🔗 Linking standards to classes...');

    // Lit standards to Lit class
    for (let i = 0; i < 2; i++) {
      await prisma.classStandard.create({
        data: {
          classId: classes[0].id,
          standardId: standards[i].id,
        },
      });
    }
    console.log(`   ✓ Linked 2 standards to ${classes[0].name}`);

    // Math standards to Math class
    for (let i = 2; i < 4; i++) {
      await prisma.classStandard.create({
        data: {
          classId: classes[1].id,
          standardId: standards[i].id,
        },
      });
    }
    console.log(`   ✓ Linked 2 standards to ${classes[1].name}`);
    console.log();

    // 7. CREATE ASSESSMENTS
    console.log('📊 Creating assessments...');
    const assessments = [];

    const assessmentConfigs = [
      {
        classId: classes[0].id,
        standardId: standards[0].id,
        title: 'Theme Analysis Essay - The Great Gatsby',
        type: 'summative' as const,
        dueDate: new Date('2026-09-15'),
      },
      {
        classId: classes[0].id,
        standardId: standards[1].id,
        title: 'Persuasive Essay on Climate Policy',
        type: 'summative' as const,
        dueDate: new Date('2026-10-01'),
      },
      {
        classId: classes[1].id,
        standardId: standards[2].id,
        title: 'Quadratic Equations Quiz',
        type: 'formative' as const,
        dueDate: new Date('2026-09-20'),
      },
      {
        classId: classes[1].id,
        standardId: standards[3].id,
        title: 'Polynomial Long Division Test',
        type: 'summative' as const,
        dueDate: new Date('2026-09-28'),
      },
    ];

    for (const config of assessmentConfigs) {
      const assessment = await prisma.k12Assessment.create({
        data: {
          classId: config.classId,
          standardId: config.standardId,
          title: config.title,
          type: config.type,
          dueDate: config.dueDate,
          visibility: 'class',
          createdBy: teachers[0].id, // TODO: match to correct instructor
        },
      });
      assessments.push(assessment);
      console.log(`   ✓ Created assessment: ${assessment.title}`);
    }
    console.log();

    // 8. CREATE SUBMISSIONS WITH VARIED GRADES
    console.log('📝 Creating student submissions with grades...');

    const submissionScenarios = [
      // Student 0 (Chen) - strong performer
      { enrollmentIdx: 0, assessmentIdx: 0, grade: 92, submitted: true },
      { enrollmentIdx: 0, assessmentIdx: 1, grade: 85, submitted: true },
      { enrollmentIdx: 0, assessmentIdx: 2, grade: 88, submitted: true },

      // Student 1 (Johnson) - average
      { enrollmentIdx: 1, assessmentIdx: 0, grade: 75, submitted: true },
      { enrollmentIdx: 1, assessmentIdx: 1, grade: 70, submitted: true },
      { enrollmentIdx: 1, assessmentIdx: 2, grade: 65, submitted: true },

      // Student 2 (Lee) - struggling
      { enrollmentIdx: 2, assessmentIdx: 0, grade: 55, submitted: true },
      { enrollmentIdx: 2, assessmentIdx: 1, grade: null, submitted: false },
      { enrollmentIdx: 2, assessmentIdx: 2, grade: 45, submitted: true },

      // Student 3 (Martinez) - strong
      { enrollmentIdx: 3, assessmentIdx: 2, grade: 95, submitted: true },
      { enrollmentIdx: 3, assessmentIdx: 3, grade: 90, submitted: true },

      // Student 4 (Brown) - average
      { enrollmentIdx: 4, assessmentIdx: 2, grade: 72, submitted: true },
      { enrollmentIdx: 4, assessmentIdx: 3, grade: 68, submitted: true },

      // Student 5 (Davis) - struggling
      { enrollmentIdx: 5, assessmentIdx: 2, grade: 55, submitted: true },
      { enrollmentIdx: 5, assessmentIdx: 3, grade: null, submitted: false },
    ];

    for (const scenario of submissionScenarios) {
      if (assessments[scenario.assessmentIdx]) {
        const status = scenario.submitted
          ? scenario.grade ? 'graded' : 'submitted'
          : 'not-submitted';

        await prisma.k12Submission.create({
          data: {
            assessmentId: assessments[scenario.assessmentIdx].id,
            studentId: enrollments[scenario.enrollmentIdx].studentId,
            enrollmentId: enrollments[scenario.enrollmentIdx].id,
            grade: scenario.grade,
            status: status,
            submittedAt: scenario.submitted
              ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
              : null,
            feedback: scenario.grade
              ? scenario.grade >= 80
                ? 'Great work! Shows deep understanding.'
                : 'Good effort. Review the rubric for next time.'
              : null,
          },
        });
      }
    }
    console.log(`   ✓ Created ${submissionScenarios.length} submissions with varied grades`);
    console.log();

    // 9. CREATE SCHOOL ASSESSMENTS (Master Calendar)
    console.log('📅 Creating school-wide assessments (Master Calendar)...');

    const schoolAssessmentConfigs = [
      {
        name: 'Q1 Midterm Exams',
        type: 'high-stakes' as const,
        date: new Date('2026-10-15'),
      },
      {
        name: 'Portfolio Showcase',
        type: 'major-assessment' as const,
        date: new Date('2026-11-20'),
      },
      {
        name: 'Q2 Final Exams',
        type: 'high-stakes' as const,
        date: new Date('2027-01-20'),
      },
    ];

    for (const config of schoolAssessmentConfigs) {
      await prisma.schoolAssessment.create({
        data: {
          name: config.name,
          organizationId: org.id,
          type: config.type,
          assessmentDate: config.date,
          visibility: 'organization',
          standardsAssessed: JSON.stringify(
            standards.slice(0, 2).map((s) => s.id)
          ),
        },
      });
      console.log(`   ✓ Created school event: ${config.name}`);
    }
    console.log();

    // 10. CREATE INTERVENTION GROUPS
    console.log('🆘 Creating intervention groups for struggling skills...');

    const objectives = await prisma.exampleObjective.findMany({
      where: {
        standard: {
          organizationId: org.id,
        },
      },
      take: 2,
    });

    if (objectives.length > 0) {
      for (let i = 0; i < Math.min(2, objectives.length); i++) {
        const group = await prisma.interventionGroup.create({
          data: {
            classId: classes[i].id,
            name: `Reteach - ${objectives[i].text}`,
            objectiveId: objectives[i].id,
            meetingSchedule: 'Tuesday & Thursday after school',
            startDate: new Date('2026-09-10'),
            createdBy: teachers[i].id,
          },
        });

        // Add struggling students to group
        const strugglersForThisClass = enrollments
          .filter((e) => e.classId === classes[i].id)
          .slice(0, 2); // Add first 2 students

        for (const enrollment of strugglersForThisClass) {
          await prisma.interventionGroupStudent.create({
            data: {
              groupId: group.id,
              studentId: enrollment.studentId,
              enrollmentId: enrollment.id,
              status: 'active',
            },
          });
        }

        console.log(
          `   ✓ Created intervention group: ${group.name} (${strugglersForThisClass.length} students)`
        );
      }
    }
    console.log();

    // 11. CREATE PARENT-CHILD RELATIONSHIPS
    console.log('👨‍👩‍👧 Creating parent-child relationships...');

    const parents = [];
    for (let i = 0; i < 3; i++) {
      const parent = await prisma.user.create({
        data: {
          email: `parent${i}@example.com`,
          name: `Parent ${i + 1}`,
          emailVerified: true,
          role: 'parent',
        },
      });
      parents.push(parent);

      // Link to 1-2 students
      const childCount = i < 2 ? 2 : 1;
      for (let j = 0; j < childCount; j++) {
        const studentIdx = i * 2 + j;
        if (studentIdx < students.length) {
          await prisma.parentChild.create({
            data: {
              parentId: parent.id,
              childId: students[studentIdx].id,
            },
          });
        }
      }
      console.log(`   ✓ Created parent: ${parent.name}`);
    }
    console.log();

    console.log('✅ Test data seed complete!\n');
    console.log('📊 Summary:');
    console.log(`   • 1 organization (school)`);
    console.log(`   • 2 teachers`);
    console.log(`   • 6 students`);
    console.log(`   • 3 parents`);
    console.log(`   • 2 K12 classes`);
    console.log(`   • 4 standards with 3 objectives each`);
    console.log(`   • 4 assessments`);
    console.log(`   • 14+ submissions with varied grades`);
    console.log(`   • 3 school-wide assessments`);
    console.log(`   • 2 intervention groups\n`);
    console.log('🚀 Your APIs should now return real data!');
    console.log('   Try: GET /api/k12/classes/[classId]/student-progress?studentId=[studentId]');
    console.log('   Or:  GET /api/k12/parents/children/[childId]/progress\n');
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData();
