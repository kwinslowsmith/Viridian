import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET student progress for a class
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

    // Verify student is in this class (or requesting their own progress)
    if (session.user.id !== studentId) {
      const improvClass = await prisma.improvClass.findUnique({
        where: { id: classId },
      });
      if (!improvClass || improvClass.instructorId !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    const enrollment = await prisma.improvEnrollment.findUnique({
      where: {
        classId_studentId: { classId, studentId },
      },
      include: {
        class: { select: { id: true, name: true } },
        student: { select: { id: true, name: true } },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Student not enrolled in this class' },
        { status: 404 }
      );
    }

    // Get all assessments for this student in this class
    const assessments = await prisma.improvSkillAssessment.findMany({
      where: { classId, studentId },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            category: true,
            categoryIcon: true,
            categoryColor: true,
            levelDefinitions: true,
          },
        },
      },
      orderBy: { skill: { name: 'asc' } },
    });

    // Format with history and level definitions
    const assessmentsWithDetails = assessments.map(a => ({
      id: a.id,
      skillId: a.skillId,
      skillName: a.skill.name,
      skillCategory: a.skill.category,
      currentStudentLevel: a.studentSelfLevel,
      currentTeacherLevel: a.teacherLevel,
      currentLevel: a.teacherLevel || a.studentSelfLevel, // Teacher level takes precedence
      teacherNote: a.teacherNote,
      history: a.history ? JSON.parse(a.history) : [],
      levelDefinitions: a.skill.levelDefinitions ? JSON.parse(a.skill.levelDefinitions) : {},
    }));

    // Calculate overall mastery %
    const ratedSkills = assessmentsWithDetails.filter(a => a.currentLevel);
    const masteredCount = ratedSkills.filter(a => a.currentLevel === 4 || a.currentLevel === 3).length;
    const totalRated = ratedSkills.length;
    const masteryPercent = totalRated > 0 ? Math.round((masteredCount / totalRated) * 100) : 0;

    return NextResponse.json({
      student: enrollment.student,
      class: enrollment.class,
      assessments: assessmentsWithDetails,
      summary: {
        masteryPercent,
        totalSkillsRated: totalRated,
        proficient: ratedSkills.filter(a => a.currentLevel === 3).length,
        advanced: ratedSkills.filter(a => a.currentLevel === 4).length,
        developing: ratedSkills.filter(a => a.currentLevel === 2).length,
        approaching: ratedSkills.filter(a => a.currentLevel === 1).length,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch student progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student progress' },
      { status: 500 }
    );
  }
}
