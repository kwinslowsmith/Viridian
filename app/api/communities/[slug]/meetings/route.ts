import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/communities/[slug]/meetings
 * List all meetings in a community
 * Query params: limit, offset, sort ("upcoming" | "past")
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
    const sort = searchParams.get('sort') || 'upcoming';

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

    // Build order by
    const orderBy: any = sort === 'past'
      ? { scheduledAt: 'desc' as const }
      : { scheduledAt: 'asc' as const };

    // Build where clause
    const where: any = {
      communityId: community.id,
    };

    if (sort === 'upcoming') {
      where.scheduledAt = { gte: new Date() };
    } else if (sort === 'past') {
      where.scheduledAt = { lt: new Date() };
    }

    const [meetings, total] = await Promise.all([
      prisma.polymathMeeting.findMany({
        where,
        include: {
          host: { select: { id: true, name: true, email: true } },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.polymathMeeting.count({ where }),
    ]);

    return NextResponse.json({
      meetings,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Failed to fetch meetings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/communities/[slug]/meetings
 * Create a new meeting (curator only)
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
    const { title, description, scheduledAt, zoomUrl, location } = await request.json();

    if (!title || !scheduledAt) {
      return NextResponse.json(
        { error: 'Title and scheduledAt are required' },
        { status: 400 }
      );
    }

    // Get community
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

    // Only curator can create meetings
    if (community.curatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the curator can schedule meetings' },
        { status: 403 }
      );
    }

    // Create meeting
    const meeting = await prisma.polymathMeeting.create({
      data: {
        communityId: community.id,
        title,
        description: description || undefined,
        scheduledAt: new Date(scheduledAt),
        zoomUrl: zoomUrl || undefined,
        location: location || undefined,
        hostId: session.user.id,
      },
      include: {
        host: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('Failed to create meeting:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}
