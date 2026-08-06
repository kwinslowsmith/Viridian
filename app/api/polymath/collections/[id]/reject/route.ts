import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

interface RejectBody {
  feedback?: string;
}

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
    const body: RejectBody = await req.json();
    const { feedback } = body;

    const collection = await prisma.polymathResourceCollection.findUnique({
      where: { id },
      include: {
        
      },
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

    const isApprover = approvalChain.includes(session.user.id);
    const isCreator = collection.authorId === session.user.id;

    if (!isApprover && !isCreator) {
      return NextResponse.json(
        { error: 'You do not have permission to reject this collection' },
        { status: 403 }
      );
    }

    const updatedCollection = await prisma.polymathResourceCollection.update({
      where: { id },
      data: {
        status: 'rejected',
        approvalChain: null,
      },
    });

    return NextResponse.json(
      {
        ...updatedCollection,
        approvalChain: [],
        rejectionFeedback: feedback || null,
        rejectedBy: session.user.id,
        rejectedAt: new Date(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[PATCH /api/polymath/collections/[id]/reject]', error);
    return NextResponse.json(
      { error: 'Failed to reject collection', details: error?.message },
      { status: 500 }
    );
  }
}
