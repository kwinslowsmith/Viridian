import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: Get all objectives for skills in this class
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

    // Get all objectives for skills in this class
    const classSkills = await prisma.improvClassSkill.findMany({
      where: { classId },
      select: { skillId: true },
    });

    const skillIds = classSkills.map((cs) => cs.skillId);

    const objectives = await prisma.improvObjective.findMany({
      where: {
        skillId: { in: skillIds },
      },
      include: {
        skill: true,
      },
      orderBy: [{ skillId: 'asc' }, { sequenceNum: 'asc' }],
    });

    return NextResponse.json({ objectives });
  } catch (error) {
    console.error('Failed to fetch objectives:', error);
    return NextResponse.json(
      { error: 'Failed to fetch objectives' },
      { status: 500 }
    );
  }
}

// POST: Add a custom objective to a skill in this class
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
    const { skillId, text, description, isMandatory, assessmentGuidance } = body;

    if (!skillId || !text) {
      return NextResponse.json(
        { error: 'skillId and text required' },
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
        { error: 'Only instructor can add objectives' },
        { status: 403 }
      );
    }

    // Check that the skill is in this class
    const classSkill = await prisma.improvClassSkill.findUnique({
      where: { classId_skillId: { classId, skillId } },
    });

    if (!classSkill) {
      return NextResponse.json(
        { error: 'Skill not in this class' },
        { status: 400 }
      );
    }

    // Get next sequence number
    const maxSeq = await prisma.improvObjective.findFirst({
      where: { skillId },
      orderBy: { sequenceNum: 'desc' },
      select: { sequenceNum: true },
    });

    const objective = await prisma.improvObjective.create({
      data: {
        skillId,
        text,
        description,
        isMandatory: isMandatory ?? false,
        isCustom: true,
        assessmentGuidance,
        sequenceNum: (maxSeq?.sequenceNum ?? 0) + 1,
      },
      include: {
        skill: true,
      },
    });

    return NextResponse.json({ objective }, { status: 201 });
  } catch (error) {
    console.error('Failed to create objective:', error);
    return NextResponse.json(
      { error: 'Failed to create objective' },
      { status: 500 }
    );
  }
}
