import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  const user = await prisma.user.findUnique({
    where: { email: 'kwinslowsmith@gmail.com' },
    select: { id: true, email: true }
  });

  console.log('Kyle user ID:', user?.id);

  await prisma.$disconnect();
  process.exit(0);
})();
