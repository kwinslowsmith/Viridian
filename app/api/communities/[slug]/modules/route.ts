import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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

    const modules = await prisma.learningModule.findMany({
      where: { communityId: community.id },
      orderBy: { sequenceNum: 'asc' },
    });

    return NextResponse.json({ modules, count: modules.length });
  } catch (error) {
    console.error('Failed to fetch modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}

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
    const { title, description, estimatedHours } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Only curator can add modules
    if (community.curatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to add modules to this community' },
        { status: 403 }
      );
    }

    // Get the next sequence number
    const lastModule = await prisma.learningModule.findFirst({
      where: { communityId: community.id },
      orderBy: { sequenceNum: 'desc' },
    });

    const sequenceNum = (lastModule?.sequenceNum || 0) + 1;

    const module = await prisma.learningModule.create({
      data: {
        communityId: community.id,
        title,
        description,
        sequenceNum,
        estimatedHours,
      },
    });

    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    console.error('Failed to create module:', error);
    return NextResponse.json(
      { error: 'Failed to create module' },
      { status: 500 }
    );
  }
}
