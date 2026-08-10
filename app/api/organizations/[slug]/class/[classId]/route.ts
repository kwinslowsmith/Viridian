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

    // Find organization by slug
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Try to find as ImprovClass first
    let classData: any = await prisma.k12Class.findUnique({
      where: { id: classId },
      include: {
        instructor: {
          select: { id: true, name: true, email: true },
        },
        weeks: {
          orderBy: { weekNum: 'asc' },
          select: {
            id: true,
            weekNum: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    let classType = 'improv';

    // If not found, try K12Class
    if (!classData) {
      classData = await prisma.k12Class.findUnique({
        where: { id: classId },
        include: {
          instructor: {
            select: { id: true, name: true, email: true },
          },
          weeks: {
            orderBy: { weekNum: 'asc' },
            select: {
              id: true,
              weekNum: true,
              title: true,
              startDate: true,
              endDate: true,
            },
          },
          _count: {
            select: { enrollments: true },
          },
        },
      });
      classType = 'k12';
    }

    if (!classData || classData.organizationId !== org.id) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Check user's role in this class
    let userRole: string | null = null;

    // Check if user is the instructor
    if (classData.instructorId === userId) {
      userRole = 'Teacher';
    } else {
      // Check if user is enrolled as a student
      const enrollment = await prisma.k12Enrollment.findUnique({
        where: {
          classId_studentId: {
            classId: classId,
            studentId: userId,
          },
        },
      });

      if (enrollment && enrollment.status === 'active') {
        userRole = 'Student';
      } else {
        // Check if user is a SuperAdmin in this organization
        const orgRole = await prisma.organizationRole.findFirst({
          where: {
            userId,
            organizationId: org.id,
            role: 'SuperAdmin',
          },
        });

        if (orgRole) {
          userRole = 'SuperAdmin';
        }
      }
    }

    if (!userRole) {
      return NextResponse.json(
        { error: 'You do not have access to this class' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        classData: {
          id: classData.id,
          name: classData.name,
          subtitle: classData.subtitle,
          instructor: classData.instructor,
          startDate: classData.startDate,
          endDate: classData.endDate,
          numWeeks: classData.numWeeks,
          status: classData.status,
          enrollmentCount: classData._count.enrollments,
          weeks: classData.weeks,
          classType,
        },
        userRole,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch class:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class' },
      { status: 500 }
    );
  }
}
