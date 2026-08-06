import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const published = req.nextUrl.searchParams.get('published') === 'true';

    const community = await prisma.learningCommunity.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const whereClause: any = { communityId: community.id };
    if (published) {
      whereClause.status = 'published';
    }

    const tools = await prisma.polymathTool.findMany({
      where: whereClause,
      include: {polymath_tools_resources: {
          include: { resource: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json(tools, { status: 200 });
  } catch (error) {
    console.error('[GET /tools]', error);
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await req.json();
    const {
      name,
      description,
      toolType,
      toolUrl,
      iframeUrl,
      codeRepository,
      thumbnail,
      difficulty,
      estimatedUsageTime,
      languages,
      accessibilityFeatures,
    } = body;

    if (!name || !toolType) {
      return NextResponse.json(
        { error: 'Name and toolType are required' },
        { status: 400 }
      );
    }

    const community = await prisma.learningCommunity.findUnique({
      where: { slug },
      select: { id: true, curatorId: true },
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user || community.curatorId !== user.id) {
      return NextResponse.json(
        { error: 'Only community curator can create tools' },
        { status: 403 }
      );
    }

    const tool = await prisma.polymathTool.create({
      data: {
        communityId: community.id,
        authorId: user.id,
        name,
        description,
        toolType,
        toolUrl,
        iframeUrl,
        codeRepository,
        thumbnail,
        difficulty,
        estimatedUsageTime,
        languages,
        accessibilityFeatures,
        status: 'draft',
      },
      include: {},
    });

    return NextResponse.json(tool, { status: 201 });
  } catch (error) {
    console.error('[POST /tools]', error);
    return NextResponse.json(
      { error: 'Failed to create tool' },
      { status: 500 }
    );
  }
}
