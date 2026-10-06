import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Polymath test communities...');

  try {
    // Create or get test curator user
    const curatorPassword = await bcrypt.hash('password123', 10);
    let curator = await prisma.user.findUnique({
      where: { email: 'curator@example.com' },
    });

    if (!curator) {
      console.log('Creating test curator user...');
      curator = await prisma.user.create({
        data: {
          email: 'curator@example.com',
          name: 'Test Curator',
          role: 'instructor',
          passwordHash: curatorPassword,
        },
      });
    }

    console.log(`Using curator: ${curator.name} (${curator.email})`);

    // Create test communities
    const communities = [
      {
        name: 'Boston K-8 Curriculum Collective',
        slug: 'boston-k8-curriculum',
        description: 'A collaborative space for Boston K-8 teachers to design and share curricula aligned with district standards.',
        scope: 'global' as const,
        topic: 'curriculum-design',
        isPublic: true,
      },
      {
        name: 'High School STEM Educators Network',
        slug: 'hs-stem-network',
        description: 'Network for high school STEM teachers to collaborate on project-based learning and hands-on experiments.',
        scope: 'global' as const,
        topic: 'stem-education',
        isPublic: true,
      },
      {
        name: 'ELA Teachers Cooperative',
        slug: 'ela-teachers-coop',
        description: 'English Language Arts teachers sharing strategies for literacy instruction and student engagement.',
        scope: 'global' as const,
        topic: 'language-arts',
        isPublic: true,
      },
    ];

    console.log('Creating test communities...');
    for (const communityData of communities) {
      try {
        const existing = await prisma.learningCommunity.findUnique({
          where: { slug: communityData.slug },
        });

        if (existing) {
          console.log(`✓ Community already exists: ${existing.name}`);
        } else {
          const community = await prisma.learningCommunity.create({
            data: {
              ...communityData,
              curatorId: curator.id,
              status: 'active',
              approvedAt: new Date(),
              approvedById: curator.id,
            },
          });
          console.log(`✓ Created community: ${community.name}`);

          // Add curator as a member
          await prisma.learningCommunityMember.create({
            data: {
              communityId: community.id,
              userId: curator.id,
              role: 'curator',
              joinedAt: new Date(),
            },
          });
        }
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`✓ Community already exists (duplicate key): ${communityData.slug}`);
        } else {
          console.error(`✗ Failed to create community ${communityData.slug}:`, error.message);
        }
      }
    }

    console.log('\n✅ Polymath test data seeding complete!');
    console.log('\nTest communities created:');
    const allCommunities = await prisma.learningCommunity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    allCommunities.forEach((c) => {
      console.log(`  - ${c.name} (${c.slug})`);
    });
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
