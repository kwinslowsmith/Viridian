import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; classId: string; weekNum: string }> }
) {
  try {
    const { slug, classId, weekNum } = await params;
    const userId = request.headers.get('User-Id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Find organization
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Find class and verify user access
    const classData = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        organizationId: true,
        instructorId: true,
      },
    });

    if (!classData || classData.organizationId !== org.id) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Check user is instructor or enrolled student
    const userIsInstructor = classData.instructorId === userId;
    const enrollment = await prisma.k12Enrollment.findUnique({
      where: {
        classId_studentId: {
          classId: classId,
          studentId: userId,
        },
      },
      select: { status: true },
    });

    const userIsStudent = enrollment?.status === 'active';

    if (!userIsInstructor && !userIsStudent) {
      return NextResponse.json(
        { error: 'You do not have access to this class' },
        { status: 403 }
      );
    }

    // Get week details
    const week = await prisma.k12Week.findFirst({
      where: {
        classId: classId,
        weekNum: parseInt(weekNum),
      },
      select: {
        id: true,
        weekNum: true,
        title: true,
        startDate: true,
        endDate: true,
        agenda: true,
        materialsJson: true,
      },
    });

    if (!week) {
      return NextResponse.json({ error: 'Week not found' }, { status: 404 });
    }

    const materials = week.materialsJson ? JSON.parse(week.materialsJson) : [];

    return NextResponse.json(
      {
        week: {
          ...week,
          materials,
        },
        userRole: userIsInstructor ? 'Teacher' : 'Student',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch week details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch week details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; classId: string; weekNum: string }> }
) {
  try {
    const { slug, classId, weekNum } = await params;
    const userId = request.headers.get('User-Id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Find organization
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Find class and verify user is instructor
    const classData = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        organizationId: true,
        instructorId: true,
      },
    });

    if (!classData || classData.organizationId !== org.id) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (classData.instructorId !== userId) {
      return NextResponse.json(
        { error: 'Only instructors can edit week details' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { agenda, materials } = body;

    // Update week
    const week = await prisma.k12Week.updateMany({
      where: {
        classId: classId,
        weekNum: parseInt(weekNum),
      },
      data: {
        agenda: agenda || null,
        materialsJson: materials ? JSON.stringify(materials) : null,
      },
    });

    if (week.count === 0) {
      return NextResponse.json({ error: 'Week not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to update week details:', error);
    return NextResponse.json(
      { error: 'Failed to update week details' },
      { status: 500 }
    );
  }
}
