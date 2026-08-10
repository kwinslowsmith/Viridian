import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; classId: string }> }
) {
  try {
    const { slug, classId } = await params;
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

    // Only instructor can view students
    if (classData.instructorId !== userId) {
      return NextResponse.json(
        { error: 'Only instructor can view class students' },
        { status: 403 }
      );
    }

    // Get enrolled students
    const students = await prisma.k12Enrollment.findMany({
      where: {
        classId: classId,
      },
      select: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        status: true,
        enrolledAt: true,
      },
      orderBy: { enrolledAt: 'asc' },
    });

    // Transform to flat structure
    const studentList = students.map((enrollment) => ({
      id: enrollment.student.id,
      name: enrollment.student.name,
      email: enrollment.student.email,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
    }));

    return NextResponse.json({ students: studentList }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch class students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class students' },
      { status: 500 }
    );
  }
}
