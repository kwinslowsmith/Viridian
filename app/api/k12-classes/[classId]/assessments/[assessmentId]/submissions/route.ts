import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/k12-classes/[classId]/assessments/[assessmentId]/submissions
 * Returns all submissions for an assessment with student details
 */
export async function GET(
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

    // Verify user is instructor for this class
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: { instructorId: true },
    });

    if (!k12Class || k12Class.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify assessment exists
    const assessment = await prisma.k12Assessment.findUnique({
      where: { id: assessmentId },
      select: { classId: true },
    });

    if (!assessment || assessment.classId !== classId) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Get all submissions
    const submissions = await prisma.k12Submission.findMany({
      where: { assessmentId },
      select: {
        id: true,
        studentId: true,
        submittedAt: true,
        grade: true,
        feedback: true,
        status: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Enrich with student details
    const enrichedSubmissions = await Promise.all(
      submissions.map(async (sub) => {
        const student = await prisma.user.findUnique({
          where: { id: sub.studentId },
          select: { name: true, email: true },
        });
        return {
          submissionId: sub.id,
          studentId: sub.studentId,
          studentName: student?.name || 'Unknown',
          studentEmail: student?.email || '',
          submittedAt: sub.submittedAt,
          grade: sub.grade,
          feedback: sub.feedback,
          status: sub.status || (sub.grade !== null ? 'graded' : 'pending'),
          updatedAt: sub.updatedAt,
        };
      })
    );

    return NextResponse.json(enrichedSubmissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
