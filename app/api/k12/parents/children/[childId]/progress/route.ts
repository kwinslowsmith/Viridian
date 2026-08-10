import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyParentChildRelationship } from '@/lib/api/k12-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { childId } = await params;

  try {
    // Verify parent-child relationship
    const authResult = await verifyParentChildRelationship(
      session.user.id,
      childId
    );

    if (!authResult.valid) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 403 }
      );
    }

    // Get child info
    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: {
        name: true,
        k12Enrollments: {
          select: {
            id: true,
            classId: true,
            class: {
              select: {
                id: true,
                name: true,
                gradeLevel: true,
                instructor: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { enrolledAt: 'desc' },
          take: 1, // Most recent class
        },
      },
    });

    if (!child || child.k12Enrollments.length === 0) {
      return NextResponse.json(
        { error: 'No enrollments found for this child' },
        { status: 404 }
      );
    }

    const enrollment = child.k12Enrollments[0];
    const classInfo = enrollment.class;

    // Get all standards for the class
    const classStandards = await prisma.classStandard.findMany({
      where: { classId: classInfo.id },
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

    // Get child's submissions
    const submissions = await prisma.k12Submission.findMany({
      where: { enrollmentId: enrollment.id },
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

    // Build standards with parent-friendly descriptions
    const standards = classStandards.map((cs) => {
      const standard = cs.standard;
      const objectives = standard.exampleObjectives;

      // Calculate objective statuses
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

        return {
          text: obj.text,
          status,
          isMandatory: obj.isMandatory,
        };
      });

      // Calculate mastery
      const masteredCount = objectiveStatuses.filter(
        (o) => o.status === 'mastered'
      ).length;
      const masteryPercent =
        objectives.length > 0
          ? Math.round((masteredCount / objectives.length) * 100)
          : 0;

      const status =
        masteryPercent >= 80
          ? 'on-track'
          : masteryPercent > 0
            ? 'needs-support'
            : 'not-started';

      return {
        id: standard.id,
        name: standard.name,
        code: standard.code,
        masteryPercent,
        status,
        description: standard.description || `Learning standard: ${standard.name}`,
        whatItMeans: `Your child is learning about ${standard.name}. At mastery, they can apply these skills in real situations and explain their understanding.`,
        howToHelp: [
          `Ask them to explain what they've learned about "${standard.name}"`,
          `Find real-world examples together related to this topic`,
          'Practice the skills at home in everyday situations',
          'Review their recent assignments and provide encouragement',
        ],
        objectives: objectiveStatuses,
        recommendedResources: [
          {
            title: 'Khan Academy: ' + standard.name,
            type: 'video',
            url: 'https://www.khanacademy.org',
          },
        ],
      };
    });

    // Get master calendar events
    const masterCalendarEvents = await prisma.schoolAssessment.findMany({
      where: {
        organizationId: classInfo.organizationId || undefined,
      },
      orderBy: { assessmentDate: 'asc' },
      take: 10,
    });

    return NextResponse.json({
      childId,
      childName: child.name,
      gradeLevel: parseInt(classInfo.gradeLevel),
      classId: classInfo.id,
      className: classInfo.name,
      teacher: {
        name: classInfo.instructor.name,
        email: classInfo.instructor.email,
      },
      standards,
      masterCalendarEvents: masterCalendarEvents.map((event) => ({
        id: event.id,
        name: event.name,
        date: event.assessmentDate.toISOString(),
        type: event.type,
        standardsAssessed: event.standardsAssessed
          ? JSON.parse(event.standardsAssessed)
          : [],
      })),
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching parent progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
