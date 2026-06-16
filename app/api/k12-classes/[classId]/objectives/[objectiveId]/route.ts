import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * PATCH /api/k12-classes/[classId]/objectives/[objectiveId]
 *
 * Update objective: isActive, description, googleDocUrl, isMandatory
 * Uses upsert pattern: create ClassObjective if doesn't exist
 * Returns updated objective with all fields
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; objectiveId: string }> }
) {
  try {
    const { classId, objectiveId } = await params;
    const body = await request.json();

    const {
      isActive,
      objectiveDescription,
      googleDocUrl,
      isMandatory,
    } = body;

    // Validate class exists
    const classData = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: { id: true },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Validate objective exists
    const objective = await prisma.exampleObjective.findUnique({
      where: { id: objectiveId },
      select: { id: true, standardId: true, label: true },
    });

    if (!objective) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    // Upsert ClassObjective: create if doesn't exist, update if it does
    const updated = await prisma.classObjective.upsert({
      where: {
        classId_exampleObjectiveId: {
          classId,
          exampleObjectiveId: objectiveId,
        },
      },
      update: {
        isActive: isActive !== undefined ? isActive : undefined,
        objectiveDescription:
          objectiveDescription !== undefined ? objectiveDescription : undefined,
        googleDocUrl: googleDocUrl !== undefined ? googleDocUrl : undefined,
        isMandatory: isMandatory !== undefined ? isMandatory : undefined,
      },
      create: {
        classId,
        exampleObjectiveId: objectiveId,
        isActive: isActive ?? true,
        objectiveDescription: objectiveDescription || null,
        googleDocUrl: googleDocUrl || null,
        isMandatory: isMandatory ?? false,
      },
    });

    // Fetch the full objective to return with all details
    const fullObjective = await prisma.exampleObjective.findUnique({
      where: { id: objectiveId },
      select: {
        id: true,
        standardId: true,
        label: true,
        text: true,
        description: true,
        learningTarget: true,
        evidenceCriteria: true,
        source: true,
        sequenceNum: true,
      },
    });

    return NextResponse.json({
      id: fullObjective!.id,
      standardId: fullObjective!.standardId,
      label: fullObjective!.label,
      text: fullObjective!.text,
      description: fullObjective!.description,
      learningTarget: fullObjective!.learningTarget,
      evidenceCriteria: fullObjective!.evidenceCriteria,
      source: fullObjective!.source,
      classObjectiveId: updated.id,
      isActive: updated.isActive,
      objectiveDescription: updated.objectiveDescription,
      googleDocUrl: updated.googleDocUrl,
      isMandatory: updated.isMandatory,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to update objective:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
