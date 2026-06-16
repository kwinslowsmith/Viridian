import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get all organizations the user is in
    const userOrganizations = await prisma.organizationRole.findMany({
      where: { userId },
      select: { organizationId: true },
    });

    const orgIds = userOrganizations.map((o) => o.organizationId);

    // Get all communities the user is in
    const userCommunities = await prisma.learningCommunityMember.findMany({
      where: { userId },
      select: { communityId: true },
    });

    const communityIds = userCommunities.map((c) => c.communityId);

    // Get all events across orgs and communities
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { organizationId: { in: orgIds } },
          { communityId: { in: communityIds } },
        ],
        status: { not: 'cancelled' },
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { rsvps: true } },
      },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
