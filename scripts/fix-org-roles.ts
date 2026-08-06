import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixOrgRoles() {
  try {
    // Update Kyle's roles to SuperAdmin (capitalized)
    const kyle = await prisma.user.findUnique({
      where: { email: 'kwinslowsmith@gmail.com' },
    });

    if (!kyle) {
      console.error('❌ Kyle not found');
      return;
    }

    const updated = await prisma.organizationRole.updateMany({
      where: { userId: kyle.id },
      data: { role: 'SuperAdmin' },
    });

    console.log(`✅ Updated ${updated.count} organization roles to SuperAdmin`);
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixOrgRoles();
