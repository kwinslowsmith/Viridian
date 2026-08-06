import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixKyleRole() {
  const user = await prisma.user.update({
    where: { email: 'kwinslowsmith@gmail.com' },
    data: { role: 'admin' },
  });
  console.log('✅ Updated Kyle role to admin');
  console.log('📋 User:', user.email, 'Role:', user.role);
  await prisma.$disconnect();
}

fixKyleRole();
