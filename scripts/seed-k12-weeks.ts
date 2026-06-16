import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all K12 classes in Match Charter
    const org = await prisma.organization.findUnique({
      where: { slug: 'match-charter-high-school' },
      select: { id: true },
    });

    if (!org) {
      console.log('Match Charter org not found');
      return;
    }

    const classes = await prisma.k12Class.findMany({
      where: { organizationId: org.id },
    });

    console.log(`Creating weeks for ${classes.length} classes...`);

    for (const klass of classes) {
      // Delete old weeks first
      await prisma.k12Week.deleteMany({
        where: { classId: klass.id },
      });

      const startDate = new Date(2026, 5, 1); // June 1, 2026

      // Create 36 weeks (9 months of school)
      const weeks = [];
      for (let i = 1; i <= 36; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(weekStart.getDate() + (i - 1) * 7);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        weeks.push({
          classId: klass.id,
          weekNum: i,
          title: `Unit ${Math.ceil(i / (36 / klass.numUnits))}, Week ${i % Math.ceil(36 / klass.numUnits) || Math.ceil(36 / klass.numUnits)}`,
          unit: `Unit ${Math.ceil(i / (36 / klass.numUnits))}`,
          startDate: weekStart,
          endDate: weekEnd,
        });
      }

      // Bulk create weeks
      await prisma.k12Week.createMany({
        data: weeks,
      });

      console.log(`Created ${weeks.length} weeks for ${klass.name}`);
    }

    console.log('✅ K12 weeks seeded successfully');
  } catch (error) {
    console.error('Error seeding K12 weeks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
