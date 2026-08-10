import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const classes = await prisma.k12Class.findMany({
    take: 2,
    select: { id: true, name: true, instructorId: true }
  });
  console.log(JSON.stringify(classes, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
