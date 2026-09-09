import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/k12-classes/[classId]/intervention-groups/[groupId]/add-student
 * Adds a student to an intervention group
 * Body: { studentId }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, groupId } = await params;
    if (!classId || !groupId) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Verify user is instructor for this class
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: { instructorId: true },
    });

    if (!k12Class || k12Class.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    // Verify group exists and belongs to this class
    const group = await prisma.interventionGroup.findUnique({
      where: { id: groupId },
      select: { classId: true },
    });

    if (!group || group.classId !== classId) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Get student enrollment
    const enrollment = await prisma.k12Enrollment.findUnique({
      where: {
        classId_studentId: { classId, studentId },
      },
      select: { id: true },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Student not enrolled in this class' },
        { status: 404 }
      );
    }

    // Check if student is already in group
    const existingMembership = await prisma.interventionGroupStudent.findUnique({
      where: {
        groupId_enrollmentId: { groupId, enrollmentId: enrollment.id },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: 'Student already in this group' },
        { status: 409 }
      );
    }

    // Add student to group
    await prisma.interventionGroupStudent.create({
      data: {
        groupId,
        studentId,
        enrollmentId: enrollment.id,
        status: 'active',
      },
    });

    // Return updated group
    const updated = await prisma.interventionGroup.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        objectiveId: true,
        students: { select: { enrollment: { select: { studentId: true } } } },
      },
    });

    return NextResponse.json({
      groupId: updated!.id,
      name: updated!.name,
      studentCount: updated!.students.length,
      studentIds: updated!.students.map((s) => s.enrollment.studentId),
    });
  } catch (error) {
    console.error('Error adding student to group:', error);
    return NextResponse.json(
      { error: 'Failed to add student to group' },
      { status: 500 }
    );
  }
}
