import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyStudentInClass } from '@/lib/api/k12-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { classId } = await params;
  const studentId = session.user.id;

  try {
    // Verify student is enrolled in class
    const authResult = await verifyStudentInClass(studentId, classId);
    if (!authResult.valid) {
      return NextResponse.json(
        { error: authResult.error },
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

    // Fetch this student's enrollment
    const enrollment = await prisma.k12Enrollment.findFirst({
      where: {
        classId,
        studentId,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Student not enrolled in this class' },
        { status: 404 }
      );
    }

    // Fetch all assessments and this student's submissions
    const assessments = await prisma.k12Assessment.findMany({
      where: { classId },
      include: {
        submissions: {
          where: { enrollmentId: enrollment.id },
          select: {
            id: true,
            grade: true,
            submittedAt: true,
            status: true,
          },
        },
      },
    });

    // Build student progress map: objective -> submission grades
    const studentProgressByObjective = new Map<string, { grades: number[]; lastSubmittedAt: Date | null }>();

    assessments.forEach(assessment => {
      if (!assessment.objectiveIds) return;

      const objectiveIds = typeof assessment.objectiveIds === 'string'
        ? JSON.parse(assessment.objectiveIds)
        : assessment.objectiveIds;

      if (!Array.isArray(objectiveIds)) return;

      objectiveIds.forEach(objId => {
        if (!studentProgressByObjective.has(objId)) {
          studentProgressByObjective.set(objId, { grades: [], lastSubmittedAt: null });
        }

        const progress = studentProgressByObjective.get(objId)!;
        assessment.submissions.forEach(sub => {
          if (sub.grade) {
            progress.grades.push(sub.grade);
          }
          if (sub.submittedAt) {
            if (!progress.lastSubmittedAt || sub.submittedAt > progress.lastSubmittedAt) {
              progress.lastSubmittedAt = sub.submittedAt;
            }
          }
        });
      });
    });

    // Transform into response format
    const standards = classStandards.map(cs => {
      const mandatoryCount = cs.standard.exampleObjectives.filter(o => o.isMandatory).length;
      const totalCount = cs.standard.exampleObjectives.length;

      // Calculate overall standard mastery for this student
      const objectiveScores = cs.standard.exampleObjectives.map(obj => {
        const progress = studentProgressByObjective.get(obj.id);
        if (!progress || progress.grades.length === 0) return 0;
        return Math.round(progress.grades.reduce((a, b) => a + b, 0) / progress.grades.length);
      });

      const standardMasteryPercent = objectiveScores.length > 0
        ? Math.round(objectiveScores.reduce((a: number, b: number) => a + b, 0) / objectiveScores.length)
        : 0;

      // Determine standard mastery status
      let standardMasteryStatus = 'not_started';
      if (standardMasteryPercent >= (cs.standard.passPercentage || 80)) {
        standardMasteryStatus = 'proficient';
      } else if (standardMasteryPercent >= 60) {
        standardMasteryStatus = 'developing';
      } else if (standardMasteryPercent > 0) {
        standardMasteryStatus = 'approaching';
      }

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
        standardMasteryPercent,
        standardMasteryStatus,
        objectives: cs.standard.exampleObjectives.map(obj => {
          const progress = studentProgressByObjective.get(obj.id);
          const masteryPercent = progress && progress.grades.length > 0
            ? Math.round(progress.grades.reduce((a: number, b: number) => a + b, 0) / progress.grades.length)
            : 0;

          // Determine mastery status
          let masteryStatus = 'not_started';
          if (masteryPercent >= (cs.standard.passPercentage || 80)) {
            masteryStatus = 'proficient';
          } else if (masteryPercent >= 60) {
            masteryStatus = 'developing';
          } else if (masteryPercent > 0) {
            masteryStatus = 'approaching';
          }

          return {
            objectiveId: obj.id,
            label: obj.label,
            text: obj.text,
            description: obj.description,
            sequenceNum: obj.sequenceNum,
            isMandatory: obj.isMandatory,
            studentProgress: {
              masteryStatus,
              masteryPercent,
              submittedAt: progress?.lastSubmittedAt ? progress.lastSubmittedAt.toISOString() : null,
              grade: progress && progress.grades.length > 0
                ? String.fromCharCode(65 + Math.max(0, Math.min(4, Math.floor((100 - masteryPercent) / 20))))
                : null,
              submissions: progress?.grades.map((score, idx) => ({
                score,
                submittedAt: progress.lastSubmittedAt?.toISOString() || new Date().toISOString(),
              })) || [],
            },
            materials: materialsMap.get(obj.id) || [],
            teacherNotes: notesMap.get(obj.id) || '',
            masterySummary:
              masteryStatus === 'proficient'
                ? 'You\'ve mastered this objective!'
                : masteryStatus === 'developing'
                  ? 'You\'re making progress on this objective.'
                  : 'Keep working on this objective.',
          };
        }),
      };
    });

    return NextResponse.json({ standards });
  } catch (error) {
    console.error('Failed to fetch student standards-objectives:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
