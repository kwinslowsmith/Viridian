import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
      select: { id: true, organizationId: true },
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const resources = await prisma.resource.findMany({
      where: {
        AND: [
          { communityId: community.id },
          { visibility: 'community' },
        ],
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Failed to fetch community resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community resources' },
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
      select: { id: true, curatorId: true, organizationId: true },
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Only curator can create community resources
    if (community.curatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the curator can create community resources' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      url,
      fileKey,
      fileName,
      fileSize,
      mimeType,
      type,
      format,
      tags,
      skillIds = [],
      objectiveIds = [],
    } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      );
    }

    const resourceData: any = {
      title,
      description,
      url,
      fileKey,
      fileName,
      fileSize,
      mimeType,
      type,
      format,
      tags,
      visibility: 'community',
      createdById: session.user.id,
      communityId: community.id,
      skills: {
        create: skillIds.map((skillId: string) => ({
          skillId,
        })),
      },
      objectives: {
        create: objectiveIds.map((objectiveId: string) => ({
          objectiveId,
        })),
      },
    };

    if (community.organizationId) {
      resourceData.organizationId = community.organizationId;
    }

    const resource = await prisma.resource.create({
      data: resourceData,
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    console.error('Failed to create community resource:', error);
    return NextResponse.json(
      { error: 'Failed to create community resource' },
      { status: 500 }
    );
  }
}
