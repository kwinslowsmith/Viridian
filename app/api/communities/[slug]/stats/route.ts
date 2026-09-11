import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/communities/[slug]/stats
 * Get curator dashboard stats (member count, activity, contributions)
 */
export async function GET(
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

    // Get community
    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
      select: { id: true, curatorId: true, name: true },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Only curator can view stats
    if (community.curatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to view these stats' },
        { status: 403 }
      );
    }

    // Get all stats
    const [
      memberCount,
      discussionCount,
      messageCount,
      resourceCount,
      meetingCount,
      upcomingMeetingCount,
    ] = await Promise.all([
      prisma.learningCommunityMember.count({
        where: { communityId: community.id },
      }),
      prisma.conversation.count({
        where: {
          communityId: community.id,
          type: 'community',
        },
      }),
      prisma.message.count({
        where: {
          conversation: {
            communityId: community.id,
            type: 'community',
          },
        },
      }),
      prisma.resource.count({
        where: {
          communityId: community.id,
          visibility: 'community',
        },
      }),
      prisma.polymathMeeting.count({
        where: { communityId: community.id },
      }),
      prisma.polymathMeeting.count({
        where: {
          communityId: community.id,
          scheduledAt: { gte: new Date() },
        },
      }),
    ]);

    // Get recent members (last 10)
    const recentMembers = await prisma.learningCommunityMember.findMany({
      where: { communityId: community.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { joinedAt: 'desc' },
      take: 10,
    });

    // Get recent discussions (last 10)
    const recentDiscussions = await prisma.conversation.findMany({
      where: {
        communityId: community.id,
        type: 'community',
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { lastMessageAt: 'desc' },
      take: 10,
    });

    // Get top contributors (by messages)
    const topContributors = await prisma.message.groupBy({
      by: ['senderId'],
      where: {
        conversation: {
          communityId: community.id,
          type: 'community',
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Get contributor details
    const contributorIds = topContributors.map(c => c.senderId);
    const contributors = await prisma.user.findMany({
      where: { id: { in: contributorIds } },
      select: { id: true, name: true, email: true },
    });

    const contributorsWithCounts = topContributors.map(tc => ({
      user: contributors.find(c => c.id === tc.senderId),
      messageCount: tc._count.id,
    }));

    // Get engagement over time (this month and last month)
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [thisMonthMessages, lastMonthMessages] = await Promise.all([
      prisma.message.count({
        where: {
          conversation: {
            communityId: community.id,
            type: 'community',
          },
          createdAt: {
            gte: firstDayThisMonth,
            lt: firstDayNextMonth,
          },
        },
      }),
      prisma.message.count({
        where: {
          conversation: {
            communityId: community.id,
            type: 'community',
          },
          createdAt: {
            gte: firstDayLastMonth,
            lt: firstDayThisMonth,
          },
        },
      }),
    ]);

    return NextResponse.json({
      community: {
        id: community.id,
        name: community.name,
        slug,
      },
      stats: {
        memberCount,
        discussionCount,
        messageCount,
        resourceCount,
        meetingCount,
        upcomingMeetingCount,
      },
      engagement: {
        thisMonthMessages,
        lastMonthMessages,
        growth: lastMonthMessages > 0
          ? (((thisMonthMessages - lastMonthMessages) / lastMonthMessages) * 100).toFixed(1)
          : 'N/A',
      },
      recentMembers,
      recentDiscussions,
      topContributors: contributorsWithCounts,
    });
  } catch (error) {
    console.error('Failed to fetch curator stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch curator stats' },
      { status: 500 }
    );
  }
}
