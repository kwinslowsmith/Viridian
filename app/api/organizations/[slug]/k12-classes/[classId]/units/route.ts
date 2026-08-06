import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; classId: string }> }
) {
  try {
    const { slug, classId } = await params;

    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: { organizationId: true },
    });

    if (!k12Class || k12Class.organizationId !== org.id) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Fetch standards grouped by unit for this class
    const classStandards = await prisma.classStandard.findMany({
      where: { classId },
      include: {
        standard: {
          include: {
            unit: true,
            exampleObjectives: {
              orderBy: { sequenceNum: 'asc' },
            },
          },
        },
      },
    });

    // Group by unit
    const unitsMap = new Map<string, any>();

    classStandards.forEach((cs) => {
      const unit = cs.standard.unit;
      if (!unit) return;

      if (!unitsMap.has(unit.id)) {
        unitsMap.set(unit.id, {
          id: unit.id,
          sequenceNum: unit.sequenceNum,
          name: unit.name,
          code: unit.code,
          standards: [],
        });
      }

      const unitData = unitsMap.get(unit.id);
      unitData.standards.push({
        id: cs.standard.id,
        code: cs.standard.code,
        name: cs.standard.name,
        description: cs.standard.description,
        objectives: cs.standard.exampleObjectives.map((obj) => ({
          id: obj.id,
          label: obj.label,
          text: obj.text,
          description: obj.description,
          learningTarget: obj.learningTarget,
          sequenceNum: obj.sequenceNum,
        })),
      });
    });

    const units = Array.from(unitsMap.values()).sort(
      (a, b) => a.sequenceNum - b.sequenceNum
    );

    return NextResponse.json({ units });
  } catch (error) {
    console.error('Failed to fetch units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch units' },
      { status: 500 }
    );
  }
}
