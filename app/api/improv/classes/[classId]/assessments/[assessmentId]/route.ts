import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// PUT: Teacher confirms or overrides assessment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; assessmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, assessmentId } = await params;
    const { teacherLevel, teacherNote } = await request.json();

    if (teacherLevel && (teacherLevel < 1 || teacherLevel > 4)) {
      return NextResponse.json(
        { error: 'Invalid teacherLevel (must be 1-4)' },
        { status: 400 }
      );
    }

    // Get existing assessment
    const assessment = await prisma.improvSkillAssessment.findUnique({
      where: { id: assessmentId },
      include: { skill: true },
    });

    if (!assessment || assessment.classId !== classId) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Get class to verify teacher is instructor
    const improvClass = await prisma.improvClass.findUnique({
      where: { id: classId },
    });

    if (!improvClass || improvClass.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the instructor can confirm assessments' },
        { status: 403 }
      );
    }

    // Update history
    const existingHistory = assessment.history ? JSON.parse(assessment.history) : [];
    const newHistoryEntry = {
      date: new Date().toISOString(),
      studentSelfLevel: assessment.studentSelfLevel,
      teacherLevel: teacherLevel || null,
      teacherNote: teacherNote || null,
    };
    existingHistory.push(newHistoryEntry);

    // Update assessment
    const updated = await prisma.improvSkillAssessment.update({
      where: { id: assessmentId },
      data: {
        teacherLevel: teacherLevel || null,
        teacherNote: teacherNote || null,
        teacherConfirmedAt: new Date(),
        history: JSON.stringify(existingHistory),
        updatedAt: new Date(),
      },
      include: {
        skill: { select: { id: true, name: true } },
        student: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ assessment: updated }, { status: 200 });
  } catch (error) {
    console.error('Failed to update assessment:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment' },
      { status: 500 }
    );
  }
}
