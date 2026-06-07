import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params;

    // Get all classes this student is enrolled in
    const enrollments = await prisma.improvEnrollment.findMany({
      where: { studentId },
      include: {
        class: {
          include: {
            weeks: { orderBy: { weekNum: 'asc' } },
          },
        },
      },
    });

    const dashboards = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Get all ratings for this student in this class
        const studentRatings = await prisma.improvStudentRating.findMany({
          where: {
            enrollmentId: enrollment.id,
          },
          include: {
            skill: true,
            week: true,
          },
        });

        const teacherRatings = await prisma.improvTeacherRating.findMany({
          where: {
            enrollmentId: enrollment.id,
          },
          include: {
            skill: true,
            week: true,
          },
        });

        const feedback = await prisma.improvFeedback.findMany({
          where: {
            enrollmentId: enrollment.id,
            isVisible: true,
          },
          include: {
            skill: true,
          },
        });

        // Calculate progress metrics
        const levelCounts = { approaching: 0, developing: 0, proficient: 0 };
        teacherRatings.forEach((rating) => {
          levelCounts[rating.level as keyof typeof levelCounts]++;
        });

        const totalRatings = teacherRatings.length || 1;
        const progressMetrics = {
          approaching: Math.round((levelCounts.approaching / totalRatings) * 100),
          developing: Math.round((levelCounts.developing / totalRatings) * 100),
          proficient: Math.round((levelCounts.proficient / totalRatings) * 100),
        };

        return {
          class: {
            id: enrollment.class.id,
            name: enrollment.class.name,
            numWeeks: enrollment.class.numWeeks,
          },
          weeks: enrollment.class.weeks.map((week) => ({
            id: week.id,
            weekNum: week.weekNum,
            title: week.title,
            completedRatings: studentRatings.filter(
              (r) => r.weekId === week.id
            ).length,
          })),
          ratings: {
            student: studentRatings,
            teacher: teacherRatings,
          },
          feedback,
          progress: progressMetrics,
        };
      })
    );

    return NextResponse.json({
      student: {
        id: studentId,
      },
      classes: dashboards,
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student dashboard' },
      { status: 500 }
    );
  }
}
