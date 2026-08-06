import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all assessments for a class
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

    const assessments = await prisma.improvSkillAssessment.findMany({
      where: { classId },
      include: {
        student: { select: { id: true, name: true, email: true } },
        skill: { select: { id: true, name: true } },
      },
      orderBy: [{ student: { name: 'asc' } }, { skill: { name: 'asc' } }],
    });

    const withHistory = assessments.map(a => ({
      ...a,
      history: a.history ? JSON.parse(a.history) : [],
    }));

    return NextResponse.json({ assessments: withHistory }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

// POST: Student submits self-assessment
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
    const { skillId, level } = await request.json();

    if (!skillId || !level || level < 1 || level > 4) {
      return NextResponse.json(
        { error: 'Invalid skillId or level (must be 1-4)' },
        { status: 400 }
      );
    }

    const studentId = session.user.id;

    // Check if student is in this class
    const enrollment = await prisma.improvEnrollment.findUnique({
      where: {
        classId_studentId: { classId, studentId },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Student not enrolled in this class' },
        { status: 403 }
      );
    }

    // Get existing assessment if any
    const existing = await prisma.improvSkillAssessment.findUnique({
      where: {
        classId_studentId_skillId: { classId, studentId, skillId },
      },
    });

    const newHistoryEntry = {
      date: new Date().toISOString(),
      studentSelfLevel: level,
      teacherLevel: existing?.teacherLevel || null,
      teacherNote: existing?.teacherNote || null,
    };

    const updatedHistory = existing && existing.history
      ? JSON.parse(existing.history)
      : [];
    updatedHistory.push(newHistoryEntry);

    // Upsert assessment
    const assessment = await prisma.improvSkillAssessment.upsert({
      where: {
        classId_studentId_skillId: { classId, studentId, skillId },
      },
      create: {
        classId,
        studentId,
        skillId,
        studentSelfLevel: level,
        history: JSON.stringify([newHistoryEntry]),
      },
      update: {
        studentSelfLevel: level,
        history: JSON.stringify(updatedHistory),
        updatedAt: new Date(),
      },
      include: {
        skill: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ assessment }, { status: 201 });
  } catch (error) {
    console.error('Failed to create assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}
