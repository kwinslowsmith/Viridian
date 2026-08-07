import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { childId } = await params;

    // Fetch parent user to verify they have permission
    const parentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!parentUser) {
      return NextResponse.json(
        { error: 'Parent not found' },
        { status: 404 }
      );
    }

    // Fetch child user
    const childUser = await prisma.user.findUnique({
      where: { id: childId },
      select: { id: true, name: true, email: true },
    });

    if (!childUser) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      );
    }

    // TODO: Verify parent-child relationship (add to schema if needed)
    // For now, we'll assume the parent has access

    // Get child's enrollments to find classes
    const enrollments = await prisma.improvEnrollment.findMany({
      where: { studentId: childId, status: 'active' },
      include: {
        class: {
          select: { id: true, name: true },
        },
      },
    });

    if (enrollments.length === 0) {
      return NextResponse.json({
        childName: childUser.name,
        className: 'No active classes',
        standards: [],
        lastActivity: null,
      });
    }

    // Get class info (use first active class for now)
    const firstClass = enrollments[0].class;

    // Fetch standards assigned to the class
    const classStandards = await prisma.classStandard.findMany({
      where: { classId: firstClass.id },
      include: {
        standard: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            exampleObjectives: {
              select: {
                id: true,
                label: true,
                text: true,
                isMandatory: true,
              },
              orderBy: { sequenceNum: 'asc' },
            },
          },
        },
      },
      orderBy: {
        standard: { name: 'asc' },
      },
    });

    // Build response with mastery data
    const standardsData = await Promise.all(
      classStandards.map(async (cs) => {
        const standard = cs.standard;

        // Get student's progress on each objective under this standard
        const objectiveProgress = await Promise.all(
          standard.exampleObjectives.map(async (obj) => {
            const progress = await prisma.studentObjectiveProgress.findUnique({
              where: {
                userId_objectiveId: {
                  userId: childId,
                  objectiveId: obj.id,
                },
              },
            });

            return {
              id: obj.id,
              label: obj.label,
              text: obj.text,
              isMandatory: obj.isMandatory,
              completed: progress?.completed ?? false,
              completedAt: progress?.completedAt,
            };
          })
        );

        // Calculate mastery percentage
        const completedObjectives = objectiveProgress.filter((p) => p.completed).length;
        const totalObjectives = objectiveProgress.length;
        const masteryPercent = totalObjectives > 0
          ? Math.round((completedObjectives / totalObjectives) * 100)
          : 0;

        // Determine status
        let status = 'not-started';
        if (masteryPercent === 100) {
          status = 'mastered';
        } else if (masteryPercent > 0) {
          status = 'in-progress';
        }

        // Determine if on track or needs support
        const progressStatus = masteryPercent >= 60 ? 'on-track' : 'needs-support';

        // Create help tips per standard
        const helpTips = [
          `Ask ${childUser.name} what they're learning about ${standard.name.toLowerCase()}`,
          `Look at examples of completed work together to understand what mastery looks like`,
          `Celebrate progress - even small improvements count!`,
        ];

        return {
          id: standard.id,
          name: standard.name,
          code: standard.code,
          description: standard.description,
          masteryPercent,
          status, // "mastered" | "in-progress" | "not-started"
          progressStatus, // "on-track" | "needs-support"
          objectives: objectiveProgress,
          skillsCount: standard.exampleObjectives.length,
          completedCount: completedObjectives,
          helpTips,
        };
      })
    );

    // Get last activity (most recent objective completion)
    const lastCompletedObjective = await prisma.studentObjectiveProgress.findFirst({
      where: { userId: childId, completed: true },
      include: {
        objective: {
          include: {
            standard: { select: { name: true } },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 1,
    });

    let lastActivity = null;
    if (lastCompletedObjective) {
      lastActivity = `${childUser.name} mastered ${lastCompletedObjective.objective.text} in ${lastCompletedObjective.objective.standard.name} on ${lastCompletedObjective.completedAt?.toLocaleDateString()}`;
    }

    return NextResponse.json({
      childName: childUser.name,
      className: firstClass.name,
      classId: firstClass.id,
      standards: standardsData,
      lastActivity,
    });
  } catch (error) {
    console.error('Error fetching parent progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress data' },
      { status: 500 }
    );
  }
}
