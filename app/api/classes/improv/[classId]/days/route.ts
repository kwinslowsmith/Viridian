import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const startDate = request.nextUrl.searchParams.get('startDate');
    const endDate = request.nextUrl.searchParams.get('endDate');

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

    const days = await prisma.improvDay.findMany({
      where: {
        week: { classId },
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ days });
  } catch (error) {
    console.error('Failed to fetch Improv days:', error);
    return NextResponse.json({ error: 'Failed to fetch days' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const body = await request.json();
    const { date, dayOfWeek, title, homework, isMajor, type, googleDocUrl, pdfFileKey, pdfFileName } = body;

    // Find the week this date belongs to
    const dateObj = new Date(date);
    const week = await prisma.improvWeek.findFirst({
      where: {
        classId,
        startDate: { lte: dateObj },
        endDate: { gte: dateObj },
      },
    });

    if (!week) {
      return NextResponse.json({ error: 'Week not found' }, { status: 404 });
    }

    const day = await prisma.improvDay.create({
      data: {
        weekId: week.id,
        date: dateObj,
        dayOfWeek,
        title,
        homework,
        isMajor: isMajor || false,
        type: type || 'lesson',
        googleDocUrl,
        pdfFileKey,
        pdfFileName,
      },
    });

    return NextResponse.json({ day }, { status: 201 });
  } catch (error) {
    console.error('Failed to create Improv day:', error);
    return NextResponse.json({ error: 'Failed to create day' }, { status: 500 });
  }
}
