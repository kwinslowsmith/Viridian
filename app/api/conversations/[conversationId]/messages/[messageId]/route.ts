import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string; messageId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { conversationId, messageId } = await params;
    const userId = session.user.id;

    // Verify message exists and belongs to conversation
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.conversationId !== conversationId) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Only allow deletion by the message sender
    if (message.senderId !== userId) {
      return NextResponse.json(
        { error: 'Can only delete your own messages' },
        { status: 403 }
      );
    }

    // Delete the message
    await prisma.message.delete({
      where: { id: messageId },
    });

    console.log('✅ Message deleted:', messageId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Failed to delete message:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'Failed to delete message',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
