import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
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

    const members = await prisma.learningCommunityMember.findMany({
      where: {
        communityId: community.id,
        status: 'active',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return NextResponse.json({ members, count: members.length });
  } catch (error) {
    console.error('Failed to fetch community members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community members' },
      { status: 500 }
    );
  }
}
