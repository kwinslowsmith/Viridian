import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; requestId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug, requestId } = await params;

    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Only curator can approve
    if (community.curatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to approve join requests' },
        { status: 403 }
      );
    }

    const joinRequest = await prisma.communityJoinRequest.findUnique({
      where: { id: requestId },
    });

    if (!joinRequest) {
      return NextResponse.json(
        { error: 'Join request not found' },
        { status: 404 }
      );
    }

    if (joinRequest.communityId !== community.id) {
      return NextResponse.json(
        { error: 'Join request does not belong to this community' },
        { status: 400 }
      );
    }

    if (joinRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Join request has already been processed' },
        { status: 400 }
      );
    }

    // Update join request to approved
    await prisma.communityJoinRequest.update({
      where: { id: requestId },
      data: {
        status: 'approved',
        respondedAt: new Date(),
        respondedById: session.user.id,
      },
    });

    // Add user as member
    const member = await prisma.learningCommunityMember.create({
      data: {
        communityId: community.id,
        userId: joinRequest.userId,
        role: 'member',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ member, message: 'Join request approved' });
  } catch (error) {
    console.error('Failed to approve join request:', error);
    return NextResponse.json(
      { error: 'Failed to approve join request' },
      { status: 500 }
    );
  }
}
