import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enrollmentId, weekId, skillId, level, instructorNotes } = body;

    if (!enrollmentId || !weekId || !skillId || !level) {
      return NextResponse.json(
        { error: 'Missing required fields: enrollmentId, weekId, skillId, level' },
        { status: 400 }
      );
    }

    // Check if rating already exists
    const existing = await prisma.improvTeacherRating.findUnique({
      where: {
        enrollmentId_weekId_skillId: {
          enrollmentId,
          weekId,
          skillId,
        },
      },
    });

    if (existing) {
      // Update instead of creating
      const updated = await prisma.improvTeacherRating.update({
        where: { id: existing.id },
        data: {
          level,
          instructorNotes: instructorNotes || null,
        },
      });
      return NextResponse.json(updated, { status: 200 });
    }

    // Create new rating
    const rating = await prisma.improvTeacherRating.create({
      data: {
        enrollmentId,
        weekId,
        skillId,
        level,
        instructorNotes: instructorNotes || null,
      },
    });

    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error('Error creating teacher rating:', error);
    return NextResponse.json(
      { error: 'Failed to create teacher rating' },
      { status: 500 }
    );
  }
}
