import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  // Check AP US History
  const k12 = await prisma.k12Class.findFirst({
    where: { name: { contains: 'AP US History' } },
    select: { id: true, name: true }
  });

  const improv = await prisma.improvClass.findFirst({
    where: { name: { contains: 'AP US History' } },
    select: { id: true, name: true }
  });

  console.log('K12Class:', k12);
  console.log('ImprovClass:', improv);

  if (k12) {
    const classStds = await prisma.classStandard.count({
      where: { classId: k12.id }
    });
    console.log('✅ ClassStandard records for K12 class:', classStds);

    const sampleStds = await prisma.classStandard.findMany({
      where: { classId: k12.id },
      take: 3
    });
    console.log('Sample ClassStandard records:', sampleStds.length);
  }

  await prisma.$disconnect();
  process.exit(0);
})();
