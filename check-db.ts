import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const communities = await prisma.learningCommunity.findMany();
    console.log('Communities:', communities.length, communities.map(c => ({ name: c.name, slug: c.slug })));

    const users = await prisma.user.findMany();
    console.log('Users:', users.length, users.map(u => ({ email: u.email, name: u.name })));

    const members = await prisma.learningCommunityMember.findMany();
    console.log('Members:', members.length);
  } finally {
    await prisma.$disconnect();
  }
}

main();
