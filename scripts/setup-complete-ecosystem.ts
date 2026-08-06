import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupCompleteEcosystem() {
  try {
    console.log('🔧 Setting up complete Viridian ecosystem...\n');

    // Get Match Charter
    const matchCharter = await prisma.organization.findUnique({
      where: { slug: 'match-charter-high-school' },
    });

    if (!matchCharter) {
      console.error('❌ Match Charter not found');
      return;
    }

    // Get MF Improv
    const mfImprov = await prisma.organization.findUnique({
      where: { slug: 'mf-improv' },
    });

    if (!mfImprov) {
      console.error('❌ MF Improv not found');
      return;
    }

    // Get all courses
    const courses = await prisma.k12Class.findMany({
      where: { organizationId: matchCharter.id },
    });

    console.log('📚 Creating 30 test students...');
    const students = [];
    for (let i = 1; i <= 30; i++) {
      const student = await prisma.user.upsert({
        where: { email: `student${i}@matchhs.edu` },
        update: { role: 'student' },
        create: {
          email: `student${i}@matchhs.edu`,
          name: `Student ${i}`,
          role: 'student',
        },
      });
      students.push(student);
    }
    console.log(`✅ Created ${students.length} students`);

    // Add students to Match Charter organization
    console.log('\n📋 Adding students to Match Charter...');
    for (const student of students) {
      await prisma.organizationRole.upsert({
        where: {
          userId_organizationId: {
            userId: student.id,
            organizationId: matchCharter.id,
          },
        },
        update: { role: 'Student' },
        create: {
          userId: student.id,
          organizationId: matchCharter.id,
          role: 'Student',
        },
      });
    }
    console.log(`✅ Added all students to Match Charter`);

    // Enroll students in courses (distribute randomly)
    console.log('\n📝 Enrolling students in courses...');
    let totalEnrollments = 0;
    for (const course of courses) {
      const studentsPerCourse = Math.floor(students.length / courses.length) + 1;
      const courseStudents = students.sort(() => Math.random() - 0.5).slice(0, studentsPerCourse);

      for (const student of courseStudents) {
        await prisma.k12Enrollment.create({
          data: {
            studentId: student.id,
            classId: course.id,
            status: 'active',
          },
        });
        totalEnrollments++;
      }
      console.log(`  ✓ ${course.name}: ${courseStudents.length} students`);
    }
    console.log(`✅ Total enrollments: ${totalEnrollments}`);

    // Set up MF Improv with a community
    console.log('\n🎭 Setting up MF Improv community...');
    const kyle = await prisma.user.findUnique({ where: { email: 'kwinslowsmith@gmail.com' } });

    const mfCommunity = await prisma.learningCommunity.upsert({
      where: { slug: 'mf-improv-main' },
      update: {},
      create: {
        name: 'MF Improv Ensemble',
        slug: 'mf-improv-main',
        description: 'Musical Improv Mastery & Ensemble Development',
        organizationId: mfImprov.id,
        scope: 'organization',
        curatorId: kyle!.id,
      },
    });
    console.log(`✅ Created MF Improv community: ${mfCommunity.name}`);

    // Add Kyle as curator of MF Improv community
    if (kyle) {
      await prisma.learningCommunityMember.upsert({
        where: {
          communityId_userId: {
            userId: kyle.id,
            communityId: mfCommunity.id,
          },
        },
        update: { role: 'curator' },
        create: {
          userId: kyle.id,
          communityId: mfCommunity.id,
          role: 'curator',
        },
      });
    }

    console.log('\n✅ Ecosystem setup complete!');
    console.log('\n📊 Summary:');
    console.log(`  - 30 test students created`);
    console.log(`  - ${totalEnrollments} student enrollments in Match Charter courses`);
    console.log(`  - MF Improv community created`);
    console.log(`  - Kyle is curator of MF Improv`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupCompleteEcosystem();
