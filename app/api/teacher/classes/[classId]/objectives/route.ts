import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;

    // Get the class and its standards
    const classData = await prisma.k12Class.findUnique({
      where: { id: classId },
      include: {
        enrollments: true,
      },
    });

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Get all standards for this class (via ClassStandard)
    const classStandards = await prisma.classStandard.findMany({
      where: { classId },
    });

    // For each standard, get its objectives with teacher customizations
    const standardIds = classStandards.map((cs) => cs.standardId);

    const standards = await prisma.standard.findMany({
      where: { id: { in: standardIds } },
      include: {
        exampleObjectives: {
          orderBy: { sequenceNum: "asc" },
          include: {
            classObjectives: {
              where: { classId },
              take: 1, // Should be 0 or 1
            },
          },
        },
      },
    });

    // Transform to include customization data
    const objectivesWithCustomization = standards.map((standard) => ({
      standardId: standard.id,
      standardName: standard.name,
      standardCode: standard.code,
      objectives: standard.exampleObjectives.map((obj) => {
        const customization = obj.classObjectives[0];
        return {
          id: obj.id,
          label: obj.label,
          text: obj.text,
          description: obj.description,
          customText: customization?.customText || null,
          isActive: customization?.isActive ?? true,
          classObjectiveId: customization?.id || null,
        };
      }),
    }));

    return NextResponse.json({
      classId,
      className: classData.name,
      standards: objectivesWithCustomization,
    });
  } catch (err) {
    console.error("Failed to fetch objectives:", err);
    return NextResponse.json(
      { error: "Failed to fetch objectives" },
      { status: 500 }
    );
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
        { error: "objectiveUpdates must be an array" },
        { status: 400 }
      );
    }

    // Validate class exists
    const classData = await prisma.k12Class.findUnique({
      where: { id: classId },
    });

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
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
    console.error("Failed to update objectives:", err);
    return NextResponse.json(
      { error: "Failed to update objectives" },
      { status: 500 }
    );
  }
}
