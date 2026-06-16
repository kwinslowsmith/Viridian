const { prisma } = require('../lib/prisma');
const { matchCharterSeedData } = require('../lib/match-charter-seed');

async function main() {
  try {
    const orgData = matchCharterSeedData.organization;
    const departments = matchCharterSeedData.departments;
    const courses = matchCharterSeedData.courses;

    console.log('Creating Match Charter High School...\n');

    // Create or get organization
    let org = await prisma.organization.findUnique({
      where: { slug: orgData.slug },
    });

    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: orgData.name,
          slug: orgData.slug,
          description: orgData.description,
          topic: orgData.topic,
          isPublic: orgData.isPublic,
        },
      });
      console.log(`✓ Created organization: ${org.name}`);
    } else {
      console.log(`✓ Organization already exists: ${org.name}`);
    }

    // Create teacher users for each course
    const teacherMap: Record<string, string> = {};
    for (const course of courses) {
      const email = `teacher-${course.code}@match-charter.edu`;
      let teacher = await prisma.user.findUnique({
        where: { email },
      });

      if (!teacher) {
        teacher = await prisma.user.create({
          data: {
            email,
            name: `${course.name} Teacher`,
            emailVerified: true,
          },
        });
      }

      // Ensure teacher has role in organization
      const existingRole = await prisma.organizationRole.findUnique({
        where: {
          userId_organizationId: {
            userId: teacher.id,
            organizationId: org.id,
          },
        },
      });

      if (!existingRole) {
        await prisma.organizationRole.create({
          data: {
            userId: teacher.id,
            organizationId: org.id,
            role: 'Teacher',
          },
        });
      }

      teacherMap[course.code] = teacher.id;
    }

    // Create departments with resource libraries
    const deptMap: Record<string, any> = {};
    for (const dept of departments) {
      const deptUnit = await prisma.organizationalUnit.create({
        data: {
          organizationId: org.id,
          name: dept.name,
          description: dept.description,
          type: dept.type,
          visibility: 'public',
          accessLevel: 'admin-assigned',
        },
      });

      // Create resource library for this department
      const library = await prisma.resourceLibrary.create({
        data: {
          organizationId: org.id,
          name: `${dept.name} Resource Library`,
          description: `Resources for ${dept.name}`,
          organizationalUnitId: deptUnit.id,
        },
      });

      deptMap[dept.name] = { unit: deptUnit, library };
      console.log(`✓ Created department: ${dept.name}`);
    }

    // Create courses and standards
    let courseCount = 0;
    let standardCount = 0;
    let objectiveCount = 0;

    console.log('\nCreating courses and standards...');

    for (const course of courses) {
      const dept = deptMap[course.department];
      if (!dept) {
        console.warn(`Department not found: ${course.department}`);
        continue;
      }

      const teacherId = teacherMap[course.code];
      if (!teacherId) {
        console.warn(`Teacher not found for course: ${course.name}`);
        continue;
      }

      // Create K12Class
      const k12Class = await prisma.k12Class.create({
        data: {
          organizationId: org.id,
          instructorId: teacherId,
          name: course.name,
          gradeLevel: course.gradeLevel,
          subject: 'history', // Default subject for humanities
          startDate: new Date('2024-08-01'),
          endDate: new Date('2025-05-30'),
          numUnits: 5,
          status: 'active',
        },
      });
      courseCount++;

      // Create skill standards
      for (const skillStd of course.skillStandards) {
        const standard = await prisma.standard.create({
          data: {
            organizationId: org.id,
            code: skillStd.code,
            name: skillStd.name,
            description: skillStd.description,
            type: 'skill',
            passPercentage: 80,
          },
        });
        standardCount++;

        // Create objectives for this skill standard
        let sequenceNum = 1;
        for (const obj of skillStd.objectives) {
          await prisma.exampleObjective.create({
            data: {
              standardId: standard.id,
              label: obj.label,
              text: obj.text,
              description: obj.description,
              sequenceNum: sequenceNum++,
            },
          });
          objectiveCount++;
        }

        // Link standard to class
        await prisma.classStandard.create({
          data: {
            classId: k12Class.id,
            standardId: standard.id,
          },
        });
      }

      // Create content standards
      for (const contentStd of course.contentStandards) {
        const standard = await prisma.standard.create({
          data: {
            organizationId: org.id,
            code: contentStd.code,
            name: contentStd.name,
            description: contentStd.description,
            type: 'content',
            passPercentage: 80,
          },
        });
        standardCount++;

        // Create objectives for this content standard
        let sequenceNum = 1;
        for (const obj of contentStd.objectives) {
          await prisma.exampleObjective.create({
            data: {
              standardId: standard.id,
              label: obj.label,
              text: obj.text,
              description: obj.description,
              sequenceNum: sequenceNum++,
            },
          });
          objectiveCount++;
        }

        // Link standard to class
        await prisma.classStandard.create({
          data: {
            classId: k12Class.id,
            standardId: standard.id,
          },
        });
      }

      console.log(`  ✓ ${course.name} (Grade ${course.gradeLevel})`);
    }

    console.log('\n=== Seed Complete ===');
    console.log(`Organization: ${org.name} (${org.slug})`);
    console.log(`Departments: ${departments.length}`);
    console.log(`Courses: ${courseCount}`);
    console.log(`Standards: ${standardCount}`);
    console.log(`Objectives: ${objectiveCount}`);
    console.log(`\nAccess organization at: http://localhost:3000/organization/${org.slug}`);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
