import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addKyleToOrg() {
  try {
    // Find Kyle and Match Charter
    const kyle = await prisma.user.findUnique({
      where: { email: 'kwinslowsmith@gmail.com' },
    });

    const org = await prisma.organization.findUnique({
      where: { slug: 'match-charter-high-school' },
    });

    if (!kyle || !org) {
      console.error('❌ Kyle or organization not found');
      return;
    }

    // Add Kyle to the organization as SuperAdmin
    const role = await prisma.organizationRole.upsert({
      where: {
        userId_organizationId: {
          userId: kyle.id,
          organizationId: org.id,
        },
      },
      update: { role: 'superadmin' },
      create: {
        userId: kyle.id,
        organizationId: org.id,
        role: 'superadmin',
      },
    });

    console.log(`✅ Kyle added to Match Charter High School`);
    console.log(`📋 Role: ${role.role}`);
    console.log(`\nYou can now see Match Charter in your organizations at http://localhost:3000`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addKyleToOrg();
