import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * PATCH /api/k12-classes/[classId]/submissions/[submissionId]/grade
 * Teacher grades a submission
 * Body: { grade (0-100), feedback? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; submissionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, submissionId } = await params;
    if (!classId || !submissionId) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Verify user is instructor for this class
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: { instructorId: true },
    });

    if (!k12Class || k12Class.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { grade, feedback } = body;

    // Validate grade
    if (grade === undefined) {
      return NextResponse.json(
        { error: 'grade is required' },
        { status: 400 }
      );
    }

    if (typeof grade !== 'number' || grade < 0 || grade > 100) {
      return NextResponse.json(
        { error: 'grade must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    // Get submission and verify it belongs to this class
    const submission = await prisma.k12Submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        assessmentId: true,
        assessment: { select: { classId: true } },
      },
    });

    if (!submission || submission.assessment.classId !== classId) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Update submission with grade
    const updated = await prisma.k12Submission.update({
      where: { id: submissionId },
      data: {
        grade,
        feedback: feedback?.trim() || null,
        status: 'graded',
        updatedAt: new Date(),
      },
      select: {
        id: true,
        studentId: true,
        grade: true,
        feedback: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      submissionId: updated.id,
      studentId: updated.studentId,
      grade: updated.grade,
      feedback: updated.feedback,
      status: updated.status,
      gradedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    return NextResponse.json(
      { error: 'Failed to grade submission' },
      { status: 500 }
    );
  }
}
