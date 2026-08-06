import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { invalidateMagazineCache } from '@/lib/cache/magazine-cache';

interface RejectBody {
  feedback?: string;
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
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

    const { id } = params;
    const body: RejectBody = await req.json();
    const { feedback } = body;

    // Get the article
    const article = await prisma.polymathArticle.findUnique({
      where: { id },
      include: {
        
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check if article is in pending approval status
    if (article.status !== 'pending_approval') {
      return NextResponse.json(
        { error: `Article is not pending approval. Current status: ${article.status}` },
        { status: 400 }
      );
    }

    // Authorization: must be in approval chain or be the creator
    const approvalChain = article.approvalChain
      ? JSON.parse(article.approvalChain)
      : [];

    const isApprover = approvalChain.includes(session.user.id);
    const isCreator = article.authorId === session.user.id;

    if (!isApprover && !isCreator) {
      return NextResponse.json(
        { error: 'You do not have permission to reject this article' },
        { status: 403 }
      );
    }

    // Reject article and store feedback
    const updatedArticle = await prisma.polymathArticle.update({
      where: { id },
      data: {
        status: 'rejected',
        // Store rejection feedback as metadata (using tags field as a temporary store, or we could add a feedback field)
        tags: feedback ? `[REJECTED] ${feedback}` : '[REJECTED]',
        approvalChain: null,
      },
      include: {



      },
    });

    // Invalidate magazine cache (article was being considered for publication)
    await invalidateMagazineCache();

    return NextResponse.json(
      {
        ...updatedArticle,
        approvalChain: [],
        rejectionFeedback: feedback || null,
        rejectedBy: session.user.id,
        rejectedAt: new Date(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[PATCH /api/polymath/articles/[id]/reject]', error);
    return NextResponse.json(
      { error: 'Failed to reject article', details: error?.message },
      { status: 500 }
    );
  }
}
