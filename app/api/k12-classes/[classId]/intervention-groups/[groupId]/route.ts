import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * PATCH /api/k12-classes/[classId]/intervention-groups/[groupId]
 * Updates an intervention group
 * Body: { name?, meetingSchedule?, endDate? }
 */
export async function PATCH(
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

    // Verify group exists and belongs to this class
    const group = await prisma.interventionGroup.findUnique({
      where: { id: groupId },
      select: { classId: true },
    });

    if (!group || group.classId !== classId) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, meetingSchedule, endDate } = body;

    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json(
          { error: 'name must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (meetingSchedule !== undefined) {
      updateData.meetingSchedule = meetingSchedule?.trim() || null;
    }

    if (endDate !== undefined) {
      updateData.endDate = endDate ? new Date(endDate) : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const updated = await prisma.interventionGroup.update({
      where: { id: groupId },
      data: updateData,
      select: {
        id: true,
        name: true,
        objectiveId: true,
        meetingSchedule: true,
        startDate: true,
        endDate: true,
        students: { select: { enrollment: { select: { studentId: true } } } },
        updatedAt: true,
      },
    });

    return NextResponse.json({
      groupId: updated.id,
      name: updated.name,
      objectiveId: updated.objectiveId,
      studentCount: updated.students.length,
      studentIds: updated.students.map((s) => s.enrollment.studentId),
      meetingSchedule: updated.meetingSchedule,
      startDate: updated.startDate,
      endDate: updated.endDate,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error('Error updating intervention group:', error);
    return NextResponse.json(
      { error: 'Failed to update intervention group' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/k12-classes/[classId]/intervention-groups/[groupId]
 * Deletes an intervention group
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

    // Verify group exists and belongs to this class
    const group = await prisma.interventionGroup.findUnique({
      where: { id: groupId },
      select: { classId: true },
    });

    if (!group || group.classId !== classId) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Delete group (cascades to students)
    await prisma.interventionGroup.delete({
      where: { id: groupId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting intervention group:', error);
    return NextResponse.json(
      { error: 'Failed to delete intervention group' },
      { status: 500 }
    );
  }
}
