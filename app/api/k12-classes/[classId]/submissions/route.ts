import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/k12-classes/[classId]/submissions?studentId=[id]
 * Returns all submissions for a student in a class
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId } = await params;
    if (!classId) {
      return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 });
    }

    // Get studentId from query params
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId query parameter is required' },
        { status: 400 }
      );
    }

    // Verify user is either the student or the instructor
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: { instructorId: true },
    });

    if (!k12Class) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Allow access if user is instructor or the student themselves
    if (k12Class.instructorId !== session.user.id && studentId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get enrollment
    const enrollment = await prisma.k12Enrollment.findUnique({
      where: {
        classId_studentId: { classId, studentId },
      },
      select: { id: true },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Student not enrolled in this class' },
        { status: 404 }
      );
    }

    // Get all submissions for this student
    const submissions = await prisma.k12Submission.findMany({
      where: { enrollmentId: enrollment.id },
      select: {
        id: true,
        assessmentId: true,
        assessment: {
          select: {
            id: true,
            title: true,
            type: true,
            dueDate: true,
          },
        },
        submittedAt: true,
        grade: true,
        feedback: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedSubmissions = submissions.map((sub) => ({
      submissionId: sub.id,
      assessmentId: sub.assessmentId,
      assessmentTitle: sub.assessment.title,
      assessmentType: sub.assessment.type,
      dueDate: sub.assessment.dueDate,
      submittedAt: sub.submittedAt,
      grade: sub.grade,
      feedback: sub.feedback,
      status: sub.status,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    }));

    return NextResponse.json(formattedSubmissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
