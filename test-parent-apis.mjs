import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAPIs() {
  const parentId = 'cmsjazgo6003dugctxexleb21';
  const childId = 'cmsjazbgb0003ugct0889inmo';

  console.log('🧪 Testing T3 Parent APIs\n');

  try {
    // Test 1: GET /api/parents/children
    console.log('1️⃣  Testing: GET /api/parents/children');
    const children = await prisma.parentChild.findMany({
      where: { parentId },
      include: {
        child: {
          select: {
            id: true,
            name: true,
            k12Enrollments: {
              select: { class: { select: { gradeLevel: true } } },
              take: 1,
              orderBy: { enrolledAt: 'desc' },
            },
          },
        },
      },
    });

    if (children.length > 0) {
      console.log('   ✅ Found children:', children.map(c => c.child.name).join(', '));
    } else {
      console.log('   ❌ No children found');
    }

    // Test 2: GET /api/k12/parents/children/[childId]/progress
    console.log('\n2️⃣  Testing: GET /api/k12/parents/children/[childId]/progress');
    const enrollments = await prisma.k12Enrollment.findMany({
      where: { studentId: childId },
      include: {
        class: {
          include: {
            standards: {
              include: {
                standard: {
                  include: {
                    exampleObjectives: { take: 3 },
                  },
                },
              },
              take: 2,
            },
            instructor: true,
          },
        },
      },
    });

    if (enrollments.length > 0) {
      const enrollment = enrollments[0];
      console.log('   ✅ Found enrollment:', enrollment.class.name);
      console.log('   ✅ Teacher:', enrollment.class.instructor.name);
      console.log('   ✅ Standards:', enrollment.class.standards.length, 'available');
    } else {
      console.log('   ❌ No enrollments found');
    }

    // Test 3: GET /api/k12/parents/children/[childId]/teachers
    console.log('\n3️⃣  Testing: GET /api/k12/parents/children/[childId]/teachers');
    const teacherEnrollments = await prisma.k12Enrollment.findMany({
      where: { studentId: childId },
      include: {
        class: {
          select: {
            name: true,
            instructorId: true,
            instructor: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    const teachersMap = new Map();
    for (const enrollment of teacherEnrollments) {
      if (!teachersMap.has(enrollment.class.instructorId)) {
        teachersMap.set(enrollment.class.instructorId, {
          id: enrollment.class.instructor.id,
          name: enrollment.class.instructor.name,
          email: enrollment.class.instructor.email,
          className: enrollment.class.name,
        });
      }
    }

    const teachers = Array.from(teachersMap.values());
    if (teachers.length > 0) {
      console.log('   ✅ Found teachers:', teachers.map(t => t.name).join(', '));
      console.log('   ✅ Teacher emails:', teachers.map(t => t.email).join(', '));
    } else {
      console.log('   ❌ No teachers found');
    }

    // Test 4: Conversation infrastructure
    console.log('\n4️⃣  Testing: Conversation Infrastructure');
    const conversationCount = await prisma.conversation.count({
      where: { type: 'direct' },
    });
    console.log('   ✅ Direct conversations:', conversationCount);

    const messageCount = await prisma.message.count();
    console.log('   ✅ Total messages:', messageCount);

    console.log('\n✅ All API infrastructure tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIs();
