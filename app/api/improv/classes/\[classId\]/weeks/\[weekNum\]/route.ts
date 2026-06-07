import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string; weekNum: string } }
) {
  try {
    const { classId, weekNum } = params;
    const weekNumber = parseInt(weekNum, 10);

    const week = await prisma.improvWeek.findUnique({
      where: {
        classId_weekNum: {
          classId,
          weekNum: weekNumber,
        },
      },
      include: {
        weekSkills: {
          include: {
            skill: {
              include: { objectives: { orderBy: { sequenceNum: 'asc' } } },
            },
          },
          orderBy: { sequenceNum: 'asc' },
        },
      },
    });

    if (!week) {
      return NextResponse.json(
        { error: 'Week not found' },
        { status: 404 }
      );
    }

    const anchorSkills = week.weekSkills
      .filter((ws) => ws.isAnchor)
      .map((ws) => ({
        id: ws.skill.id,
        slug: ws.skill.slug,
        name: ws.skill.name,
        category: ws.skill.category,
        categoryIcon: ws.skill.categoryIcon,
        categoryColor: ws.skill.categoryColor,
        description: ws.skill.description,
        levels: ws.skill.levelDefinitions
          ? JSON.parse(ws.skill.levelDefinitions)
          : {},
        objectives: ws.skill.objectives,
      }));

    const allSkills = week.weekSkills.map((ws) => ({
      id: ws.skill.id,
      slug: ws.skill.slug,
      name: ws.skill.name,
      category: ws.skill.category,
    }));

    // Fetch all enrollments for this class
    const enrollments = await prisma.improvEnrollment.findMany({
      where: { classId },
      include: { student: { select: { id: true, name: true } } },
    });

    // Fetch student ratings for this week
    const studentRatings = await prisma.improvStudentRating.findMany({
      where: { weekId: week.id },
    });

    // Fetch teacher ratings for this week
    const teacherRatings = await prisma.improvTeacherRating.findMany({
      where: { weekId: week.id },
    });

    // Fetch feedback for this week
    const feedback = await prisma.improvFeedback.findMany({
      where: { weekId: week.id, isVisible: true },
      include: {
        skill: { select: { id: true, name: true } },
      },
    });

    // Organize ratings by student and skill
    const studentRatingsMap: Record<string, Record<string, any>> = {};
    const teacherRatingsMap: Record<string, Record<string, any>> = {};

    enrollments.forEach((enrollment) => {
      studentRatingsMap[enrollment.studentId] = {};
      teacherRatingsMap[enrollment.studentId] = {};
    });

    studentRatings.forEach((rating) => {
      const enrollmentId = rating.enrollmentId;
      const enrollment = enrollments.find(
        (e) => e.id === enrollmentId
      );
      if (enrollment) {
        studentRatingsMap[enrollment.studentId][rating.skillId] = {
          id: rating.id,
          level: rating.level,
          narrative: rating.narrative,
          evidence: rating.evidence,
          createdAt: rating.createdAt,
          revisedAt: rating.revisedAt,
        };
      }
    });

    teacherRatings.forEach((rating) => {
      const enrollmentId = rating.enrollmentId;
      const enrollment = enrollments.find(
        (e) => e.id === enrollmentId
      );
      if (enrollment) {
        teacherRatingsMap[enrollment.studentId][rating.skillId] = {
          id: rating.id,
          level: rating.level,
          instructorNotes: rating.instructorNotes,
          createdAt: rating.createdAt,
        };
      }
    });

    // Hydrate feedback with student names and skill names
    const feedbackWithDetails = feedback.map((f) => {
      const enrollment = enrollments.find((e) => e.id === f.enrollmentId);
      return {
        id: f.id,
        enrollmentId: f.enrollmentId,
        studentId: enrollment?.studentId,
        studentName: enrollment?.student.name,
        skillId: f.skillId,
        skillName: f.skill?.name,
        note: f.note,
        createdAt: f.createdAt,
        isVisible: f.isVisible,
      };
    });

    return NextResponse.json({
      week: {
        id: week.id,
        weekNum: week.weekNum,
        title: week.title,
        focusAreas: week.focusAreas,
        sessionNotes: week.sessionNotes,
        sessionNotesUpdatedAt: week.sessionNotesUpdatedAt,
      },
      anchorSkills,
      allSkills,
      studentRatings: studentRatingsMap,
      teacherRatings: teacherRatingsMap,
      feedback: feedbackWithDetails,
      enrollments: enrollments.map((e) => ({
        id: e.id,
        studentId: e.studentId,
        studentName: e.student.name,
      })),
    });
  } catch (error) {
    console.error('Error fetching week:', error);
    return NextResponse.json(
      { error: 'Failed to fetch week' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { classId: string; weekNum: string } }
) {
  try {
    const { classId, weekNum } = params;
    const weekNumber = parseInt(weekNum, 10);
    const body = await request.json();
    const { title, focusAreas, sessionNotes } = body;

    const updatedWeek = await prisma.improvWeek.update({
      where: {
        classId_weekNum: {
          classId,
          weekNum: weekNumber,
        },
      },
      data: {
        ...(title && { title }),
        ...(focusAreas && { focusAreas }),
        ...(sessionNotes !== undefined && { sessionNotes }),
        sessionNotesUpdatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedWeek);
  } catch (error) {
    console.error('Error updating week:', error);
    return NextResponse.json(
      { error: 'Failed to update week' },
      { status: 500 }
    );
  }
}
