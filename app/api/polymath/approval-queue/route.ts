import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

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

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = req.nextUrl.searchParams.get('organizationId');
    const contentType = req.nextUrl.searchParams.get('contentType'); // articles, modules, tools, collections
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');

    // Authorization: user must be org admin or content approver
    if (organizationId) {
      const orgRole = await prisma.organizationRole.findUnique({
        where: {
          userId_organizationId: {
            userId: session.user.id,
            organizationId,
          },
        },
      });

      if (!orgRole || !['SuperAdmin', 'SchoolAdmin'].includes(orgRole.role)) {
        return NextResponse.json(
          { error: 'You do not have permission to view this approval queue' },
          { status: 403 }
        );
      }
    }

    // Build results for each content type
    const approvalQueue: any = {
      articles: [],
      modules: [],
      tools: [],
      collections: [],
    };

    const contentTypes = contentType
      ? [contentType]
      : ['articles', 'modules', 'tools', 'collections'];

    // Query articles if included
    if (contentTypes.includes('articles')) {
      // First, fetch all pending articles for the organization (if specified)
      const articles = await prisma.polymathArticle.findMany({
        where: {
          status: 'pending_approval',
          ...(organizationId && { organizationId }),
        },
        orderBy: { createdAt: 'desc' },
      });

      // Filter to only articles where current user is in the approval chain
      const userArticles = articles
        .filter((article) => {
          const approvalChain = article.approvalChain
            ? JSON.parse(article.approvalChain)
            : [];
          return approvalChain.includes(session.user.id);
        })
        .slice(offset, offset + limit);

      approvalQueue.articles = userArticles.map((article) => {
        const approvalChain = article.approvalChain
          ? JSON.parse(article.approvalChain)
          : [];
        const originalChainLength = approvalChain.length;

        return {
          ...article,
          type: 'article',
          approvalChain,
          approvalProgress: {
            pending: originalChainLength,
            total: 0, // We'd need to store the original chain length separately
          },
        };
      });
    }

    // Query modules if included
    if (contentTypes.includes('modules')) {
      const modules = await prisma.polymathModule.findMany({
        where: {
          status: 'pending_approval',
          ...(organizationId && { organizationId }),
        },
        orderBy: { createdAt: 'desc' },
      });

      // Filter to only modules where current user is in the approval chain
      const userModules = modules
        .filter((module) => {
          const approvalChain = module.approvalChain
            ? JSON.parse(module.approvalChain)
            : [];
          return approvalChain.includes(session.user.id);
        })
        .slice(offset, offset + limit);

      approvalQueue.modules = userModules.map((module) => {
        const approvalChain = module.approvalChain
          ? JSON.parse(module.approvalChain)
          : [];

        return {
          ...module,
          type: 'module',
          approvalChain,
          approvalProgress: {
            pending: approvalChain.length,
            total: 0,
          },
        };
      });
    }

    // Query tools if included
    if (contentTypes.includes('tools')) {
      const tools = await prisma.polymathTool.findMany({
        where: {
          status: 'pending_approval',
          ...(organizationId && { organizationId }),
        },
        orderBy: { createdAt: 'desc' },
      });

      // Filter to only tools where current user is in the approval chain
      const userTools = tools
        .filter((tool) => {
          const approvalChain = tool.approvalChain
            ? JSON.parse(tool.approvalChain)
            : [];
          return approvalChain.includes(session.user.id);
        })
        .slice(offset, offset + limit);

      approvalQueue.tools = userTools.map((tool) => {
        const approvalChain = tool.approvalChain
          ? JSON.parse(tool.approvalChain)
          : [];

        return {
          ...tool,
          type: 'tool',
          approvalChain,
          approvalProgress: {
            pending: approvalChain.length,
            total: 0,
          },
        };
      });
    }

    // Query collections if included
    if (contentTypes.includes('collections')) {
      const collections = await prisma.polymathResourceCollection.findMany({
        where: {
          status: 'pending_approval',
          ...(organizationId && { organizationId }),
        },
        orderBy: { createdAt: 'desc' },
      });

      // Filter to only collections where current user is in the approval chain
      const userCollections = collections
        .filter((collection) => {
          const approvalChain = collection.approvalChain
            ? JSON.parse(collection.approvalChain)
            : [];
          return approvalChain.includes(session.user.id);
        })
        .slice(offset, offset + limit);

      approvalQueue.collections = userCollections.map((collection) => {
        const approvalChain = collection.approvalChain
          ? JSON.parse(collection.approvalChain)
          : [];

        return {
          ...collection,
          type: 'collection',
          approvalChain,
          approvalProgress: {
            pending: approvalChain.length,
            total: 0,
          },
        };
      });
    }

    // Flatten and return combined results if requesting specific type, otherwise return by type
    if (contentType) {
      const allPending = [
        ...approvalQueue.articles,
        ...approvalQueue.modules,
        ...approvalQueue.tools,
        ...approvalQueue.collections,
      ];
      return NextResponse.json(
        { queue: allPending, count: allPending.length },
        { status: 200 }
      );
    }

    return NextResponse.json(approvalQueue, { status: 200 });
  } catch (error: any) {
    console.error('[GET /api/polymath/approval-queue]', error);
    return NextResponse.json(
      { error: 'Failed to fetch approval queue', details: error?.message },
      { status: 500 }
    );
  }
}
