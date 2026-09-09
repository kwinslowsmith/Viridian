import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * DELETE /api/k12-classes/[classId]/intervention-groups/[groupId]/remove-student?studentId=[id]
 * Removes a student from an intervention group
 */
export async function DELETE(
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

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId query parameter is required' },
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

    // Find and delete the membership
    const membership = await prisma.interventionGroupStudent.findUnique({
      where: {
        groupId_enrollmentId: { groupId, enrollmentId: enrollment.id },
      },
      select: { id: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Student not in this group' },
        { status: 404 }
      );
    }

    await prisma.interventionGroupStudent.delete({
      where: { id: membership.id },
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
    console.error('Error removing student from group:', error);
    return NextResponse.json(
      { error: 'Failed to remove student from group' },
      { status: 500 }
    );
  }
}
