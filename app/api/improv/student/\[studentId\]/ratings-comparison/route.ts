import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params;
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const weekId = searchParams.get('weekId');

    if (!classId || !weekId) {
      return NextResponse.json(
        { error: 'Missing required query params: classId, weekId' },
        { status: 400 }
      );
    }

    // Get enrollment
    const enrollment = await prisma.improvEnrollment.findFirst({
      where: { studentId, classId },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Student not enrolled in this class' },
        { status: 404 }
      );
    }

    // Get student and teacher ratings for this week
    const studentRatings = await prisma.improvStudentRating.findMany({
      where: {
        enrollmentId: enrollment.id,
        weekId,
      },
      include: { skill: true },
    });

    const teacherRatings = await prisma.improvTeacherRating.findMany({
      where: {
        enrollmentId: enrollment.id,
        weekId,
      },
      include: { skill: true },
    });

    // Get feedback for this week
    const feedback = await prisma.improvFeedback.findMany({
      where: {
        enrollmentId: enrollment.id,
        weekId,
        isVisible: true,
      },
      include: { skill: true },
    });

    // Get all skills for this week
    const week = await prisma.improvWeek.findUnique({
      where: { id: weekId },
      include: {
        weekSkills: { include: { skill: true } },
      },
    });

    if (!week) {
      return NextResponse.json(
        { error: 'Week not found' },
        { status: 404 }
      );
    }

    // Build skill comparisons
    const skillComparisons = week.weekSkills.map((ws) => {
      const studentRating = studentRatings.find(
        (r) => r.skillId === ws.skillId
      );
      const teacherRating = teacherRatings.find(
        (r) => r.skillId === ws.skillId
      );
      const skillFeedback = feedback.filter(
        (f) => f.skillId === ws.skillId
      );

      // Check for discrepancy
      const levelMap = { approaching: 0, developing: 1, proficient: 2 };
      let discrepancy = false;
      if (studentRating && teacherRating) {
        const studentLevel =
          levelMap[studentRating.level as keyof typeof levelMap];
        const teacherLevel =
          levelMap[teacherRating.level as keyof typeof levelMap];
        discrepancy = Math.abs(studentLevel - teacherLevel) > 1;
      }

      return {
        skillId: ws.skill.id,
        skillName: ws.skill.name,
        skillCategory: ws.skill.category,
        studentRating: studentRating
          ? {
              level: studentRating.level,
              narrative: studentRating.narrative,
              evidence: studentRating.evidence,
              createdAt: studentRating.createdAt,
              revisedAt: studentRating.revisedAt,
            }
          : null,
        teacherRating: teacherRating
          ? {
              level: teacherRating.level,
              instructorNotes: teacherRating.instructorNotes,
              createdAt: teacherRating.createdAt,
            }
          : null,
        discrepancy,
        feedback: skillFeedback.map((f) => ({
          id: f.id,
          note: f.note,
          createdAt: f.createdAt,
        })),
      };
    });

    const user = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true },
    });

    return NextResponse.json({
      student: user,
      skillComparisons,
    });
  } catch (error) {
    console.error('Error fetching ratings comparison:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings comparison' },
      { status: 500 }
    );
  }
}
