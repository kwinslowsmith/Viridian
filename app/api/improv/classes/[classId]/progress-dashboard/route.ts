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

    // Verify user is the instructor for this class
    const improvClass = await prisma.improvClass.findUnique({
      where: { id: classId },
      include: {
        enrollments: true,
        weeks: {
          include: {
            weekSkills: {
              include: { skill: true },
            },
          },
        },
      },
    });

    if (!improvClass || improvClass.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all unique skills in the class
    const skillIds = new Set<string>();
    improvClass.weeks.forEach(week => {
      week.weekSkills.forEach(ws => {
        skillIds.add(ws.skillId);
      });
    });

    // Fetch all objectives for these skills
    const objectives = await prisma.improvObjective.findMany({
      where: {
        skillId: { in: Array.from(skillIds) },
      },
      include: {
        skill: true,
      },
    });

    // Get all student assessments
    const assessments = await prisma.improvObjectiveAssessment.findMany({
      where: { classId },
      include: {
        student: { select: { id: true, name: true } },
        objective: true,
      },
    });

    // Calculate mastery stats for each objective
    const objectiveStats = objectives.map(obj => {
      const objAssessments = assessments.filter(a => a.objectiveId === obj.id);
      const masteredCount = objAssessments.filter(
        a => a.status === 'graded' || a.teacherRating === 1
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
    const students = improvClass.enrollments.map(e => e.studentId);
    const studentMasteryGrid = students.map(studentId => {
      const studentAssessments = assessments.filter(a => a.studentId === studentId);

      const skillMastery: Record<string, number> = {};
      skillIds.forEach(skillId => {
        const skillObjectives = objectives.filter(o => o.skillId === skillId);
        const masteredCount = skillObjectives.filter(obj => {
          const assessment = studentAssessments.find(a => a.objectiveId === obj.id);
          return assessment?.status === 'graded' || assessment?.teacherRating === 1;
        }).length;

        skillMastery[skillId] = skillObjectives.length > 0
          ? Math.round((masteredCount / skillObjectives.length) * 100)
          : 0;
      });

      return {
        studentId,
        skillMastery,
      };
    });

    // Calculate class averages
    const classAverageBySkill: Record<string, number> = {};
    skillIds.forEach(skillId => {
      const skillMasteryValues = studentMasteryGrid.map(s => s.skillMastery[skillId] || 0);
      classAverageBySkill[skillId] = Math.round(
        skillMasteryValues.reduce((a, b) => a + b, 0) / skillMasteryValues.length
      );
    });

    // Get skill details
    const skills = await prisma.improvSkill.findMany({
      where: { id: { in: Array.from(skillIds) } },
    });

    const classOverallMastery = Math.round(
      Object.values(classAverageBySkill).reduce((a, b) => a + b, 0) /
      Object.values(classAverageBySkill).length
    );

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
