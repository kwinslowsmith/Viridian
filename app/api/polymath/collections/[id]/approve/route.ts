import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const collection = await prisma.polymathResourceCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    if (collection.status !== 'pending_approval') {
      return NextResponse.json(
        { error: `Collection is not pending approval. Current status: ${collection.status}` },
        { status: 400 }
      );
    }

    const approvalChain = collection.approvalChain
      ? JSON.parse(collection.approvalChain)
      : [];

    if (!approvalChain.includes(session.user.id)) {
      return NextResponse.json(
        { error: 'You are not in the approval chain for this collection' },
        { status: 403 }
      );
    }

    const approverIndex = approvalChain.indexOf(session.user.id);
    let newStatus = collection.status;
    let newApprovalChain = approvalChain.filter(
      (userId: string, index: number) => index !== approverIndex
    );

    if (newApprovalChain.length === 0) {
      newStatus = 'published';
    }

    const updatedCollection = await prisma.polymathResourceCollection.update({
      where: { id },
      data: {
        status: newStatus,
        approvalChain: newApprovalChain.length > 0 ? JSON.stringify(newApprovalChain) : null,
        publishedAt: newStatus === 'published' ? new Date() : null,
      },
      include: {
        
        
        
        resources: {
          include: { resource: true },
          orderBy: { sequenceNum: 'asc' },
        },
      },
    });

    const originalChainLength = approvalChain.length;
    const remainingApprovers = newApprovalChain.length;
    const approvedCount = originalChainLength - remainingApprovers;

    return NextResponse.json(
      {
        ...updatedCollection,
        resources: updatedCollection.resources.map((r) => r.resource),
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
    console.error('[PATCH /api/polymath/collections/[id]/approve]', error);
    return NextResponse.json(
      { error: 'Failed to approve collection', details: error?.message },
      { status: 500 }
    );
  }
}
