import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/k12-classes/[classId]/standards/[standardId]/objectives
 *
 * Create custom teacher-authored objective
 * Validates: label not already used, standard assigned to class
 * Auto-creates ClassObjective with isActive=true
 * Returns new objective with all fields
 */
export async function POST(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ classId: string; standardId: string }> }
) {
  try {
    const { classId, standardId } = await params;
    const body = await request.json();

    const { label, text, description, learningTarget, evidenceCriteria } = body;

    // Validate required fields
    if (!label || !text) {
      return NextResponse.json(
        { error: 'label and text are required' },
        { status: 400 }
      );
    }

    // Validate class exists
    const classData = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: { id: true },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Validate standard exists
    const standard = await prisma.standard.findUnique({
      where: { id: standardId },
      select: { id: true, code: true, name: true },
    });

    if (!standard) {
      return NextResponse.json({ error: 'Standard not found' }, { status: 404 });
    }

    // Verify standard is assigned to this class
    const classStandard = await prisma.classStandard.findFirst({
      where: { classId, standardId },
      select: { id: true },
    });

    if (!classStandard) {
      return NextResponse.json(
        {
          error:
            'Standard not assigned to this class',
        },
        { status: 403 }
      );
    }

    // Check if label already exists for this standard
    const existing = await prisma.exampleObjective.findFirst({
      where: {
        standardId,
        label: label.toUpperCase().trim(),
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Objective with label "${label}" already exists for this standard` },
        { status: 409 }
      );
    }

    // Get the highest sequence number
    const maxSeq = await prisma.exampleObjective.aggregate({
      where: { standardId },
      _max: { sequenceNum: true },
    });

    const nextSeq = (maxSeq._max.sequenceNum || 0) + 1;

    // Create the custom objective
    const newObjective = await prisma.exampleObjective.create({
      data: {
        standardId,
        label: label.toUpperCase().trim(),
        text,
        description: description || null,
        learningTarget: learningTarget || null,
        evidenceCriteria: evidenceCriteria || null,
        source: 'custom',
        sequenceNum: nextSeq,
      },
    });

    // Auto-create ClassObjective with isActive=true
    const classObjective = await prisma.classObjective.create({
      data: {
        classId,
        exampleObjectiveId: newObjective.id,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        id: newObjective.id,
        standardId: newObjective.standardId,
        label: newObjective.label,
        text: newObjective.text,
        description: newObjective.description,
        learningTarget: newObjective.learningTarget,
        evidenceCriteria: newObjective.evidenceCriteria,
        source: newObjective.source,
        sequenceNum: newObjective.sequenceNum,
        classObjectiveId: classObjective.id,
        isActive: classObjective.isActive,
        objectiveDescription: null,
        googleDocUrl: null,
        isMandatory: false,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to create custom objective:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
