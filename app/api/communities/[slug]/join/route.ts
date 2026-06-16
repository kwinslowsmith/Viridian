import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug } = await params;

    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Check if already a member
    const existingMember = await prisma.learningCommunityMember.findFirst({
      where: {
        communityId: community.id,
        userId: session.user.id,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Already a member of this community' },
        { status: 400 }
      );
    }

    // Check if already has a pending request
    const existingRequest = await prisma.communityJoinRequest.findFirst({
      where: {
        communityId: community.id,
        userId: session.user.id,
        status: 'pending',
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending join request' },
        { status: 400 }
      );
    }

    // If community requires approval, create a join request
    if (community.requiresApprovalToJoin) {
      const joinRequest = await prisma.communityJoinRequest.create({
        data: {
          communityId: community.id,
          userId: session.user.id,
        },
        include: {
          community: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      });

      return NextResponse.json(
        { joinRequest, message: 'Join request sent. Awaiting curator approval.' },
        { status: 201 }
      );
    }

    // Otherwise, add user as member directly
    const member = await prisma.learningCommunityMember.create({
      data: {
        communityId: community.id,
        userId: session.user.id,
        role: 'member',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        community: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Failed to join community:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to join community' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug } = await params;

    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Mark member as 'left' instead of deleting
    const member = await prisma.learningCommunityMember.updateMany({
      where: {
        communityId: community.id,
        userId: session.user.id,
      },
      data: { status: 'left' },
    });

    if (member.count === 0) {
      return NextResponse.json(
        { error: 'You are not a member of this community' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Left community' });
  } catch (error) {
    console.error('Failed to leave community:', error);
    return NextResponse.json(
      { error: 'Failed to leave community' },
      { status: 500 }
    );
  }
}
