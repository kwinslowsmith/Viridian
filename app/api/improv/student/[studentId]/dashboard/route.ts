import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId } = await params;
    if (!studentId || typeof studentId !== 'string' || studentId.trim() === '') {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }

    // Students can only view their own dashboard
    if (session.user.id !== studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all classes this student is enrolled in
    const enrollments = await prisma.improvEnrollment.findMany({
      where: { studentId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            numWeeks: true,
            weeks: {
              select: {
                id: true,
                weekNum: true,
                title: true,
              },
              orderBy: { weekNum: 'asc' },
            },
          },
        },
      },
    });

    if (enrollments.length === 0) {
      return NextResponse.json({
        student: { id: studentId },
        classes: [],
      });
    }

    const enrollmentIds = enrollments.map(e => e.id);

    // Fetch all ratings and feedback in parallel (not per-enrollment)
    const [studentRatings, teacherRatings, feedback] = await Promise.all([
      prisma.improvStudentRating.findMany({
        where: { enrollmentId: { in: enrollmentIds } },
        select: {
          id: true,
          enrollmentId: true,
          weekId: true,
          skillId: true,
        },
      }),
      prisma.improvTeacherRating.findMany({
        where: { enrollmentId: { in: enrollmentIds } },
        select: {
          id: true,
          enrollmentId: true,
          level: true,
        },
      }),
      prisma.improvFeedback.findMany({
        where: {
          enrollmentId: { in: enrollmentIds },
          isVisible: true,
        },
        select: {
          id: true,
          enrollmentId: true,
          skillId: true,
          note: true,
        },
      }),
    ]);

    // Index by enrollmentId for efficient lookup
    const studentRatingsByEnrollment: Record<string, typeof studentRatings> = {};
    const teacherRatingsByEnrollment: Record<string, typeof teacherRatings> = {};
    const feedbackByEnrollment: Record<string, typeof feedback> = {};

    studentRatings.forEach(r => {
      if (!studentRatingsByEnrollment[r.enrollmentId]) {
        studentRatingsByEnrollment[r.enrollmentId] = [];
      }
      studentRatingsByEnrollment[r.enrollmentId].push(r);
    });

    teacherRatings.forEach(r => {
      if (!teacherRatingsByEnrollment[r.enrollmentId]) {
        teacherRatingsByEnrollment[r.enrollmentId] = [];
      }
      teacherRatingsByEnrollment[r.enrollmentId].push(r);
    });

    feedback.forEach(f => {
      if (!feedbackByEnrollment[f.enrollmentId]) {
        feedbackByEnrollment[f.enrollmentId] = [];
      }
      feedbackByEnrollment[f.enrollmentId].push(f);
    });

    const dashboards = enrollments.map((enrollment) => {
      const enrollmentStudentRatings = studentRatingsByEnrollment[enrollment.id] || [];
      const enrollmentTeacherRatings = teacherRatingsByEnrollment[enrollment.id] || [];
      const enrollmentFeedback = feedbackByEnrollment[enrollment.id] || [];

      // Calculate progress metrics
      const levelCounts = { approaching: 0, developing: 0, proficient: 0 };
      enrollmentTeacherRatings.forEach((rating) => {
        levelCounts[rating.level as keyof typeof levelCounts]++;
      });

      const totalRatings = enrollmentTeacherRatings.length || 1;
      const progressMetrics = {
        approaching: Math.round((levelCounts.approaching / totalRatings) * 100),
        developing: Math.round((levelCounts.developing / totalRatings) * 100),
        proficient: Math.round((levelCounts.proficient / totalRatings) * 100),
      };

      // Index student ratings by weekId for efficient lookup
      const studentRatingsByWeek: Record<string, typeof enrollmentStudentRatings> = {};
      enrollmentStudentRatings.forEach(r => {
        if (!studentRatingsByWeek[r.weekId]) {
          studentRatingsByWeek[r.weekId] = [];
        }
        studentRatingsByWeek[r.weekId].push(r);
      });

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
          completedRatings: (studentRatingsByWeek[week.id] || []).length,
        })),
        ratings: {
          student: enrollmentStudentRatings,
          teacher: enrollmentTeacherRatings,
        },
        feedback: enrollmentFeedback,
        progress: progressMetrics,
      };
    });

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
