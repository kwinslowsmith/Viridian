import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/communities/[slug]/discussions/[discussionId]
 * Get a specific discussion with all messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; discussionId: string }> }
) {
  try {
    const { slug, discussionId } = await params;

    // Verify community exists
    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
      select: { id: true },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Get discussion
    const discussion = await prisma.conversation.findUnique({
      where: { id: discussionId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        participants: {
          select: {
            userId: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, name: true, email: true } },
          },
        },
        _count: { select: { messages: true, participants: true } },
      },
    });

    if (!discussion || discussion.communityId !== community.id) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(discussion);
  } catch (error) {
    console.error('Failed to fetch discussion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussion' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/communities/[slug]/discussions/[discussionId]
 * Update discussion (pin/unpin, update title)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; discussionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug, discussionId } = await params;
    const { isPinned, title } = await request.json();

    // Verify community exists
    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
      select: { id: true, curatorId: true },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Get discussion
    const discussion = await prisma.conversation.findUnique({
      where: { id: discussionId },
      select: { communityId: true, createdById: true },
    });

    if (!discussion || discussion.communityId !== community.id) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    // Only creator or curator can update
    if (discussion.createdById !== session.user.id && community.curatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this discussion' },
        { status: 403 }
      );
    }

    // Update discussion
    const updated = await prisma.conversation.update({
      where: { id: discussionId },
      data: {
        ...(isPinned !== undefined && { isPinned }),
        ...(title && { title }),
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { messages: true, participants: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update discussion:', error);
    return NextResponse.json(
      { error: 'Failed to update discussion' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/communities/[slug]/discussions/[discussionId]
 * Delete a discussion (creator or curator only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; discussionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug, discussionId } = await params;

    // Verify community exists
    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
      select: { id: true, curatorId: true },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Get discussion
    const discussion = await prisma.conversation.findUnique({
      where: { id: discussionId },
      select: { communityId: true, createdById: true },
    });

    if (!discussion || discussion.communityId !== community.id) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    // Only creator or curator can delete
    if (discussion.createdById !== session.user.id && community.curatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this discussion' },
        { status: 403 }
      );
    }

    // Delete discussion (cascade deletes messages)
    await prisma.conversation.delete({
      where: { id: discussionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete discussion:', error);
    return NextResponse.json(
      { error: 'Failed to delete discussion' },
      { status: 500 }
    );
  }
}
