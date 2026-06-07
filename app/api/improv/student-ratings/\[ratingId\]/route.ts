import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { ratingId: string } }
) {
  try {
    const { ratingId } = params;
    const body = await request.json();
    const { level, narrative, evidence } = body;

    const updated = await prisma.improvStudentRating.update({
      where: { id: ratingId },
      data: {
        ...(level && { level }),
        ...(narrative !== undefined && { narrative }),
        ...(evidence !== undefined && { evidence }),
        revisedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating student rating:', error);
    return NextResponse.json(
      { error: 'Failed to update student rating' },
      { status: 500 }
    );
  }
}
