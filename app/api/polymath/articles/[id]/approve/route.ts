import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { invalidateMagazineCache } from '@/lib/cache/magazine-cache';

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

    // Get the article
    const article = await prisma.polymathArticle.findUnique({
      where: { id },
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

    // Parse approval chain
    const approvalChain = article.approvalChain
      ? JSON.parse(article.approvalChain)
      : [];

    if (!approvalChain.includes(session.user.id)) {
      return NextResponse.json(
        { error: 'You are not in the approval chain for this article' },
        { status: 403 }
      );
    }

    // Find the current approver index
    const approverIndex = approvalChain.indexOf(session.user.id);

    // Move to next approver or publish if all approved
    let newStatus = article.status;
    let newApprovalChain = approvalChain;

    // Remove current approver from chain
    newApprovalChain = approvalChain.filter(
      (userId: string, index: number) => index !== approverIndex
    );

    // If approval chain is empty, publish the article
    if (newApprovalChain.length === 0) {
      newStatus = 'published';
    }

    // Update article
    const updatedArticle = await prisma.polymathArticle.update({
      where: { id },
      data: {
        status: newStatus,
        approvalChain: newApprovalChain.length > 0 ? JSON.stringify(newApprovalChain) : null,
        publishedAt: newStatus === 'published' ? new Date() : null,
      },
    });

    // Calculate approval progress
    const originalChainLength = approvalChain.length;
    const remainingApprovers = newApprovalChain.length;
    const approvedCount = originalChainLength - remainingApprovers;

    // Invalidate magazine cache if article is now published
    if (newStatus === 'published') {
      await invalidateMagazineCache();
    }

    return NextResponse.json(
      {
        ...updatedArticle,
        approvalChain: newApprovalChain,
        approvalProgress: {
          approved: approvedCount,
          total: originalChainLength,
          remaining: remainingApprovers,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[PATCH /api/polymath/articles/[id]/approve]', error);
    return NextResponse.json(
      { error: 'Failed to approve article', details: error?.message },
      { status: 500 }
    );
  }
}
