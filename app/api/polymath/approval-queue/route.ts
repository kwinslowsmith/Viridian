import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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
      const articles = await prisma.polymathArticle.findMany({
        where: {
          status: 'pending_approval',
          ...(organizationId && { organizationId }),
        },
        include: {
          
          
          
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      approvalQueue.articles = articles.map((article) => {
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
        include: {
          
          
          
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      approvalQueue.modules = modules.map((module) => {
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
        include: {
          
          
          
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      approvalQueue.tools = tools.map((tool) => {
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
        include: {
          
          
          
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      approvalQueue.collections = collections.map((collection) => {
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
