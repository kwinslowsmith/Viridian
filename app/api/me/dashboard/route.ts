import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/me/dashboard
 * Get user's dashboard data (my communities, activity summary)
 */
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

    // Get curated communities
    const curatedCommunities = await prisma.learningCommunity.findMany({
      where: { curatorId: userId },
      include: {
        _count: { select: { members: true, conversations: true, resources: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get member communities
    const memberCommunities = await prisma.learningCommunity.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        curator: { select: { id: true, name: true } },
        _count: { select: { members: true, conversations: true, resources: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get recent discussions (in communities user is part of)
    const recentDiscussions = await prisma.conversation.findMany({
      where: {
        type: 'community',
        participants: {
          some: { userId },
        },
      },
      include: {
        community: { select: { id: true, name: true, slug: true } },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { lastMessageAt: 'desc' },
      take: 10,
    });

    // Get upcoming meetings
    const upcomingMeetings = await prisma.polymathMeeting.findMany({
      where: {
        community: {
          OR: [
            { curatorId: userId },
            {
              members: {
                some: { userId },
              },
            },
          ],
        },
        scheduledAt: { gte: new Date() },
      },
      include: {
        community: { select: { id: true, name: true, slug: true } },
        host: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    });

    // Get user stats
    const [discussionCount, messageCount] = await Promise.all([
      prisma.conversation.count({
        where: {
          type: 'community',
          createdById: userId,
        },
      }),
      prisma.message.count({
        where: {
          senderId: userId,
        },
      }),
    ]);

    return NextResponse.json({
      user: {
        id: userId,
        name: session.user.name,
        email: session.user.email,
      },
      stats: {
        curatedCommunities: curatedCommunities.length,
        memberCommunities: memberCommunities.length,
        discussionsCreated: discussionCount,
        messagesPosted: messageCount,
      },
      communities: {
        curated: curatedCommunities,
        member: memberCommunities,
      },
      activity: {
        recentDiscussions,
        upcomingMeetings,
      },
    });
  } catch (error) {
    console.error('Failed to fetch dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard' },
      { status: 500 }
    );
  }
}
