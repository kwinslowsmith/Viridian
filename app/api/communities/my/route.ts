import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const communities = await prisma.learningCommunity.findMany({
      where: {
        curatorId: session.user.id,
      },
      include: {
        curator: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
        _count: { select: { members: true, modules: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ communities });
  } catch (error) {
    console.error('Failed to fetch curator communities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}
