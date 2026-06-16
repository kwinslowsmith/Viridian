import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;

    // Get K12 class to verify it exists and get org
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: { organizationId: true },
    });

    if (!k12Class) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Get all standards assigned to this class
    const classStandards = await prisma.classStandard.findMany({
      where: { classId },
      include: {
        standard: {
          include: {
            exampleObjectives: {
              orderBy: { sequenceNum: 'asc' },
            },
            unit: true,
          },
        },
      },
    });

    const assignedStandardIds = new Set(classStandards.map((cs) => cs.standard.id));

    // Get all standards in the organization (available pool)
    const allOrgStandards = await prisma.standard.findMany({
      where: { organizationId: k12Class.organizationId },
      include: {
        exampleObjectives: {
          orderBy: { sequenceNum: 'asc' },
        },
        unit: true,
      },
    });

    // Separate into assigned and available
    const assignedStandards = classStandards.map((cs) => ({
      standardId: cs.standard.id,
      standardCode: cs.standard.code,
      standardName: cs.standard.name,
      standardType: cs.standard.type,
      unitId: cs.standard.unitId,
      unitName: cs.standard.unit?.name,
      objectives: cs.standard.exampleObjectives.map((obj) => ({
        id: obj.id,
        label: obj.label,
        text: obj.text,
      })),
    }));

    const availableStandards = allOrgStandards
      .filter((s) => !assignedStandardIds.has(s.id))
      .map((standard) => ({
        standardId: standard.id,
        standardCode: standard.code,
        standardName: standard.name,
        standardType: standard.type,
        unitId: standard.unitId,
        unitName: standard.unit?.name,
        objectives: standard.exampleObjectives.map((obj) => ({
          id: obj.id,
          label: obj.label,
          text: obj.text,
        })),
      }));

    return NextResponse.json({
      assignedStandards,
      availableStandards,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to fetch standards:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const { standardId } = await request.json();

    if (!standardId) {
      return NextResponse.json({ error: 'standardId is required' }, { status: 400 });
    }

    // Verify class exists
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: { id: true },
    });

    if (!k12Class) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Create ClassStandard assignment
    const classStandard = await prisma.classStandard.upsert({
      where: {
        classId_standardId: {
          classId,
          standardId,
        },
      },
      update: {},
      create: {
        classId,
        standardId,
      },
      include: {
        standard: {
          include: {
            exampleObjectives: {
              orderBy: { sequenceNum: 'asc' },
            },
            unit: true,
          },
        },
      },
    });

    return NextResponse.json({
      standard: {
        standardId: classStandard.standard.id,
        standardCode: classStandard.standard.code,
        standardName: classStandard.standard.name,
        standardType: classStandard.standard.type,
        unitId: classStandard.standard.unitId,
        unitName: classStandard.standard.unit?.name,
        objectives: classStandard.standard.exampleObjectives.map((obj) => ({
          id: obj.id,
          label: obj.label,
          text: obj.text,
        })),
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to add standard:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const { searchParams } = new URL(request.url);
    const standardId = searchParams.get('standardId');

    if (!standardId) {
      return NextResponse.json({ error: 'standardId is required' }, { status: 400 });
    }

    // Delete ClassStandard
    await prisma.classStandard.delete({
      where: {
        classId_standardId: {
          classId,
          standardId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to remove standard:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
