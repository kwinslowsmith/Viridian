import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// POST: Self-enroll or add student (instructor only for adding others)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId } = await params;
    const body = await request.json();
    const { studentId } = body; // If provided, add that student; otherwise self-enroll

    // Get class with instructor info
    const improvClass = await prisma.improvClass.findUnique({
      where: { id: classId },
      include: { instructor: true, organization: true },
    });

    if (!improvClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const targetStudentId = studentId || session.user.id;

    // Check if user is instructor or can manage this class
    if (studentId && session.user.id !== improvClass.instructorId) {
      // If adding someone else, requester must be the instructor
      return NextResponse.json(
        { error: 'Only the instructor can add students' },
        { status: 403 }
      );
    }

    // Check if already enrolled
    const existing = await prisma.improvEnrollment.findUnique({
      where: {
        classId_studentId: {
          classId,
          studentId: targetStudentId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Student already enrolled' },
        { status: 409 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.improvEnrollment.create({
      data: {
        studentId: targetStudentId,
        classId,
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        class: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    console.error('Failed to enroll:', error);
    return NextResponse.json(
      { error: 'Failed to enroll' },
      { status: 500 }
    );
  }
}
