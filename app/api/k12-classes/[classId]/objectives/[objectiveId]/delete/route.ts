import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/k12-classes/[classId]/objectives/[objectiveId]/delete
 *
 * Only allow if objective.source='custom' (not curriculum)
 * Soft delete: set deletedAt timestamp
 * Return success or 403 if trying to delete curriculum objective
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; objectiveId: string }> }
) {
  try {
    const { classId, objectiveId } = await params;

    // Validate class exists
    const classData = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: { id: true },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Fetch the objective to check its source
    const objective = await prisma.exampleObjective.findUnique({
      where: { id: objectiveId },
      select: {
        id: true,
        source: true,
        label: true,
        standardId: true,
      },
    });

    if (!objective) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    // Check if this is a curriculum objective (cannot delete)
    if (objective.source !== 'custom') {
      return NextResponse.json(
        {
          error: `Cannot delete curriculum objective. Only custom teacher-authored objectives can be deleted.`,
        },
        { status: 403 }
      );
    }

    // Verify the objective is linked to this class
    const classObjective = await prisma.classObjective.findFirst({
      where: {
        classId,
        exampleObjectiveId: objectiveId,
      },
      select: { id: true },
    });

    if (!classObjective) {
      return NextResponse.json(
        { error: 'Objective not assigned to this class' },
        { status: 404 }
      );
    }

    // Soft delete: set deletedAt timestamp in ClassObjective
    const deleted = await prisma.classObjective.update({
      where: { id: classObjective.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: `Objective "${objective.label}" has been deleted`,
      objectiveId: objectiveId,
      deletedAt: deleted.deletedAt,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to delete objective:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
