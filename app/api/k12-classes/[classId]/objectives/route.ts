import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;

    // Fetch all standards linked to this K12 class
    const classStandards = await prisma.classStandard.findMany({
      where: { classId },
      include: {
        standard: {
          include: {
            exampleObjectives: {
              include: {
                materials: {
                  where: { classId },
                },
              },
              orderBy: { sequenceNum: 'asc' },
            },
            unit: true,
          },
        },
      },
    });

    // Fetch class objective customizations
    const classObjectives = await prisma.classObjective.findMany({
      where: { classId },
    });

    const customizationMap = new Map(
      classObjectives.map(co => [co.exampleObjectiveId, co])
    );

    // Transform into grouped format
    const standards = classStandards.map(cs => ({
      standardId: cs.standard.id,
      standardCode: cs.standard.code,
      standardName: cs.standard.name,
      standardType: cs.standard.type,
      unitId: cs.standard.unitId,
      unitName: cs.standard.unit?.name,
      objectives: cs.standard.exampleObjectives.map(obj => {
        const customization = customizationMap.get(obj.id);
        return {
          id: obj.id,
          label: obj.label,
          text: obj.text,
          description: obj.description || '',
          customText: customization?.customText || null,
          isActive: customization?.isActive ?? true,
          isMandatory: customization?.isMandatory ?? obj.isMandatory,
          classObjectiveId: customization?.id || null,
          sequenceNum: obj.sequenceNum,
          materials: obj.materials.map((m: any) => ({
            id: m.id,
            title: m.title,
            url: m.url,
            type: m.type,
          })),
        };
      }),
    }));

    return NextResponse.json({ standards });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to fetch K12 class objectives:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const { objectiveUpdates } = await request.json();

    if (!Array.isArray(objectiveUpdates)) {
      return NextResponse.json(
        { error: 'objectiveUpdates must be an array' },
        { status: 400 }
      );
    }

    // Validate class exists
    const classData = await prisma.k12Class.findUnique({
      where: { id: classId },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Upsert all class objective customizations
    const results = await Promise.all(
      objectiveUpdates.map((update: any) =>
        prisma.classObjective.upsert({
          where: {
            classId_exampleObjectiveId: {
              classId,
              exampleObjectiveId: update.exampleObjectiveId,
            },
          },
          update: {
            customText: update.customText,
            isActive: update.isActive,
          },
          create: {
            classId,
            exampleObjectiveId: update.exampleObjectiveId,
            customText: update.customText,
            isActive: update.isActive ?? true,
          },
        })
      )
    );

    return NextResponse.json({ updated: results.length }, { status: 201 });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Failed to update objectives:', errorMsg);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
