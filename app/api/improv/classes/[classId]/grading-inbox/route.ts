import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

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
    if (!classId || typeof classId !== 'string' || classId.trim() === '') {
      return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 });
    }

    // Verify user is the instructor for this class
    const improvClass = await prisma.improvClass.findUnique({
      where: { id: classId },
    });

    if (!improvClass || improvClass.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all pending submissions for the class
    const submissions = await prisma.improvObjectiveAssessment.findMany({
      where: {
        classId,
        status: { not: 'graded' }, // Exclude already graded submissions
      },
      include: {
        objective: {
          include: {
            skill: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // submitted first, then not-started
        { submittedAt: 'desc' }, // most recent first
      ],
    });

    // Group by status for UI organization
    const grouped = {
      submitted: submissions.filter(s => s.status === 'submitted'),
      notStarted: submissions.filter(s => s.status === 'not-started'),
    };

    return NextResponse.json({
      submissions,
      grouped,
      total: submissions.length,
      pendingCount: submissions.filter(s => s.status === 'submitted').length,
    });
  } catch (error) {
    console.error('Failed to fetch grading inbox:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grading inbox' },
      { status: 500 }
    );
  }
}
