import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyTeacherOwnsClass, verifyStudentInClass } from '@/lib/api/k12-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify access: user must be teacher OR student in this class
    const teacherAuth = await verifyTeacherOwnsClass(session.user.id, params.classId);
    const isTeacher = teacherAuth.valid;

    let isStudent = false;
    if (!isTeacher) {
      const studentAuth = await verifyStudentInClass(session.user.id, params.classId);
      isStudent = studentAuth.valid;
    }

    if (!isTeacher && !isStudent) {
      return NextResponse.json(
        { error: 'Not authorized to view this calendar' },
        { status: 403 }
      );
    }

    // Get class
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: params.classId },
      select: {
        id: true,
        organizationId: true,
        instructorId: true,
      },
    });

    if (!k12Class) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Get school assessments (master calendar events)
    const schoolAssessments = await prisma.schoolAssessment.findMany({
      where: {
        organizationId: k12Class.organizationId,
      },
      orderBy: { assessmentDate: 'asc' },
      take: 50,
    });

    // Get class assessments
    const classAssessments = await prisma.k12Assessment.findMany({
      where: {
        classId: params.classId,
      },
      orderBy: { dueDate: 'asc' },
    });

    // Combine and format calendar events
    const calendarEvents = [
      ...schoolAssessments.map((event) => ({
        id: event.id,
        date: event.assessmentDate.toISOString(),
        type: 'assessment' as const,
        name: event.name,
        standardsAssessed: event.standardsAssessed
          ? JSON.parse(event.standardsAssessed)
          : [],
        studentCount: 0, // TODO: get actual count
      })),
      ...classAssessments.map((event) => ({
        id: event.id,
        date: event.dueDate ? event.dueDate.toISOString() : new Date().toISOString(),
        type: 'lesson' as const,
        name: event.title,
        standardsAssessed: event.objectiveIds
          ? JSON.parse(event.objectiveIds)
          : [],
        studentCount: 0,
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({
      classId: params.classId,
      events: calendarEvents,
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching master calendar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
