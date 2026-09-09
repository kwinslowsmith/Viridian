import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/k12-classes/[classId]/students/[studentId]/mastery
 * Calculates mastery status for a student across all standards in the class
 * Returns detailed mastery breakdown with objective scores and pass status
 */
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
    if (!classId || !studentId) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Verify user is instructor for this class or is the student
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: { instructorId: true },
    });

    if (!k12Class) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (k12Class.instructorId !== session.user.id && studentId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify student is enrolled
    const enrollment = await prisma.k12Enrollment.findUnique({
      where: {
        classId_studentId: { classId, studentId },
      },
      select: { id: true },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Student not enrolled in this class' },
        { status: 404 }
      );
    }

    // Get all assessments in the class with their linked objectives
    const assessments = await prisma.k12Assessment.findMany({
      where: { classId },
      select: {
        id: true,
        objectiveIds: true,
        submissions: {
          where: { enrollmentId: enrollment.id },
          select: {
            id: true,
            grade: true,
          },
        },
      },
    });

    // Get all standards in the class and their objectives
    const classStandards = await prisma.classStandard.findMany({
      where: { classId },
      select: {
        standard: {
          select: {
            id: true,
            code: true,
            name: true,
            passPercentage: true,
            mandatoryObjectiveIds: true,
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
    });

    // Calculate mastery for each standard
    const standards = await Promise.all(
      classStandards.map(async (cs) => {
        const standard = cs.standard;
        const passPercentage = standard.passPercentage || 80;
        const mandatoryObjectiveIds = standard.mandatoryObjectiveIds
          ? JSON.parse(standard.mandatoryObjectiveIds)
          : [];

        // Build map of objective scores from assessments
        const objectiveScores = new Map<string, number[]>();

        for (const obj of standard.exampleObjectives) {
          objectiveScores.set(obj.id, []);
        }

        // Find relevant assessments for this standard
        for (const assessment of assessments) {
          if (!assessment.objectiveIds) continue;
          const objIds = JSON.parse(assessment.objectiveIds);

          // Check if any objectives in this assessment are in this standard
          const relevantObjectives = objIds.filter((objId: string) =>
            standard.exampleObjectives.some((o) => o.id === objId)
          );

          if (relevantObjectives.length > 0 && assessment.submissions.length > 0) {
            const submission = assessment.submissions[0]; // Get latest submission
            if (submission.grade !== null) {
              for (const objId of relevantObjectives) {
                if (!objectiveScores.has(objId)) {
                  objectiveScores.set(objId, []);
                }
                objectiveScores.get(objId)!.push(submission.grade);
              }
            }
          }
        }

        // Calculate average scores
        const objectiveProgress = standard.exampleObjectives.map((obj) => {
          const scores = objectiveScores.get(obj.id) || [];
          const avgScore =
            scores.length > 0
              ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
              : 0;

          return {
            objectiveId: obj.id,
            label: obj.label,
            text: obj.text,
            isMandatory: obj.isMandatory || mandatoryObjectiveIds.includes(obj.id),
            score: avgScore,
            complete: avgScore >= passPercentage,
          };
        });

        // Calculate overall mastery
        const allScores = Array.from(objectiveScores.values()).flat();
        const masteryPercent =
          allScores.length > 0
            ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
            : 0;

        // Determine if standard is passed
        const mandatoryObjectivesPassed = objectiveProgress
          .filter((o) => o.isMandatory)
          .every((o) => o.score >= passPercentage);

        const passed =
          masteryPercent >= passPercentage && mandatoryObjectivesPassed;

        let reason = '';
        if (masteryPercent < passPercentage) {
          reason = `Passed ${masteryPercent}% but need ${passPercentage}%`;
        } else if (!mandatoryObjectivesPassed) {
          const failedMandatory = objectiveProgress
            .filter((o) => o.isMandatory && o.score < passPercentage)
            .map((o) => `Objective ${o.label}`)
            .join(', ');
          reason = `${failedMandatory} below ${passPercentage}%`;
        } else {
          reason = 'Standard mastered';
        }

        return {
          standardId: standard.id,
          standardCode: standard.code,
          standardName: standard.name,
          masteryPercent,
          passed,
          reason,
          objectives: objectiveProgress,
        };
      })
    );

    return NextResponse.json({
      studentId,
      classId,
      standards,
    });
  } catch (error) {
    console.error('Error calculating mastery:', error);
    return NextResponse.json(
      { error: 'Failed to calculate mastery' },
      { status: 500 }
    );
  }
}
