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

    // Fetch teacher of this class for message
    const classWithTeacher = await prisma.k12Class.findUnique({
      where: { id: classId },
      include: { teacher: true },
    });

    // Build response grouped by standard
    const standards = classStandards.map((classStandard) => {
      const standard = classStandard.standard;
      const objectives = standard.exampleObjectives.map((objective) => {
        const studentProgress = progress.find((p) => p.objectiveId === objective.id);

        return {
          id: objective.id,
          text: objective.text,
          status: studentProgress?.completed
            ? 'mastered'
            : studentProgress
              ? 'in-progress'
              : 'not-started',
          isMandatory: objective.isMandatory,
          submittedAt: studentProgress?.completedAt?.toISOString() || null,
          grade: studentProgress?.grade || null,
        };
      });

      // Calculate standard mastery
      const masteredCount = objectives.filter((o) => o.status === 'mastered').length;
      const masteryPercent = objectives.length > 0 ? Math.round((masteredCount / objectives.length) * 100) : 0;

      // Determine trend (simplified: check if most recent submissions improved)
      const recentProgress = progress
        .filter((p) => standard.exampleObjectives.some((obj) => obj.id === p.objectiveId))
        .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
        .slice(0, 3);

      const trend = masteredCount > recentProgress.length / 2 ? 'up' : masteredCount > 0 ? 'stable' : 'down';

      return {
        id: standard.id,
        name: standard.name,
        code: standard.code || `STD-${standard.id.substring(0, 8).toUpperCase()}`,
        masteryPercent,
        status: masteryPercent >= 75 ? 'mastered' : masteryPercent > 0 ? 'in-progress' : 'not-started',
        trend,
        objectives,
        celebration: null, // Can add celebration detection logic later
      };
    });

    const messageFromTeacher = classWithTeacher?.teacher?.name
      ? `Keep up the great work! - ${classWithTeacher.teacher.name}`
      : 'Keep up the great work!';

    return NextResponse.json({
      studentId,
      studentName: session.user.name || 'Student',
      classId: k12Class.id,
      className: k12Class.name,
      standards,
      messageFromTeacher,
    });
  } catch (error) {
    console.error('Failed to fetch student progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
