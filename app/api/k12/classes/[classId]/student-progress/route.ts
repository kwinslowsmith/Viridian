import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const studentIdParam = searchParams.get('studentId');

  if (!studentIdParam) {
    return NextResponse.json(
      { error: 'studentId query parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Verify student is enrolled in class
    const enrollment = await prisma.k12Enrollment.findUnique({
      where: {
        classId_studentId: {
          classId: params.classId,
          studentId: studentIdParam,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Student not enrolled in this class' },
        { status: 404 }
      );
    }

    // Get class info
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: params.classId },
      include: {
        weeks: {
          select: {
            id: true,
            weekNum: true,
            title: true,
            unit: true,
          },
        },
      },
    });

    if (!k12Class) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Get all standards for the class
    const classStandards = await prisma.classStandard.findMany({
      where: { classId: params.classId },
      include: {
        standard: {
          include: {
            exampleObjectives: {
              orderBy: { sequenceNum: 'asc' },
            },
          },
        },
      },
    });

    // Get student's submissions for this class
    const submissions = await prisma.k12Submission.findMany({
      where: {
        enrollment: {
          classId: params.classId,
          studentId: studentIdParam,
        },
      },
      include: {
        assessment: {
          select: {
            id: true,
            standardId: true,
            objectiveIds: true,
            title: true,
          },
        },
      },
    });

    // Calculate progress for each standard
    const standards = classStandards.map((cs) => {
      const standard = cs.standard;
      const objectives = standard.exampleObjectives;

      // Calculate objective completion status
      const objectiveStatuses = objectives.map((obj) => {
        const relevantSubmissions = submissions.filter((sub) => {
          const objectiveIds = sub.assessment.objectiveIds
            ? JSON.parse(sub.assessment.objectiveIds)
            : [];
          return objectiveIds.includes(obj.id);
        });

        const status = !relevantSubmissions.length
          ? 'not-started'
          : relevantSubmissions.some((s) => !s.submittedAt)
            ? 'not-started'
            : relevantSubmissions.every((s) => s.grade && s.grade >= 80)
              ? 'mastered'
              : 'in-progress';

        const latestSubmission = relevantSubmissions.sort(
          (a, b) =>
            new Date(b.submittedAt || 0).getTime() -
            new Date(a.submittedAt || 0).getTime()
        )[0];

        return {
          id: obj.id,
          text: obj.text,
          status,
          isMandatory: obj.isMandatory,
          submittedAt: latestSubmission?.submittedAt || null,
          grade: latestSubmission?.grade || null,
        };
      });

      // Calculate mastery percent
      const masteredCount = objectiveStatuses.filter(
        (o) => o.status === 'mastered'
      ).length;
      const masteryPercent =
        objectives.length > 0
          ? Math.round((masteredCount / objectives.length) * 100)
          : 0;

      // Determine overall status
      const overallStatus =
        masteryPercent >= 80
          ? 'mastered'
          : masteryPercent > 0
            ? 'in-progress'
            : 'not-started';

      // Simple trend calculation (could be enhanced)
      const trend = 'stable' as const;

      return {
        id: standard.id,
        name: standard.name,
        code: standard.code,
        masteryPercent,
        status: overallStatus,
        trend,
        celebration: null, // TODO: determine if student just mastered this
        objectives: objectiveStatuses,
      };
    });

    // Get teacher message
    const instructor = await prisma.user.findUnique({
      where: { id: k12Class.instructorId },
      select: { name: true },
    });

    return NextResponse.json({
      studentId: studentIdParam,
      studentName: 'Student', // TODO: get from student user record
      classId: params.classId,
      className: k12Class.name,
      standards,
      messageFromTeacher:
        `Great work! Keep pushing toward mastery. - ${instructor?.name || 'Your Teacher'}`,
    });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
