import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId } = await params;
    if (!classId || typeof classId !== 'string' || classId.trim() === '') {
      return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 });
    }

    // Verify user is the instructor for this class
    const improvClass = await prisma.improvClass.findUnique({
      where: { id: classId },
      include: {
        enrollments: {
          select: { studentId: true },
        },
        weeks: {
          select: {
            weekSkills: {
              select: { skillId: true },
            },
          },
        },
      },
    });

    if (!improvClass || improvClass.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!improvClass.enrollments || improvClass.enrollments.length === 0) {
      return NextResponse.json({
        classId,
        className: improvClass.name,
        classOverallMastery: 0,
        skills: [],
        objectives: [],
        studentMasteryGrid: [],
        students: [],
      });
    }

    // Get all unique skills and objectives in one query
    const skillIds = new Set<string>();
    improvClass.weeks.forEach(week => {
      week.weekSkills.forEach(ws => {
        skillIds.add(ws.skillId);
      });
    });

    if (skillIds.size === 0) {
      return NextResponse.json({
        classId,
        className: improvClass.name,
        classOverallMastery: 0,
        skills: [],
        objectives: [],
        studentMasteryGrid: improvClass.enrollments.map(e => ({
          studentId: e.studentId,
          skillMastery: {},
        })),
        students: improvClass.enrollments.map(e => ({
          id: e.studentId,
        })),
      });
    }

    const skillIds_array = Array.from(skillIds);
    const studentIds = improvClass.enrollments.map(e => e.studentId);

    // Fetch objectives and assessments in parallel
    const [objectives, assessments, skills] = await Promise.all([
      prisma.improvObjective.findMany({
        where: { skillId: { in: skillIds_array } },
        include: { skill: true },
      }),
      prisma.improvObjectiveAssessment.findMany({
        where: { classId },
        select: {
          id: true,
          studentId: true,
          objectiveId: true,
          status: true,
          teacherRating: true,
          submittedAt: true,
        },
      }),
      prisma.improvSkill.findMany({
        where: { id: { in: skillIds_array } },
      }),
    ]);

    // Index assessments by objectiveId for efficient lookup
    const assessmentsByObjective: Record<string, typeof assessments> = {};
    const assessmentsByStudent: Record<string, typeof assessments> = {};

    assessments.forEach(a => {
      if (!assessmentsByObjective[a.objectiveId]) {
        assessmentsByObjective[a.objectiveId] = [];
      }
      assessmentsByObjective[a.objectiveId].push(a);

      if (!assessmentsByStudent[a.studentId]) {
        assessmentsByStudent[a.studentId] = [];
      }
      assessmentsByStudent[a.studentId].push(a);
    });

    // Calculate mastery stats for each objective
    const objectiveStats = objectives.map(obj => {
      const objAssessments = assessmentsByObjective[obj.id] || [];
      const masteredCount = objAssessments.filter(
        a => a.status === 'graded' && a.teacherRating === 1
      ).length;
      const totalAttempts = objAssessments.filter(a => a.submittedAt).length;

      return {
        id: obj.id,
        skillId: obj.skillId,
        skillName: obj.skill.name,
        text: obj.text,
        description: obj.description,
        examples: obj.examples,
        assessmentGuidance: obj.assessmentGuidance,
        isMandatory: obj.isMandatory,
        masteredCount,
        totalAttempts,
        masteryPercent: totalAttempts > 0 ? Math.round((masteredCount / totalAttempts) * 100) : 0,
      };
    });

    // Build student mastery grid
    const skillObjectivesBySkillId: Record<string, typeof objectives> = {};
    objectives.forEach(obj => {
      if (!skillObjectivesBySkillId[obj.skillId]) {
        skillObjectivesBySkillId[obj.skillId] = [];
      }
      skillObjectivesBySkillId[obj.skillId].push(obj);
    });

    const studentMasteryGrid = studentIds.map(studentId => {
      const studentAssessments = assessmentsByStudent[studentId] || [];
      const assessmentMap = new Map(studentAssessments.map(a => [a.objectiveId, a]));

      const skillMastery: Record<string, number> = {};
      skillIds_array.forEach(skillId => {
        const skillObjectives = skillObjectivesBySkillId[skillId] || [];
        const masteredCount = skillObjectives.filter(obj => {
          const assessment = assessmentMap.get(obj.id);
          return assessment?.status === 'graded' && assessment?.teacherRating === 1;
        }).length;

        skillMastery[skillId] = skillObjectives.length > 0
          ? Math.round((masteredCount / skillObjectives.length) * 100)
          : 0;
      });

      return { studentId, skillMastery };
    });

    // Calculate class averages
    const classAverageBySkill: Record<string, number> = {};
    skillIds_array.forEach(skillId => {
      const skillMasteryValues = studentMasteryGrid.map(s => s.skillMastery[skillId] || 0);
      const avgValue = skillMasteryValues.length > 0
        ? Math.round(skillMasteryValues.reduce((a, b) => a + b, 0) / skillMasteryValues.length)
        : 0;
      classAverageBySkill[skillId] = avgValue;
    });

    const classOverallMasteryValues = Object.values(classAverageBySkill);
    const classOverallMastery = classOverallMasteryValues.length > 0
      ? Math.round(classOverallMasteryValues.reduce((a, b) => a + b, 0) / classOverallMasteryValues.length)
      : 0;

    return NextResponse.json({
      classId,
      className: improvClass.name,
      classOverallMastery,
      skills: skills.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        classAverage: classAverageBySkill[s.id] || 0,
      })),
      objectives: objectiveStats,
      studentMasteryGrid,
      students: improvClass.enrollments.map(e => ({
        id: e.studentId,
        // Will be populated by client if needed
      })),
    });
  } catch (error) {
    console.error('Failed to fetch progress dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress dashboard' },
      { status: 500 }
    );
  }
}
