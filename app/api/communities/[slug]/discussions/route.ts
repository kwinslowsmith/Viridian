import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/communities/[slug]/discussions
 * List all discussions in a community
 * Query params: limit, offset, sort ("recent" | "oldest" | "pinned")
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'recent';

    // Get community
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

    // Build where clause
    const where = {
      communityId: community.id,
      type: 'community',
    };

    // Build order by
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'pinned') {
      orderBy = [{ isPinned: 'desc' }, { createdAt: 'desc' }];
    }

    const [discussions, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          _count: { select: { messages: true, participants: true } },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true, content: true, sender: { select: { name: true } } },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.conversation.count({ where }),
    ]);

    return NextResponse.json({
      discussions,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Failed to fetch discussions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/communities/[slug]/discussions
 * Create a new discussion in the community
 */
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
    const { title, content } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Get community
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

    // Create discussion as a Conversation
    const discussion = await prisma.conversation.create({
      data: {
        type: 'community',
        communityId: community.id,
        title,
        createdById: session.user.id,
        participants: {
          create: {
            userId: session.user.id,
          },
        },
        messages: content ? {
          create: {
            content,
            senderId: session.user.id,
          },
        } : undefined,
        lastMessageAt: new Date(),
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { messages: true, participants: true } },
      },
    });

    return NextResponse.json(discussion, { status: 201 });
  } catch (error) {
    console.error('Failed to create discussion:', error);
    return NextResponse.json(
      { error: 'Failed to create discussion' },
      { status: 500 }
    );
  }
}
