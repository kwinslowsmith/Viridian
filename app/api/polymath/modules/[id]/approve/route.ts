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

    const module = await prisma.polymathModule.findUnique({
      where: { id },
    });

    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    if (module.status !== 'pending_approval') {
      return NextResponse.json(
        { error: `Module is not pending approval. Current status: ${module.status}` },
        { status: 400 }
      );
    }

    const approvalChain = module.approvalChain
      ? JSON.parse(module.approvalChain)
      : [];

    if (!approvalChain.includes(session.user.id)) {
      return NextResponse.json(
        { error: 'You are not in the approval chain for this module' },
        { status: 403 }
      );
    }

    const approverIndex = approvalChain.indexOf(session.user.id);
    let newStatus = module.status;
    let newApprovalChain = approvalChain.filter(
      (userId: string, index: number) => index !== approverIndex
    );

    if (newApprovalChain.length === 0) {
      newStatus = 'published';
    }

    const updatedModule = await prisma.polymathModule.update({
      where: { id },
      data: {
        status: newStatus,
        approvalChain: newApprovalChain.length > 0 ? JSON.stringify(newApprovalChain) : null,
        publishedAt: newStatus === 'published' ? new Date() : null,
      },
      include: {
        
        
        
      },
    });

    const originalChainLength = approvalChain.length;
    const remainingApprovers = newApprovalChain.length;
    const approvedCount = originalChainLength - remainingApprovers;

    return NextResponse.json(
      {
        ...updatedModule,
        lessonsJson: updatedModule.lessonsJson ? JSON.parse(updatedModule.lessonsJson) : [],
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
    console.error('[PATCH /api/polymath/modules/[id]/approve]', error);
    return NextResponse.json(
      { error: 'Failed to approve module', details: error?.message },
      { status: 500 }
    );
  }
}
