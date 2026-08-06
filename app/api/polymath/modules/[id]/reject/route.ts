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

    const module = await prisma.polymathModule.findUnique({
      where: { id },
      include: {
        
      },
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

    const isApprover = approvalChain.includes(session.user.id);
    const isCreator = module.authorId === session.user.id;

    if (!isApprover && !isCreator) {
      return NextResponse.json(
        { error: 'You do not have permission to reject this module' },
        { status: 403 }
      );
    }

    const updatedModule = await prisma.polymathModule.update({
      where: { id },
      data: {
        status: 'rejected',
        approvalChain: null,
      },
    });

    return NextResponse.json(
      {
        ...updatedModule,
        lessonsJson: updatedModule.lessonsJson ? JSON.parse(updatedModule.lessonsJson) : [],
        approvalChain: [],
        rejectionFeedback: feedback || null,
        rejectedBy: session.user.id,
        rejectedAt: new Date(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[PATCH /api/polymath/modules/[id]/reject]', error);
    return NextResponse.json(
      { error: 'Failed to reject module', details: error?.message },
      { status: 500 }
    );
  }
}
