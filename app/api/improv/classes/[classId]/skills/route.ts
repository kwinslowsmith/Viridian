import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET: Get all skills and their configuration for this class
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const improvClass = await prisma.improvClass.findUnique({
      where: { id: classId },
    });

    if (!improvClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Get class skills with objectives
    const classSkills = await prisma.improvClassSkill.findMany({
      where: { classId },
      include: {
        skill: {
          include: {
            objectives: {
              orderBy: { sequenceNum: 'asc' },
            },
          },
        },
      },
      orderBy: { sequenceNum: 'asc' },
    });

    // Also get all skills that aren't in the class yet
    const skillsInClass = new Set(classSkills.map((cs) => cs.skillId));
    const availableSkills = await prisma.improvSkill.findMany({
      where: {
        isActive: true,
        NOT: { id: { in: Array.from(skillsInClass) } },
      },
      include: {
        objectives: {
          orderBy: { sequenceNum: 'asc' },
        },
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({
      classSkills,
      availableSkills,
    });
  } catch (error) {
    console.error('Failed to fetch class skills:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch skills', details: errorMessage },
      { status: 500 }
    );
  }
}

// POST: Add a skill to the class or update its configuration
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId } = await params;
    const body = await request.json();
    const { skillId, mandatoryObjectiveCount, totalObjectivesRequired, sequenceNum } = body;

    if (!skillId) {
      return NextResponse.json(
        { error: 'skillId required' },
        { status: 400 }
      );
    }

    const improvClass = await prisma.improvClass.findUnique({
      where: { id: classId },
    });

    if (!improvClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Check if instructor
    if (improvClass.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only instructor can modify class skills' },
        { status: 403 }
      );
    }

    const classSkill = await prisma.improvClassSkill.upsert({
      where: {
        classId_skillId: { classId, skillId },
      },
      update: {
        mandatoryObjectiveCount,
        totalObjectivesRequired,
        sequenceNum: sequenceNum ?? 999,
      },
      create: {
        classId,
        skillId,
        mandatoryObjectiveCount: mandatoryObjectiveCount ?? 0,
        totalObjectivesRequired: totalObjectivesRequired ?? 0,
        sequenceNum: sequenceNum ?? 999,
      },
      include: {
        skill: {
          include: {
            objectives: true,
          },
        },
      },
    });

    return NextResponse.json({ classSkill }, { status: 201 });
  } catch (error) {
    console.error('Failed to add skill to class:', error);
    return NextResponse.json(
      { error: 'Failed to add skill' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a skill from the class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId } = await params;
    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');

    if (!skillId) {
      return NextResponse.json(
        { error: 'skillId required' },
        { status: 400 }
      );
    }

    const improvClass = await prisma.improvClass.findUnique({
      where: { id: classId },
    });

    if (!improvClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (improvClass.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only instructor can modify class skills' },
        { status: 403 }
      );
    }

    await prisma.improvClassSkill.delete({
      where: {
        classId_skillId: { classId, skillId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove skill from class:', error);
    return NextResponse.json(
      { error: 'Failed to remove skill' },
      { status: 500 }
    );
  }
}
