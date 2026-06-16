import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; dayId: string }> }
) {
  try {
    const { classId, dayId } = await params;
    const body = await request.json();
    const { title, homework, isMajor, type, description, materialsJson, standardsJson, googleDocUrl, pdfFileKey, pdfFileName } = body;

    // Verify day belongs to this class
    const day = await prisma.k12Day.findFirst({
      where: {
        id: dayId,
        week: { classId },
      },
    });

    if (!day) {
      return NextResponse.json({ error: 'Day not found' }, { status: 404 });
    }

    const updated = await prisma.k12Day.update({
      where: { id: dayId },
      data: {
        title,
        homework,
        isMajor,
        type,
        description,
        materialsJson,
        standardsJson,
        googleDocUrl,
        pdfFileKey,
        pdfFileName,
      },
    });

    return NextResponse.json({ day: updated });
  } catch (error) {
    console.error('Failed to update K12 day:', error);
    return NextResponse.json({ error: 'Failed to update day' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; dayId: string }> }
) {
  try {
    const { classId, dayId } = await params;

    // Verify day belongs to this class
    const day = await prisma.k12Day.findFirst({
      where: {
        id: dayId,
        week: { classId },
      },
    });

    if (!day) {
      return NextResponse.json({ error: 'Day not found' }, { status: 404 });
    }

    await prisma.k12Day.delete({ where: { id: dayId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete K12 day:', error);
    return NextResponse.json({ error: 'Failed to delete day' }, { status: 500 });
  }
}
