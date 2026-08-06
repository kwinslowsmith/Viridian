import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTeachersToOrg() {
  try {
    const org = await prisma.organization.findUnique({
      where: { slug: 'match-charter-high-school' },
    });

    if (!org) {
      console.error('❌ Match Charter organization not found');
      return;
    }

    const teacherEmails = [
      'teacher1-pre-ap-world@matchhs.edu',
      'teacher2-ap-world@matchhs.edu',
      'teacher3-ap-seminar@matchhs.edu',
      'teacher4-ap-us-history@matchhs.edu',
      'teacher5-ap-gov@matchhs.edu',
    ];

    for (const email of teacherEmails) {
      const teacher = await prisma.user.findUnique({
        where: { email },
      });

      if (!teacher) {
        console.log(`⚠️  Teacher not found: ${email}`);
        continue;
      }

      await prisma.organizationRole.upsert({
        where: {
          userId_organizationId: {
            userId: teacher.id,
            organizationId: org.id,
          },
        },
        update: { role: 'Teacher' },
        create: {
          userId: teacher.id,
          organizationId: org.id,
          role: 'Teacher',
        },
      });

      console.log(`✅ Added ${email} as Teacher`);
    }

    console.log('\n✅ All teachers added to Match Charter');
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addTeachersToOrg();
