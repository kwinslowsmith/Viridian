import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const requests = await prisma.communityJoinRequest.findMany({
      include: {
        community: { select: { name: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
    });

    console.log('Join Requests in DB:', requests.length);
    requests.forEach((r) => {
      console.log(`- ${r.user.name} (${r.user.email}) requested to join "${r.community.name}" - Status: ${r.status}`);
    });

    const communities = await prisma.learningCommunity.findMany({
      select: {
        name: true,
        slug: true,
        _count: { select: { joinRequests: true } },
      },
    });

    console.log('\nCommunities with join request counts:');
    communities.forEach((c) => {
      console.log(`- ${c.name}: ${c._count.joinRequests} requests`);
    });
  } finally {
    await prisma.$disconnect();
  }
}

main();
