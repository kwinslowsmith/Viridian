import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { conversationId } = await params;
    const userId = session.user.id;

    // Verify user is participant in conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'Not a participant in this conversation' },
        { status: 403 }
      );
    }

    // Archive the conversation
    const conversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: { isArchived: true },
    });

    console.log('✅ Conversation archived:', conversationId);
    return NextResponse.json({ success: true, conversation }, { status: 200 });
  } catch (error) {
    console.error('❌ Failed to archive conversation:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'Failed to archive conversation',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
