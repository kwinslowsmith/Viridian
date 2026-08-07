import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId } = await params;
    const studentId = session.user.id;

    // Fetch K12 class
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
    });

    if (!k12Class) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Get standards linked to this class
    const classStandards = await prisma.classStandard.findMany({
      where: { classId },
      include: {
        standard: {
          include: {
            exampleObjectives: true,
          },
        },
      },
    });

    // Fetch student progress for each objective in this class
    const progress = await prisma.studentObjectiveProgress.findMany({
      where: { userId: studentId },
    });

    // Build response grouped by standard
    const standards = classStandards.map((classStandard) => {
      const standard = classStandard.standard;
      const skills = standard.exampleObjectives.map((objective) => {
        const studentProgress = progress.find((p) => p.objectiveId === objective.id);
        const masteryPercent = studentProgress?.completed ? 100 : 0;

        return {
          id: objective.id,
          label: objective.label || objective.text,
          text: objective.text,
          masteryPercent,
          status: studentProgress?.completed
            ? 'Mastered'
            : studentProgress
              ? 'In Progress'
              : 'Not Started',
          trend: masteryPercent === 100 ? '↑' : masteryPercent > 0 ? '=' : '↓',
          lastActivityAt: studentProgress?.completedAt || null,
          nextDeadlineAt: null, // Can add deadline tracking later
          isMandatory: objective.isMandatory,
        };
      });

      const masteredSkills = skills.filter((s) => s.masteryPercent >= 80).length;
      return {
        id: standard.id,
        name: standard.name,
        description: standard.description,
        passPercentage: standard.passPercentage,
        skills,
        masteredCount: masteredSkills,
        totalCount: skills.length,
      };
    });

    return NextResponse.json({
      student: { id: studentId, name: session.user.name || 'Student' },
      class: { id: k12Class.id, name: k12Class.name },
      standards,
    });
  } catch (error) {
    console.error('Failed to fetch student progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
