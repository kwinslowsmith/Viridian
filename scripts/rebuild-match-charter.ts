import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function rebuildMatchCharter() {
  try {
    console.log('🏫 Rebuilding Match Charter High School...\n');

    // Find or create Kyle's user (kwinslowsmith@gmail.com)
    let kyleUser = await prisma.user.findUnique({
      where: { email: 'kwinslowsmith@gmail.com' },
    });

    if (!kyleUser) {
      console.log('Creating Kyle user...');
      kyleUser = await prisma.user.create({
        data: {
          email: 'kwinslowsmith@gmail.com',
          name: 'Kyle Winslow Smith',
          role: 'superadmin',
        },
      });
    }
    console.log(`✓ Kyle user: ${kyleUser.id}`);

    // Create Match Charter organization
    console.log('\nCreating Match Charter High School organization...');
    const org = await prisma.organization.create({
      data: {
        name: 'Match Charter High School',
        slug: 'match-charter-high-school',
        description: 'Match Charter High School - AP Humanities Pathway',
        topic: 'education',
        isPublic: false,
      },
    });
    console.log(`✓ Organization: ${org.id}`);

    // Create 4 departments
    console.log('\nCreating departments...');
    const departments = await Promise.all([
      prisma.organizationalUnit.create({
        data: {
          organizationId: org.id,
          name: 'Humanities Department',
          description: 'Department focused on literature, history, and social sciences',
          type: 'Department',
        },
      }),
      prisma.organizationalUnit.create({
        data: {
          organizationId: org.id,
          name: 'Science Department',
          description: 'Department focused on natural sciences',
          type: 'Department',
        },
      }),
      prisma.organizationalUnit.create({
        data: {
          organizationId: org.id,
          name: 'Mathematics Department',
          description: 'Department focused on mathematics',
          type: 'Department',
        },
      }),
      prisma.organizationalUnit.create({
        data: {
          organizationId: org.id,
          name: 'English Department',
          description: 'Department focused on English language arts',
          type: 'Department',
        },
      }),
    ]);
    console.log(`✓ Created ${departments.length} departments`);

    // Create 5 teacher accounts
    console.log('\nCreating teacher accounts...');
    const teacherEmails = [
      { email: 'teacher1-pre-ap-world@matchhs.edu', name: 'Pre-AP World History Teacher' },
      { email: 'teacher2-ap-world@matchhs.edu', name: 'AP World History Teacher' },
      { email: 'teacher3-ap-seminar@matchhs.edu', name: 'AP Seminar Teacher' },
      { email: 'teacher4-ap-us-history@matchhs.edu', name: 'AP US History Teacher' },
      { email: 'teacher5-ap-gov@matchhs.edu', name: 'AP Government Teacher' },
    ];

    const teachers = await Promise.all(
      teacherEmails.map(t =>
        prisma.user.upsert({
          where: { email: t.email },
          update: { role: 'teacher' },
          create: {
            email: t.email,
            name: t.name,
            role: 'teacher',
          },
        })
      )
    );
    console.log(`✓ Created ${teachers.length} teachers`);

    // Define courses with their standards
    const courses = [
      {
        name: 'Pre-AP World History',
        slug: 'pre-ap-world-history',
        grade: 9,
        units: 5,
        teacher: teachers[0],
      },
      {
        name: 'AP World History: Modern',
        slug: 'ap-world-history',
        grade: 10,
        units: 5,
        teacher: teachers[1],
      },
      {
        name: 'AP Seminar',
        slug: 'ap-seminar',
        grade: 11,
        units: 4,
        teacher: teachers[2],
      },
      {
        name: 'AP US History',
        slug: 'ap-us-history',
        grade: 11,
        units: 5,
        teacher: teachers[3],
      },
      {
        name: 'AP US Government & Politics',
        slug: 'ap-gov',
        grade: 12,
        units: 4,
        teacher: teachers[4],
      },
    ];

    console.log('\nCreating courses and standards...');
    let totalStandards = 0;
    let totalObjectives = 0;

    for (const course of courses) {
      // Create K12Class
      const k12class = await prisma.k12Class.create({
        data: {
          organizationId: org.id,
          instructorId: course.teacher.id,
          name: course.name,
          subtitle: `Grade ${course.grade}`,
          gradeLevel: String(course.grade),
          subject: 'history',
          startDate: new Date('2026-09-01'),
          endDate: new Date('2027-06-01'),
          numUnits: course.units,
          numWeeks: 36,
          status: 'active',
        },
      });

      // Create units and standards for this course
      const standardsPerUnit = Math.floor(28 / courses.length / course.units);
      for (let u = 1; u <= course.units; u++) {
        // Create Unit
        const unit = await prisma.unit.create({
          data: {
            organizationId: org.id,
            code: `${course.slug.substring(0, 3).toUpperCase()}-U${u}`,
            name: `${course.name} - Unit ${u}`,
            description: `Unit ${u} for ${course.name}`,
            sequenceNum: u,
          },
        });

        for (let s = 0; s < standardsPerUnit; s++) {
          const standard = await prisma.standard.create({
            data: {
              organizationId: org.id,
              unitId: unit.id,
              code: `${course.slug.substring(0, 3).toUpperCase()}.${u}.${s + 1}`,
              name: `${course.name} - Unit ${u} Standard ${s + 1}`,
              description: `Content and skill standard for ${course.name}`,
              type: s % 2 === 0 ? 'content' : 'skill',
              passPercentage: 80,
            },
          });
          totalStandards++;

          // Create 3 objectives per standard (A, B, C levels)
          for (let obj = 0; obj < 3; obj++) {
            await prisma.exampleObjective.create({
              data: {
                standardId: standard.id,
                label: String.fromCharCode(65 + obj), // A, B, C
                text: `Level ${obj + 1} objective for ${standard.code}`,
                description: `Students will ${['approach', 'demonstrate proficiency in', 'exceed expectations in'][obj]} this standard`,
                sequenceNum: obj,
                source: 'curriculum',
              },
            });
            totalObjectives++;
          }
        }
      }

      console.log(`  ✓ ${course.name}: ${standardsPerUnit * course.units} standards, ${standardsPerUnit * course.units * 3} objectives`);
    }

    console.log(`\n✅ Match Charter High School rebuilt successfully!`);
    console.log(`\n📊 Created:`);
    console.log(`  - 1 organization (Match Charter High School)`);
    console.log(`  - 4 departments`);
    console.log(`  - 5 courses with 5 teachers`);
    console.log(`  - ${totalStandards} standards`);
    console.log(`  - ${totalObjectives} objectives`);
    console.log(`\n🔑 Kyle's account: kwinslowsmith@gmail.com (SuperAdmin)`);
    console.log(`\n💾 Data is now in Supabase and can be backed up`);
  } catch (error) {
    console.error('❌ Error rebuilding Match Charter:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

rebuildMatchCharter();
