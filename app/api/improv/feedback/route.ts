import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get('enrollmentId');
    const weekId = searchParams.get('weekId');

    const feedback = await prisma.improvFeedback.findMany({
      where: {
        ...(enrollmentId && { enrollmentId }),
        ...(weekId && { weekId }),
        isVisible: true,
      },
      include: {
        skill: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enrollmentId, weekId, skillId, note } = body;

    if (!enrollmentId || !weekId || !note) {
      return NextResponse.json(
        { error: 'Missing required fields: enrollmentId, weekId, note' },
        { status: 400 }
      );
    }

    const feedback = await prisma.improvFeedback.create({
      data: {
        enrollmentId,
        weekId,
        skillId: skillId || null,
        note,
        isVisible: true,
      },
      include: {
        skill: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    );
  }
}
