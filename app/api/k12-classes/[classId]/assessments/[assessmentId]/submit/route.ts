import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/k12-classes/[classId]/assessments/[assessmentId]/submit
 * Student submits work for an assessment
 * Body: { studentId, content? }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; assessmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, assessmentId } = await params;
    if (!classId || !assessmentId) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const body = await request.json();
    const { studentId, content } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    // Verify assessment exists
    const assessment = await prisma.k12Assessment.findUnique({
      where: { id: assessmentId },
      select: { classId: true, id: true },
    });

    if (!assessment || assessment.classId !== classId) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Verify student is enrolled in the class
    const enrollment = await prisma.k12Enrollment.findUnique({
      where: {
        classId_studentId: { classId, studentId },
      },
      select: { id: true },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Student not enrolled in this class' },
        { status: 403 }
      );
    }

    // Check if submission already exists
    let submission = await prisma.k12Submission.findUnique({
      where: {
        assessmentId_enrollmentId: { assessmentId, enrollmentId: enrollment.id },
      },
      select: { id: true },
    });

    if (submission) {
      // Update existing submission (resubmit)
      const updated = await prisma.k12Submission.update({
        where: { id: submission.id },
        data: {
          submittedAt: new Date(),
          status: 'submitted',
        },
        select: {
          id: true,
          studentId: true,
          submittedAt: true,
          status: true,
        },
      });

      return NextResponse.json(
        {
          ...updated,
          submissionId: updated.id,
        },
        { status: 200 }
      );
    }

    // Create new submission
    const newSubmission = await prisma.k12Submission.create({
      data: {
        assessmentId,
        studentId,
        enrollmentId: enrollment.id,
        submittedAt: new Date(),
        status: 'submitted',
      },
      select: {
        id: true,
        studentId: true,
        submittedAt: true,
        status: true,
      },
    });

    return NextResponse.json(
      {
        ...newSubmission,
        submissionId: newSubmission.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to submit assessment' },
      { status: 500 }
    );
  }
}
