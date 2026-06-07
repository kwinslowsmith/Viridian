import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // TODO: Get teacher ID from session/auth
    const teacherId = request.headers.get('x-teacher-id') || 'user-default';

    const classes = await prisma.improvClass.findMany({
      where: { instructorId: teacherId },
      include: {
        enrollments: true,
        weeks: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, subtitle, numWeeks, startDate } = body;

    if (!name || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields: name, startDate' },
        { status: 400 }
      );
    }

    const teacherId = request.headers.get('x-teacher-id') || 'user-default';

    const newClass = await prisma.improvClass.create({
      data: {
        name,
        subtitle: subtitle || null,
        numWeeks: numWeeks || 8,
        startDate: new Date(startDate),
        instructorId: teacherId,
        status: 'active',
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}
