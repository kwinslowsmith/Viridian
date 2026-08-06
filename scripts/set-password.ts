import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setPassword() {
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.update({
    where: { email: 'kwinslowsmith@gmail.com' },
    data: { passwordHash },
  });

  console.log(`✅ Password set for ${user.email}`);
  console.log(`\n🔑 Login credentials:`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Password: ${password}`);
  console.log(`\n🌐 http://localhost:3000`);

  await prisma.$disconnect();
}

setPassword().catch(e => {
  console.error('❌ Error:', e);
  process.exit(1);
});
