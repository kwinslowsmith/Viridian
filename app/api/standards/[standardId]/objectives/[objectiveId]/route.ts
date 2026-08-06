import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ standardId: string; objectiveId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { standardId, objectiveId } = await params;
    const { isMandatory } = await request.json();

    if (typeof isMandatory !== 'boolean') {
      return NextResponse.json(
        { error: 'isMandatory must be a boolean' },
        { status: 400 }
      );
    }

    // Verify objective exists and belongs to standard
    const objective = await prisma.exampleObjective.findUnique({
      where: { id: objectiveId },
    });

    if (!objective || objective.standardId !== standardId) {
      return NextResponse.json(
        { error: 'Objective not found' },
        { status: 404 }
      );
    }

    // Update the objective
    const updated = await prisma.exampleObjective.update({
      where: { id: objectiveId },
      data: { isMandatory },
    });

    // Recompute mandatoryObjectiveIds for the standard
    const allObjectives = await prisma.exampleObjective.findMany({
      where: { standardId },
      select: { id: true, isMandatory: true },
    });

    const mandatoryIds = allObjectives
      .filter(obj => obj.isMandatory)
      .map(obj => obj.id);

    await prisma.standard.update({
      where: { id: standardId },
      data: {
        mandatoryObjectiveIds: mandatoryIds.length > 0 ? JSON.stringify(mandatoryIds) : null,
      },
    });

    return NextResponse.json({ objective: updated }, { status: 200 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to toggle objective mandatory status:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
