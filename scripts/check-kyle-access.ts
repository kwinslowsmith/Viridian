import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  const orgRole = await prisma.organizationRole.findFirst({
    where: {
      userId: 'cmq9u1p6r0000ewic4nigvgib',
      organization: { slug: 'match-charter-high-school' }
    },
    include: { organization: true }
  });

  console.log('Kyle role in Match Charter:', orgRole?.role);

  const k12class = await prisma.k12Class.findUnique({
    where: { id: 'cmq9tzivi004w10ow0cvrzedp' },
    select: { instructorId: true }
  });

  console.log('AP US History instructor ID:', k12class?.instructorId);
  console.log('Is Kyle the instructor?', k12class?.instructorId === 'cmq9u1p6r0000ewic4nigvgib');

  await prisma.$disconnect();
  process.exit(0);
})();
