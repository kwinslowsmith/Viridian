import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/communities/[slug]/discussions/[discussionId]/messages
 * Get all messages in a discussion thread
 * Query params: limit, offset
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; discussionId: string }> }
) {
  try {
    const { slug, discussionId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');

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

    // Get messages
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId: discussionId },
        include: {
          sender: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.message.count({ where: { conversationId: discussionId } }),
    ]);

    return NextResponse.json({
      messages,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/communities/[slug]/discussions/[discussionId]/messages
 * Add a message to a discussion thread
 */
export async function POST(
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
    const { content, googleDocUrl } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

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

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: discussionId,
        senderId: session.user.id,
        content,
        googleDocUrl: googleDocUrl || undefined,
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
    });

    // Update conversation's lastMessageAt
    await prisma.conversation.update({
      where: { id: discussionId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Failed to create message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
