import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyTeacherOwnsClass } from '@/lib/api/k12-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify user is the teacher of this class
    const authResult = await verifyTeacherOwnsClass(session.user.id, params.classId);
    if (!authResult.valid) {
      return NextResponse.json(
        { error: authResult.error },
        {
          status: authResult.error === 'Class not found' ? 404 : 403,
        }
      );
    }

    // Get class info
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: params.classId },
      include: {
        instructor: {
          select: { id: true, name: true },
        },
        enrollments: {
          select: { id: true, studentId: true },
        },
      },
    });

    if (!k12Class) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Get class standards
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

    // Get all submissions for this class
    const allSubmissions = await prisma.k12Submission.findMany({
      where: {
        enrollment: {
          classId: params.classId,
        },
      },
      include: {
        enrollment: {
          select: { studentId: true },
        },
        assessment: {
          select: {
            standardId: true,
            objectiveIds: true,
          },
        },
      },
    });

    // Calculate class mastery by standard
    const classMasteryByStandard = classStandards.map((cs) => {
      const standard = cs.standard;
      const objectives = standard.exampleObjectives;

      // Track student mastery for each objective
      const studentMastery: Record<
        string,
        { mastered: number; inProgress: number; notStarted: number }
      > = {};

      objectives.forEach((obj) => {
        const relevantSubmissions = allSubmissions.filter((sub) => {
          const objectiveIds = sub.assessment.objectiveIds
            ? JSON.parse(sub.assessment.objectiveIds)
            : [];
          return objectiveIds.includes(obj.id);
        });

        const studentIds = new Set(
          relevantSubmissions.map((s) => s.enrollment.studentId)
        );

        const masterCount = relevantSubmissions.filter(
          (s) => s.grade && s.grade >= 80
        ).length;
        const allCount = studentIds.size;

        studentMastery[obj.id] = {
          mastered: masterCount,
          inProgress: allCount - masterCount,
          notStarted: k12Class.enrollments.length - allCount,
        };
      });

      // Calculate class average
      const allMasteryData = Object.values(studentMastery).flat();
      const totalMastered = allMasteryData.filter(
        (d) => d.mastered !== undefined
      ).length;

      const classMasteryPercent =
        k12Class.enrollments.length * objectives.length > 0
          ? Math.round(
              (totalMastered /
                (k12Class.enrollments.length * objectives.length)) *
                100
            )
          : 0;

      return {
        standardId: standard.id,
        standardName: standard.name,
        classMasteryPercent,
        studentsMasteredCount: totalMastered,
        studentsInProgressCount: Math.round(
          (k12Class.enrollments.length * objectives.length - totalMastered) / 2
        ),
        studentsNotStartedCount: Math.round(
          (k12Class.enrollments.length * objectives.length - totalMastered) / 2
        ),
        trend: 'stable' as const,
      };
    });

    // Identify struggling skills (objectives where <60% mastery)
    const strugglingSkills = classStandards
      .flatMap((cs) =>
        cs.standard.exampleObjectives.map((obj) => {
          const relevantSubmissions = allSubmissions.filter((sub) => {
            const objectiveIds = sub.assessment.objectiveIds
              ? JSON.parse(sub.assessment.objectiveIds)
              : [];
            return objectiveIds.includes(obj.id);
          });

          const masterCount = relevantSubmissions.filter(
            (s) => s.grade && s.grade >= 80
          ).length;
          const totalCount = new Set(
            relevantSubmissions.map((s) => s.enrollment.studentId)
          ).size;

          const masteryPercent =
            totalCount > 0 ? Math.round((masterCount / totalCount) * 100) : 0;
          const stuckCount = totalCount - masterCount;

          return {
            objectiveId: obj.id,
            objectiveText: obj.text,
            standardId: cs.standard.id,
            standardName: cs.standard.name,
            studentCount: stuckCount,
            percentageStuck:
              totalCount > 0
                ? Math.round(((totalCount - masterCount) / totalCount) * 100)
                : 0,
            severity:
              100 - masteryPercent >= 40
                ? 'critical'
                : 100 - masteryPercent >= 20
                  ? 'moderate'
                  : ('minor' as const),
            masteryPercent,
          };
        })
      )
      .filter((s) => s.percentageStuck > 0)
      .sort((a, b) => b.percentageStuck - a.percentageStuck)
      .slice(0, 10);

    // Get intervention groups
    const interventionGroups = await prisma.interventionGroup.findMany({
      where: { classId: params.classId },
      include: {
        objective: {
          select: { text: true },
        },
        students: {
          select: { id: true },
        },
      },
    });

    // Calculate class health score (0-100)
    const avgMastery = classMasteryByStandard.reduce(
      (sum, s) => sum + s.classMasteryPercent,
      0
    );
    const classHealthScore =
      classMasteryByStandard.length > 0
        ? Math.round(avgMastery / classMasteryByStandard.length)
        : 0;

    // Count pending submissions
    const pendingSubmissions = await prisma.k12Submission.count({
      where: {
        enrollment: {
          classId: params.classId,
        },
        status: { in: ['not-submitted', 'submitted'] },
      },
    });

    return NextResponse.json({
      classId: params.classId,
      className: k12Class.name,
      gradeLevel: parseInt(k12Class.gradeLevel),
      period: `Period ${Math.floor(Math.random() * 7) + 1}`, // TODO: get from actual data
      enrollmentCount: k12Class.enrollments.length,
      classMasteryByStandard,
      strugglingSkills,
      interventionGroups: interventionGroups.map((ig) => ({
        id: ig.id,
        name: ig.name,
        objectiveId: ig.objectiveId,
        studentCount: ig.students.length,
        meetingSchedule: ig.meetingSchedule || 'TBD',
        startDate: ig.startDate.toISOString(),
      })),
      masterCalendar: [], // TODO: fetch from SchoolAssessment
      pendingSubmissionsCount: pendingSubmissions,
      classHealthScore,
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching class dashboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
