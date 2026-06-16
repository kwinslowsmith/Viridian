import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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

    // Only curator can reject
    if (community.curatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to reject join requests' },
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

    // Update join request to rejected
    const updated = await prisma.communityJoinRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        respondedAt: new Date(),
        respondedById: session.user.id,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ joinRequest: updated, message: 'Join request rejected' });
  } catch (error) {
    console.error('Failed to reject join request:', error);
    return NextResponse.json(
      { error: 'Failed to reject join request' },
      { status: 500 }
    );
  }
}
