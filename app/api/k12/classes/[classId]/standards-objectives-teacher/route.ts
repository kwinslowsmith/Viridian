import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { classId } = await params;

  try {
    // Verify teacher owns this class
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: { instructorId: true },
    });

    if (!k12Class || k12Class.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to view this class' },
        { status: 403 }
      );
    }

    // Fetch all standards for this class with their objectives
    const classStandards = await prisma.classStandard.findMany({
      where: { classId },
      include: {
        standard: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            passPercentage: true,
            exampleObjectives: {
              orderBy: { sequenceNum: 'asc' },
              select: {
                id: true,
                label: true,
                text: true,
                description: true,
                isMandatory: true,
                sequenceNum: true,
              },
            },
            unit: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Fetch teacher notes and materials
    const [objectiveNotes, objectiveMaterials] = await Promise.all([
      prisma.teacherObjectiveNote.findMany({
        where: { classId },
      }),
      prisma.objectiveMaterial.findMany({
        where: { classId },
      }),
    ]);

    // Build maps for quick lookup
    const notesMap = new Map(objectiveNotes.map(n => [n.objectiveId, n.teacherNotes]));
    const materialsMap = new Map<string, any[]>();
    objectiveMaterials.forEach(m => {
      if (!materialsMap.has(m.objectiveId)) {
        materialsMap.set(m.objectiveId, []);
      }
      materialsMap.get(m.objectiveId)!.push({
        id: m.id,
        title: m.title,
        type: m.type,
        url: m.url,
        uploadedAt: m.uploadedAt.toISOString(),
      });
    });

    // Fetch all enrollments
    const enrollments = await prisma.k12Enrollment.findMany({
      where: { classId },
      select: {
        id: true,
        studentId: true,
        student: { select: { id: true, name: true } },
      },
    });

    // Fetch all assessments and submissions for this class
    const assessments = await prisma.k12Assessment.findMany({
      where: { classId },
      include: {
        submissions: {
          select: {
            id: true,
            enrollmentId: true,
            grade: true,
            submittedAt: true,
            status: true,
          },
        },
      },
    });

    // Build student progress map: objective -> enrollment -> grade/submission info
    const studentProgressByObjective = new Map<string, Map<string, any>>();

    assessments.forEach(assessment => {
      if (!assessment.objectiveIds) return;

      const objectiveIds = typeof assessment.objectiveIds === 'string'
        ? JSON.parse(assessment.objectiveIds)
        : assessment.objectiveIds;

      if (!Array.isArray(objectiveIds)) return;

      objectiveIds.forEach(objId => {
        if (!studentProgressByObjective.has(objId)) {
          studentProgressByObjective.set(objId, new Map());
        }

        const enrollmentMap = studentProgressByObjective.get(objId)!;
        assessment.submissions.forEach(sub => {
          const grades = enrollmentMap.get(sub.enrollmentId) || [];
          grades.push({
            grade: sub.grade || 0,
            submittedAt: sub.submittedAt,
            status: sub.status,
          });
          enrollmentMap.set(sub.enrollmentId, grades);
        });
      });
    });

    // Transform into response format
    const standards = classStandards.map(cs => {
      const mandatoryCount = cs.standard.exampleObjectives.filter(o => o.isMandatory).length;
      const totalCount = cs.standard.exampleObjectives.length;

      return {
        standardId: cs.standard.id,
        standardCode: cs.standard.code,
        standardName: cs.standard.name,
        description: cs.standard.description,
        unitId: cs.standard.unit?.id,
        unitName: cs.standard.unit?.name,
        requiredObjectiveCount: mandatoryCount,
        totalObjectiveCount: totalCount,
        classPassPercentage: cs.standard.passPercentage || 80,
        objectives: cs.standard.exampleObjectives.map(obj => {
          const enrollmentProgression = studentProgressByObjective.get(obj.id) || new Map();
          const allGradesByObjective: number[] = [];

          // Build student progress array
          const studentProgressArray = enrollments.map(e => {
            const grades = enrollmentProgression.get(e.id) || [];
            const avgGrade = grades.length > 0
              ? Math.round(grades.reduce((sum: number, g: any) => sum + g.grade, 0) / grades.length)
              : 0;
            const lastSubmission = grades.length > 0
              ? grades[grades.length - 1]
              : null;

            allGradesByObjective.push(avgGrade);

            // Determine mastery status
            let masteryStatus = 'not_started';
            if (avgGrade >= (cs.standard.passPercentage || 80)) {
              masteryStatus = 'proficient';
            } else if (avgGrade >= 60) {
              masteryStatus = 'developing';
            } else if (avgGrade > 0) {
              masteryStatus = 'approaching';
            }

            return {
              studentId: e.studentId,
              studentName: e.student.name,
              masteryStatus,
              masteryPercent: avgGrade,
              submittedAt: lastSubmission?.submittedAt ? new Date(lastSubmission.submittedAt).toISOString() : null,
              grade: lastSubmission?.grade ? String.fromCharCode(65 + Math.max(0, Math.min(4, Math.floor((100 - lastSubmission.grade) / 20)))) : null,
            };
          });

          // Calculate assessment frequency
          const allSubmissionsForObjective = Array.from(enrollmentProgression.values()).flat();
          const latestSubmission = allSubmissionsForObjective.length > 0
            ? new Date(Math.max(...allSubmissionsForObjective.map(s => new Date(s.submittedAt || 0).getTime())))
            : null;
          const lastAssessedDaysAgo = latestSubmission
            ? Math.floor((Date.now() - latestSubmission.getTime()) / (1000 * 60 * 60 * 24))
            : null;

          const avgClassScore = allGradesByObjective.length > 0
            ? Math.round(allGradesByObjective.reduce((a: number, b: number) => a + b, 0) / allGradesByObjective.length)
            : 0;

          return {
            objectiveId: obj.id,
            label: obj.label,
            text: obj.text,
            description: obj.description,
            sequenceNum: obj.sequenceNum,
            isMandatory: obj.isMandatory,
            needsAssessmentFrequency: lastAssessedDaysAgo !== null && lastAssessedDaysAgo > 14,
            assessmentFrequencyMetric: {
              lastAssessedDaysAgo,
              submissionCount: allSubmissionsForObjective.length,
              averageScore: avgClassScore,
            },
            studentProgress: studentProgressArray,
            materials: materialsMap.get(obj.id) || [],
            teacherNotes: notesMap.get(obj.id) || '',
          };
        }),
      };
    });

    return NextResponse.json({ standards });
  } catch (error) {
    console.error('Failed to fetch teacher standards-objectives:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
