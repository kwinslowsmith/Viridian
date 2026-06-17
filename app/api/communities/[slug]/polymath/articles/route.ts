import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const published = req.nextUrl.searchParams.get('published') === 'true';

    const community = await prisma.learningCommunity.findUnique({
      where: { slug },
      select: { id: true, curatorId: true },
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const whereClause: any = { communityId: community.id };
    if (published) {
      whereClause.status = 'published';
    }

    const articles = await prisma.polymathArticle.findMany({
      where: whereClause,
      include: {
        author: { select: { id: true, name: true, email: true } },
        polymath_articles_resources: {
          include: { resource: true },
          orderBy: { sequenceNum: 'asc' },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json(articles, { status: 200 });
  } catch (error) {
    console.error('[GET /articles]', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = params;
    const body = await req.json();
    const { title, abstract, content, topic, tags, estimatedReadTime, coverImage } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
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

    // Check if user is curator
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user || community.curatorId !== user.id) {
      return NextResponse.json(
        { error: 'Only community curator can create articles' },
        { status: 403 }
      );
    }

    const article = await prisma.polymathArticle.create({
      data: {
        communityId: community.id,
        authorId: user.id,
        title,
        abstract,
        content,
        topic,
        tags,
        estimatedReadTime,
        coverImage,
        status: 'draft',
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('[POST /articles]', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
