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

    const tool = await prisma.polymathTool.findUnique({
      where: { id },
      include: {
        
      },
    });

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    if (tool.status !== 'pending_approval') {
      return NextResponse.json(
        { error: `Tool is not pending approval. Current status: ${tool.status}` },
        { status: 400 }
      );
    }

    const approvalChain = tool.approvalChain
      ? JSON.parse(tool.approvalChain)
      : [];

    const isApprover = approvalChain.includes(session.user.id);
    const isCreator = tool.authorId === session.user.id;

    if (!isApprover && !isCreator) {
      return NextResponse.json(
        { error: 'You do not have permission to reject this tool' },
        { status: 403 }
      );
    }

    const updatedTool = await prisma.polymathTool.update({
      where: { id },
      data: {
        status: 'rejected',
        approvalChain: null,
      },
    });

    return NextResponse.json(
      {
        ...updatedTool,
        approvalChain: [],
        rejectionFeedback: feedback || null,
        rejectedBy: session.user.id,
        rejectedAt: new Date(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[PATCH /api/polymath/tools/[id]/reject]', error);
    return NextResponse.json(
      { error: 'Failed to reject tool', details: error?.message },
      { status: 500 }
    );
  }
}
