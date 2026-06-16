import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// PUT: Update objective
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ objectiveId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { objectiveId } = await params;
    const body = await request.json();
    const { text, description, isMandatory, assessmentGuidance } = body;

    const objective = await prisma.improvObjective.findUnique({
      where: { id: objectiveId },
      include: { skill: true },
    });

    if (!objective) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    // For custom objectives, verify instructor authorization
    if (objective.isCustom) {
      // Find a class that contains this skill
      const classSkill = await prisma.improvClassSkill.findFirst({
        where: { skillId: objective.skillId },
        include: { class: true },
      });

      if (!classSkill || classSkill.class.instructorId !== session.user.id) {
        return NextResponse.json(
          { error: 'Only instructor can update custom objectives' },
          { status: 403 }
        );
      }
    }

    const updated = await prisma.improvObjective.update({
      where: { id: objectiveId },
      data: {
        text: text ?? objective.text,
        description: description ?? objective.description,
        isMandatory: isMandatory ?? objective.isMandatory,
        assessmentGuidance: assessmentGuidance ?? objective.assessmentGuidance,
      },
      include: { skill: true },
    });

    return NextResponse.json({ objective: updated });
  } catch (error) {
    console.error('Failed to update objective:', error);
    return NextResponse.json(
      { error: 'Failed to update objective' },
      { status: 500 }
    );
  }
}

// DELETE: Delete custom objective
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ objectiveId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { objectiveId } = await params;

    const objective = await prisma.improvObjective.findUnique({
      where: { id: objectiveId },
    });

    if (!objective) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    // Only allow deletion of custom objectives
    if (!objective.isCustom) {
      return NextResponse.json(
        { error: 'Cannot delete system objectives' },
        { status: 400 }
      );
    }

    // Verify instructor authorization
    const classSkill = await prisma.improvClassSkill.findFirst({
      where: { skillId: objective.skillId },
      include: { class: true },
    });

    if (!classSkill || classSkill.class.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only instructor can delete custom objectives' },
        { status: 403 }
      );
    }

    await prisma.improvObjective.delete({
      where: { id: objectiveId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete objective:', error);
    return NextResponse.json(
      { error: 'Failed to delete objective' },
      { status: 500 }
    );
  }
}
