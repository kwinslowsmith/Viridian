import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { feedbackId: string } }
) {
  try {
    const { feedbackId } = params;
    const body = await request.json();
    const { note, isVisible } = body;

    const updated = await prisma.improvFeedback.update({
      where: { id: feedbackId },
      data: {
        ...(note && { note }),
        ...(isVisible !== undefined && { isVisible }),
      },
      include: {
        skill: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}
