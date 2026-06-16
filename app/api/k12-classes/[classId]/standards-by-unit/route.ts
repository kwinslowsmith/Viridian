import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'teacher'; // teacher or student

    // Fetch all standards assigned to this class, grouped by unit
    const classStandards = await prisma.classStandard.findMany({
      where: { classId },
      include: {
        standard: {
          include: {
            unit: true,
            exampleObjectives: {
              orderBy: { sequenceNum: 'asc' },
              include: {
                classObjective: true,
              },
            },
          },
        },
      },
      orderBy: {
        standard: {
          unit: {
            sequenceNum: 'asc',
          },
        },
      },
    });

    // Transform into units → standards → objectives hierarchy
    const unitsMap = new Map<string, any>();

    classStandards.forEach(cs => {
      const unit = cs.standard.unit;
      if (!unit) return;

      if (!unitsMap.has(unit.id)) {
        unitsMap.set(unit.id, {
          id: unit.id,
          name: unit.name,
          sequenceNum: unit.sequenceNum,
          standards: [],
        });
      }

      // Filter objectives based on view
      let objectives = cs.standard.exampleObjectives;
      if (view === 'student') {
        objectives = objectives.filter(
          obj => obj.classObjective?.isActive ?? true
        );
      }

      const standard = {
        id: cs.standard.id,
        code: cs.standard.code,
        name: cs.standard.name,
        objectives: objectives.map(obj => ({
          id: obj.id,
          label: obj.label,
          text: obj.text,
          description: obj.description,
          isActive: obj.classObjective?.isActive ?? true,
          customDescription: obj.classObjective?.objectiveDescription,
          googleDocUrl: obj.classObjective?.googleDocUrl,
          isMandatory: obj.classObjective?.isMandatory ?? false,
          classObjectiveId: obj.classObjective?.id,
        })),
      };

      unitsMap.get(unit.id).standards.push(standard);
    });

    // Convert to sorted array
    const units = Array.from(unitsMap.values()).sort(
      (a, b) => a.sequenceNum - b.sequenceNum
    );

    return NextResponse.json({ units });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to fetch standards by unit:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
