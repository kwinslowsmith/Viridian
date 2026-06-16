import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function DELETE(
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

    // Verify user is creator of this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { createdById: true },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (conversation.createdById !== userId) {
      return NextResponse.json(
        { error: 'Only the creator can delete this conversation' },
        { status: 403 }
      );
    }

    // Delete all messages in the conversation first
    await prisma.message.deleteMany({
      where: { conversationId },
    });

    // Delete all participants
    await prisma.conversationParticipant.deleteMany({
      where: { conversationId },
    });

    // Delete the conversation
    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    console.log('✅ Conversation deleted:', conversationId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Failed to delete conversation:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'Failed to delete conversation',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
