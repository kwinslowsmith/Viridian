const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' },
    include: { organizationRoles: true }
  });

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  console.log('✅ User found:');
  console.log('  Email:', user.email);
  console.log('  Name:', user.name);
  console.log('  emailVerified:', user.emailVerified);
  console.log('  passwordHash:', user.passwordHash ? '✅ Set' : '❌ Missing');
  console.log('  Roles:', user.organizationRoles);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
