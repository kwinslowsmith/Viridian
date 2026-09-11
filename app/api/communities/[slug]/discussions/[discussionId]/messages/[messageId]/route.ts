import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * DELETE /api/communities/[slug]/discussions/[discussionId]/messages/[messageId]
 * Delete a message (author or curator only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; discussionId: string; messageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug, discussionId, messageId } = await params;

    // Verify community exists and get curator info
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

    // Verify discussion exists and belongs to community
    const discussion = await prisma.conversation.findUnique({
      where: { id: discussionId },
      select: { communityId: true },
    });

    if (!discussion || discussion.communityId !== community.id) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    // Get message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { conversationId: true, senderId: true },
    });

    if (!message || message.conversationId !== discussionId) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Only author or curator can delete
    if (message.senderId !== session.user.id && community.curatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this message' },
        { status: 403 }
      );
    }

    // Delete message
    await prisma.message.delete({
      where: { id: messageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
