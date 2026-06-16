import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function linkStandardsToClasses() {
  try {
    // Find Match Charter org
    const org = await prisma.organization.findUnique({
      where: { slug: 'match-charter-high-school' },
    });

    if (!org) {
      console.error('Match Charter org not found');
      return;
    }

    console.log('📍 Found Match Charter org:', org.id);

    // Get all K12 classes in this org
    const classes = await prisma.k12Class.findMany({
      where: { organizationId: org.id },
    });

    console.log(`📚 Found ${classes.length} K12 classes`);

    // Get all standards in this org
    const standards = await prisma.standard.findMany({
      where: { organizationId: org.id },
    });

    console.log(`📖 Found ${standards.length} standards`);

    if (classes.length === 0 || standards.length === 0) {
      console.log('⚠️ No classes or standards found. Skipping.');
      return;
    }

    // Create a mapping of class code to its standards
    // For now, just link each class to ALL standards (simplified approach)
    // In future, this could be more sophisticated based on course codes

    let created = 0;
    for (const klass of classes) {
      for (const standard of standards) {
        // Check if already linked
        const existing = await prisma.classStandard.findUnique({
          where: {
            classId_standardId: {
              classId: klass.id,
              standardId: standard.id,
            },
          },
        });

        if (!existing) {
          await prisma.classStandard.create({
            data: {
              classId: klass.id,
              standardId: standard.id,
            },
          });
          created++;
        }
      }
    }

    console.log(`✅ Created ${created} ClassStandard linkages`);
    console.log('🎯 All K12 classes now have access to Match Charter standards');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

linkStandardsToClasses();
