import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    let session = await getServerSession(authOptions);
    let isTestMode = false;

    // Dev mode: allow test user ID header
    if (!session?.user?.id && process.env.NODE_ENV === 'development') {
      const testUserId = req.headers.get('X-Test-User-Id');
      if (testUserId) {
        session = { user: { id: testUserId } } as any;
        isTestMode = true;
      }
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      content,
      abstract,
      topic,
      tags,
      coverImage,
      authorType = 'individual', // "individual" | "organization" | "community" | "event"
      authorId, // userId | organizationId | communityId | eventId
      organizationId,
      communityId,
      eventId,
      visibility = 'public', // "public" | "organization" | "community" | "event" | "private"
      tier = 'standard', // "standard" | "premium"
    } = body;

    // Convert tags array to comma-separated string if needed
    let tagsString = null;
    if (tags) {
      tagsString = Array.isArray(tags) ? tags.join(',') : tags;
    }

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content' },
        { status: 400 }
      );
    }

    if (!authorType || !authorId) {
      return NextResponse.json(
        { error: 'Missing required fields: authorType, authorId' },
        { status: 400 }
      );
    }

    // Validate and check permissions based on authorType
    let requiresApproval = false;
    let approvalChain: string[] = [];

    if (authorType === 'individual') {
      // Individual posts: user must be posting as themselves
      if (authorId !== session.user.id) {
        return NextResponse.json(
          { error: 'Cannot post on behalf of another user' },
          { status: 403 }
        );
      }
      // Individual posts don't need approval
      requiresApproval = false;
    } else if (authorType === 'organization') {
      // Organization posts: user must be org admin
      if (!organizationId || organizationId !== authorId) {
        return NextResponse.json(
          { error: 'Invalid organizationId for organization post' },
          { status: 400 }
        );
      }

      if (!isTestMode) {
        const orgRole = await prisma.organizationRole.findUnique({
          where: {
            userId_organizationId: {
              userId: session.user.id,
              organizationId: authorId,
            },
          },
        });

        if (!orgRole || !['SuperAdmin', 'SchoolAdmin'].includes(orgRole.role)) {
          return NextResponse.json(
            { error: 'You do not have permission to post as this organization' },
            { status: 403 }
          );
        }
      }

      // Organization posts require approval from org admins
      requiresApproval = true;
      // Allow overriding approval chain in test mode
      if (isTestMode && body.approvalChain) {
        approvalChain = typeof body.approvalChain === 'string' ? JSON.parse(body.approvalChain) : body.approvalChain;
      } else {
        const orgAdmins = await prisma.organizationRole.findMany({
          where: {
            organizationId: authorId,
            role: { in: ['SuperAdmin', 'SchoolAdmin'] },
          },
          select: { userId: true },
        });
        approvalChain = orgAdmins.map((a) => a.userId);
      }
    } else if (authorType === 'community') {
      // Community posts: user must be curator or moderator
      if (!communityId || communityId !== authorId) {
        return NextResponse.json(
          { error: 'Invalid communityId for community post' },
          { status: 400 }
        );
      }

      const communityMember = await prisma.learningCommunityMember.findUnique({
        where: {
          communityId_userId: {
            communityId: authorId,
            userId: session.user.id,
          },
        },
      });

      if (!communityMember || !['curator', 'moderator'].includes(communityMember.role)) {
        return NextResponse.json(
          { error: 'You do not have permission to post as this community' },
          { status: 403 }
        );
      }

      // Community posts require approval from curator
      requiresApproval = true;
      const community = await prisma.learningCommunity.findUnique({
        where: { id: authorId },
        select: { curatorId: true },
      });
      approvalChain = community?.curatorId ? [community.curatorId] : [];
    } else if (authorType === 'event') {
      // Event posts: user must be event creator
      if (!eventId || eventId !== authorId) {
        return NextResponse.json(
          { error: 'Invalid eventId for event post' },
          { status: 400 }
        );
      }

      const event = await prisma.event.findUnique({
        where: { id: authorId },
        select: { createdById: true },
      });

      if (!event || event.createdById !== session.user.id) {
        return NextResponse.json(
          { error: 'You do not have permission to post as this event' },
          { status: 403 }
        );
      }

      // Event posts require approval from event creator
      requiresApproval = true;
      approvalChain = [event.createdById];
    } else {
      return NextResponse.json(
        { error: 'Invalid authorType' },
        { status: 400 }
      );
    }

    // Validate visibility if posting to a specific context
    if ((authorType === 'community' || authorType === 'event') && visibility === 'public') {
      return NextResponse.json(
        { error: 'Community and event articles cannot be public' },
        { status: 400 }
      );
    }

    // Create article with approval chain
    const article = await prisma.polymathArticle.create({
      data: {
        title,
        content,
        abstract: abstract || null,
        topic: topic || null,
        tags: tagsString || null,
        coverImage: coverImage || null,
        authorType,
        authorId,
        organizationId: organizationId || null,
        communityId: communityId || null,
        eventId: eventId || null,
        visibility,
        requiresApproval,
        status: requiresApproval ? 'pending_approval' : 'published',
        approvalChain: requiresApproval ? JSON.stringify(approvalChain) : null,
        publishedAt: requiresApproval ? null : new Date(),
      },
    });

    return NextResponse.json(
      {
        ...article,
        approvalChain: article.approvalChain ? JSON.parse(article.approvalChain) : [],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/polymath/articles]', error);
    return NextResponse.json(
      { error: 'Failed to create article', details: error?.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    let session = await getServerSession(authOptions);

    // Dev mode: allow test user ID header
    if (!session?.user?.id && process.env.NODE_ENV === 'development') {
      const testUserId = req.headers.get('X-Test-User-Id');
      if (testUserId) {
        session = { user: { id: testUserId } } as any;
      }
    }

    const userId = session?.user?.id;

    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');
    const authorType = req.nextUrl.searchParams.get('authorType');
    const status = req.nextUrl.searchParams.get('status');
    const visibility = req.nextUrl.searchParams.get('visibility');
    const communityId = req.nextUrl.searchParams.get('communityId');
    const organizationId = req.nextUrl.searchParams.get('organizationId');

    let whereClause: any = {};

    // Add filters if provided
    if (authorType) whereClause.authorType = authorType;
    if (status) whereClause.status = status;
    if (visibility) whereClause.visibility = visibility;
    if (communityId) whereClause.communityId = communityId;
    if (organizationId) whereClause.organizationId = organizationId;

    // If user is not logged in, only show published articles
    if (!userId) {
      whereClause.status = 'published';
      whereClause.visibility = 'public';
    } else {
      // If user is logged in, apply visibility rules
      if (!status) {
        // Default to showing published articles for non-admin users
        // But allow filtering by status if explicitly requested
        whereClause.OR = [
          { status: 'published' },
          // User sees pending_approval articles if they're in the approval chain or are the creator
          {
            AND: [
              { status: 'pending_approval' },
              { authorId: userId },
            ],
          },
        ];
      }
    }

    const articles = await prisma.polymathArticle.findMany({
      where: whereClause,
      include: {
        
        
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Parse approval chains
    const parsedArticles = articles.map((article) => ({
      ...article,
      approvalChain: article.approvalChain ? JSON.parse(article.approvalChain) : [],
    }));

    return NextResponse.json(
      { articles: parsedArticles, count: parsedArticles.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[GET /api/polymath/articles]', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles', details: error?.message },
      { status: 500 }
    );
  }
}
