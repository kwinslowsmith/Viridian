import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

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

    // Get all standards for this class (which contain objectives grouped by unit)
    const standards = await prisma.k12Standard.findMany({
      where: { classId },
      select: {
        id: true,
        unitNum: true,
        title: true,
        objectives: {
          select: {
            id: true,
            label: true,
            text: true,
          },
          orderBy: { label: 'asc' },
        },
      },
      orderBy: { unitNum: 'asc' },
    });

    // Group by unit
    const unitsMap = new Map();
    standards.forEach(std => {
      if (!unitsMap.has(std.unitNum)) {
        unitsMap.set(std.unitNum, {
          id: `unit-${std.unitNum}`,
          unitNum: std.unitNum,
          title: std.title,
          objectives: [],
        });
      }
      const unit = unitsMap.get(std.unitNum);
      unit.objectives.push(...std.objectives);
    });

    const units = Array.from(unitsMap.values());

    return NextResponse.json({ units });
  } catch (error) {
    console.error('Failed to fetch units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch units' },
      { status: 500 }
    );
  }
}
