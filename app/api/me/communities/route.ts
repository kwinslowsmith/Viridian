import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const members = await prisma.learningCommunityMember.findMany({
      where: {
        userId: session.user.id,
        status: { in: ['active', 'pending'] },
      },
      select: {
        communityId: true,
        status: true,
      },
    });

    const communityIds = members.map((m) => m.communityId);

    const communities = await prisma.learningCommunity.findMany({
      where: {
        id: { in: communityIds },
      },
      include: {
        curator: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
        modules: {
          orderBy: { sequenceNum: 'asc' },
          select: { id: true, title: true, description: true, sequenceNum: true, estimatedHours: true },
        },
        _count: { select: { members: true, modules: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const memberMap = new Map(members.map((m) => [m.communityId, m.status]));
    const communitiesWithStatus = communities.map((community) => ({
      ...community,
      status: memberMap.get(community.id) || 'pending',
    }));

    return NextResponse.json({ communities: communitiesWithStatus });
  } catch (error) {
    console.error('Failed to fetch user communities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}
