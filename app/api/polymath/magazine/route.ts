import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const contentType = req.nextUrl.searchParams.get('type'); // articles, tools, modules, collections, or null for all
    const topic = req.nextUrl.searchParams.get('topic');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');

    const publishedFilter = { status: 'published' };
    const topicFilter = topic ? { topic } : {};

    let articles = [];
    let tools = [];
    let modules = [];
    let collections = [];

    // Fetch articles
    if (!contentType || contentType === 'articles') {
      articles = await prisma.polymathArticle.findMany({
        where: { ...publishedFilter, ...topicFilter },
        include: {
          community: { select: { id: true, slug: true, name: true } },
          author: { select: { id: true, name: true, email: true } },
          polymath_articles_resources: {
            include: { resource: true },
            orderBy: { sequenceNum: 'asc' },
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: offset,
      });
    }

    // Fetch tools
    if (!contentType || contentType === 'tools') {
      tools = await prisma.polymathTool.findMany({
        where: { ...publishedFilter, ...topicFilter },
        include: {
          community: { select: { id: true, slug: true, name: true } },
          author: { select: { id: true, name: true, email: true } },
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: offset,
      });
    }

    // Fetch modules
    if (!contentType || contentType === 'modules') {
      modules = await prisma.polymathModule.findMany({
        where: { ...publishedFilter, ...topicFilter },
        include: {
          community: { select: { id: true, slug: true, name: true } },
          author: { select: { id: true, name: true, email: true } },
          polymath_modules_resources: {
            include: { resource: true },
            orderBy: { sequenceNum: 'asc' },
          },
        },
        orderBy: { sequenceNum: 'asc' },
        take: limit,
        skip: offset,
      });
    }

    // Fetch collections
    if (!contentType || contentType === 'collections') {
      collections = await prisma.polymathResourceCollection.findMany({
        where: { ...publishedFilter, ...topicFilter },
        include: {
          community: { select: { id: true, slug: true, name: true } },
          author: { select: { id: true, name: true, email: true } },
          resources: {
            include: { resource: true },
            orderBy: { sequenceNum: 'asc' },
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: offset,
      });
    }

    // Combine and format response
    const feed = {
      articles: articles.map((a) => ({
        id: a.id,
        type: 'article',
        title: a.title,
        abstract: a.abstract,
        community: a.community,
        author: a.author,
        publishedAt: a.publishedAt,
        topic: a.topic,
        tags: a.tags,
        estimatedReadTime: a.estimatedReadTime,
        coverImage: a.coverImage,
        resources: a.polymath_articles_resources,
      })),
      tools: tools.map((t) => ({
        id: t.id,
        type: 'tool',
        name: t.name,
        description: t.description,
        community: t.community,
        author: t.author,
        publishedAt: t.publishedAt,
        toolType: t.toolType,
        toolUrl: t.toolUrl,
        iframeUrl: t.iframeUrl,
        thumbnail: t.thumbnail,
        difficulty: t.difficulty,
        estimatedUsageTime: t.estimatedUsageTime,
        languages: t.languages,
        accessibilityFeatures: t.accessibilityFeatures,
      })),
      modules: modules.map((m) => ({
        id: m.id,
        type: 'module',
        title: m.title,
        description: m.description,
        community: m.community,
        author: m.author,
        publishedAt: m.publishedAt,
        topic: m.topic,
        tags: m.tags,
        difficulty: m.difficulty,
        estimatedHours: m.estimatedHours,
        lessons: m.lessonsJson ? JSON.parse(m.lessonsJson) : [],
        coverImage: m.coverImage,
        resources: m.polymath_modules_resources,
      })),
      collections: collections.map((c) => ({
        id: c.id,
        type: 'collection',
        name: c.name,
        description: c.description,
        community: c.community,
        author: c.author,
        publishedAt: c.publishedAt,
        topic: c.topic,
        tags: c.tags,
        coverImage: c.coverImage,
        resources: c.resources.map((r) => r.resource),
      })),
    };

    return NextResponse.json(feed, { status: 200 });
  } catch (error) {
    console.error('[GET /polymath/magazine]', error);
    return NextResponse.json(
      { error: 'Failed to fetch magazine feed' },
      { status: 500 }
    );
  }
}
