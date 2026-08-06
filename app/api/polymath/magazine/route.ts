import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getMagazineFromCache, setMagazineCache } from '@/lib/cache/magazine-cache';

const CONTENT_TRUNCATION_LENGTH = 300;

function truncateContent(content: string | null, maxLength: number = CONTENT_TRUNCATION_LENGTH): string | null {
  if (!content) return null;
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}

function getAuthorName(authorType: string, authorId: string): string {
  switch (authorType) {
    case 'individual':
      return 'Individual Contributor';
    case 'organization':
      return `Org: ${authorId}`;
    case 'community':
      return `Community: ${authorId}`;
    case 'event':
      return `Event: ${authorId}`;
    default:
      return 'Unknown';
  }
}

export async function GET(request: NextRequest) {
  try {
    const topic = request.nextUrl.searchParams.get('topic');
    const visibility = request.nextUrl.searchParams.get('visibility') || 'public';
    const cacheKey = `magazine:${visibility}:${topic || 'all'}`;

    // Check cache first
    const cached = await getMagazineFromCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        status: 200,
        headers: { 'X-Cache': 'HIT' },
      });
    }

    const whereClause: any = {
      status: 'published',
      visibility: {
        in: [visibility, 'public'],
      },
    };

    if (topic) {
      whereClause.topic = topic;
    }

    const [articles, tools, modules, collections] = await Promise.all([
      prisma.polymathArticle.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          abstract: true,
          content: true,
          coverImage: true,
          topic: true,
          tags: true,
          estimatedReadTime: true,
          authorType: true,
          authorId: true,
          publishedAt: true,
          createdAt: true,
        },
        orderBy: { publishedAt: 'desc' },
        take: 20,
      }),
      prisma.polymathTool.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          description: true,
          toolType: true,
          toolUrl: true,
          iframeUrl: true,
          thumbnail: true,
          difficulty: true,
          estimatedUsageTime: true,
          authorType: true,
          authorId: true,
          publishedAt: true,
          createdAt: true,
        },
        orderBy: { publishedAt: 'desc' },
        take: 20,
      }),
      prisma.polymathModule.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          description: true,
          difficulty: true,
          estimatedHours: true,
          lessonsJson: true,
          coverImage: true,
          topic: true,
          tags: true,
          authorType: true,
          authorId: true,
          publishedAt: true,
          createdAt: true,
        },
        orderBy: { publishedAt: 'desc' },
        take: 20,
      }),
      prisma.polymathResourceCollection.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          description: true,
          topic: true,
          tags: true,
          coverImage: true,
          authorType: true,
          authorId: true,
          publishedAt: true,
          createdAt: true,
        },
        orderBy: { publishedAt: 'desc' },
        take: 20,
      }),
    ]);

    // Transform articles with author info and truncated content
    const articlesWithAuthor = articles.map((a) => ({
      ...a,
      content: truncateContent(a.content),
      author: {
        id: a.authorId,
        name: getAuthorName(a.authorType, a.authorId),
        type: a.authorType,
      },
    }));

    // Transform tools with author info
    const toolsWithAuthor = tools.map((t) => ({
      ...t,
      author: {
        id: t.authorId,
        name: getAuthorName(t.authorType, t.authorId),
        type: t.authorType,
      },
    }));

    // Transform modules with author info
    const modulesWithAuthor = modules.map((m) => ({
      ...m,
      author: {
        id: m.authorId,
        name: getAuthorName(m.authorType, m.authorId),
        type: m.authorType,
      },
    }));

    // Transform collections with author info
    const collectionsWithAuthor = collections.map((c) => ({
      ...c,
      author: {
        id: c.authorId,
        name: getAuthorName(c.authorType, c.authorId),
        type: c.authorType,
      },
    }));

    const response = {
      articles: articlesWithAuthor,
      tools: toolsWithAuthor,
      modules: modulesWithAuthor,
      collections: collectionsWithAuthor,
    };

    // Set cache with 5-minute TTL
    await setMagazineCache(cacheKey, response, 300);

    return NextResponse.json(response, {
      status: 200,
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to fetch magazine content:', errorMsg);
    return NextResponse.json(
      { error: errorMsg, articles: [], tools: [], modules: [], collections: [] },
      { status: 500 }
    );
  }
}
