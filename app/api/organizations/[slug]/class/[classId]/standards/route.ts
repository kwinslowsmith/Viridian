import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; classId: string }> }
) {
  try {
    const { slug, classId } = await params;
    const userId = request.headers.get('User-Id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Find organization
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Find the class
    const classData = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        organizationId: true,
        instructorId: true,
      },
    });

    if (!classData || classData.organizationId !== org.id) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Check user access
    const userIsInstructor = classData.instructorId === userId;
    const enrollment = await prisma.k12Enrollment.findUnique({
      where: {
        classId_studentId: {
          classId: classId,
          studentId: userId,
        },
      },
      select: { status: true },
    });

    const userIsStudent = enrollment?.status === 'active';

    if (!userIsInstructor && !userIsStudent) {
      return NextResponse.json(
        { error: 'You do not have access to this class' },
        { status: 403 }
      );
    }

    // Get standards for this organization
    const standards = await prisma.standard.findMany({
      where: {
        organizationId: org.id,
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        type: true,
      },
      orderBy: { code: 'asc' },
    });

    // If teacher: get all enrolled students and their progress on these standards
    if (userIsInstructor) {
      const enrolledStudents = await prisma.k12Enrollment.findMany({
        where: {
          classId: classId,
          status: 'active',
        },
        select: {
          studentId: true,
          student: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const studentProgress = await Promise.all(
        enrolledStudents.map(async (enrollment) => {
          const progress = await prisma.studentStandardProgress.findMany({
            where: {
              userId: enrollment.studentId,
              organizationId: org.id,
            },
            select: {
              standardId: true,
              level: true,
              completed: true,
            },
          });

          const progressMap: Record<string, any> = {};
          progress.forEach((p) => {
            progressMap[p.standardId] = {
              level: p.level,
              completed: p.completed,
            };
          });

          return {
            studentId: enrollment.studentId,
            studentName: enrollment.student.name,
            progress: progressMap,
          };
        })
      );

      return NextResponse.json(
        {
          standards,
          students: studentProgress,
          userRole: 'Teacher',
        },
        { status: 200 }
      );
    }

    // If student: get their own progress on these standards
    const studentProgress = await prisma.studentStandardProgress.findMany({
      where: {
        userId: userId,
        organizationId: org.id,
      },
      select: {
        standardId: true,
        level: true,
        completed: true,
      },
    });

    const progressMap: Record<string, any> = {};
    studentProgress.forEach((p) => {
      progressMap[p.standardId] = {
        level: p.level,
        completed: p.completed,
      };
    });

    return NextResponse.json(
      {
        standards,
        studentProgress: progressMap,
        userRole: 'Student',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch class standards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class standards' },
      { status: 500 }
    );
  }
}
