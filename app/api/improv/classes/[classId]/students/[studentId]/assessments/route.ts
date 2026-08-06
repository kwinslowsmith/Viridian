import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET student's assessments for a class
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; studentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, studentId } = await params;

    // Verify student is in class
    const enrollment = await prisma.improvEnrollment.findUnique({
      where: {
        classId_studentId: { classId, studentId },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Student not enrolled in this class' },
        { status: 404 }
      );
    }

    const assessments = await prisma.improvSkillAssessment.findMany({
      where: { classId, studentId },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            category: true,
            levelDefinitions: true,
          },
        },
      },
      orderBy: { skill: { name: 'asc' } },
    });

    const withHistory = assessments.map(a => ({
      ...a,
      levelDefinitions: a.skill.levelDefinitions ? JSON.parse(a.skill.levelDefinitions) : {},
      history: a.history ? JSON.parse(a.history) : [],
    }));

    return NextResponse.json({ assessments: withHistory }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch student assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student assessments' },
      { status: 500 }
    );
  }
}
