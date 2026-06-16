const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {
      passwordHash: '$2b$10$tL6ifusYSb178k0Z4./7qur40u5NFpIT4tEDS/48mUr1cyGSnHz0O',
      emailVerified: true,
    },
    create: {
      email: 'test@example.com',
      name: 'Test Super Admin',
      passwordHash: '$2b$10$tL6ifusYSb178k0Z4./7qur40u5NFpIT4tEDS/48mUr1cyGSnHz0O',
      emailVerified: true,
    },
  });

  console.log('✅ Created user:', user.email);

  // Get or create default organization
  const defaultOrg = await prisma.organization.findFirst({
    where: { name: 'Default Organization' },
  });

  if (!defaultOrg) {
    console.log('❌ Default Organization not found');
    return;
  }

  // Create SuperAdmin role
  const role = await prisma.organizationRole.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: defaultOrg.id,
      },
    },
    update: { role: 'SuperAdmin' },
    create: {
      userId: user.id,
      organizationId: defaultOrg.id,
      role: 'SuperAdmin',
    },
  });

  console.log('✅ Assigned SuperAdmin role for:', defaultOrg.name);
  console.log('\n📝 Login Details:');
  console.log('   Email: test@example.com');
  console.log('   Password: password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
