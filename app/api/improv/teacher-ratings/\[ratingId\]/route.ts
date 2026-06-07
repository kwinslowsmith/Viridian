import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { ratingId: string } }
) {
  try {
    const { ratingId } = params;
    const body = await request.json();
    const { level, instructorNotes } = body;

    const updated = await prisma.improvTeacherRating.update({
      where: { id: ratingId },
      data: {
        ...(level && { level }),
        ...(instructorNotes !== undefined && { instructorNotes }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating teacher rating:', error);
    return NextResponse.json(
      { error: 'Failed to update teacher rating' },
      { status: 500 }
    );
  }
}
