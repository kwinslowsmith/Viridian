import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET: List class resources and accessible org resources
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId } = await params;

    // Verify class exists and check access (instructor or enrolled student)
    const improvClass = await prisma.improvClass.findUnique({
      where: { id: classId },
      select: { id: true, organizationId: true, instructorId: true },
    });

    if (!improvClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Check if user is instructor or enrolled student
    const isInstructor = improvClass.instructorId === session.user.id;
    const enrollment = await prisma.improvEnrollment.findUnique({
      where: {
        classId_studentId: {
          classId: improvClass.id,
          studentId: session.user.id,
        },
      },
    });

    if (!isInstructor && !enrollment) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const classSkillsOnly = searchParams.get('classSkillsOnly') === 'true';

    // Build where clause
    let whereClause: any = {
      OR: [
        { classId: improvClass.id, visibility: 'class' },
        { organizationId: improvClass.organizationId, visibility: 'org' },
        { visibility: 'public' },
      ],
    };

    // If classSkillsOnly, filter to skills that are in this class
    if (classSkillsOnly) {
      const classSkillIds = await prisma.improvClassSkill.findMany({
        where: { classId: improvClass.id },
        select: { skillId: true },
      });

      const skillIds = classSkillIds.map((cs) => cs.skillId);

      if (skillIds.length > 0) {
        whereClause.skills = {
          some: { skillId: { in: skillIds } },
        };
      }
    }

    const resources = await prisma.resource.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, name: true } },
        skills: { include: { skill: { select: { id: true, name: true } } } },
        objectives: { include: { objective: { select: { id: true, text: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Failed to fetch class resources:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch resources', details: errorMessage },
      { status: 500 }
    );
  }
}

// POST: Create a class-scoped resource
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

    // Verify class exists and user is the instructor
    const improvClass = await prisma.improvClass.findUnique({
      where: { id: classId },
      select: { id: true, organizationId: true, instructorId: true },
    });

    if (!improvClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (improvClass.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the class instructor can create resources' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      url,
      fileKey,
      fileName,
      fileSize,
      mimeType,
      type,
      format,
      tags,
      skillIds = [],
      objectiveIds = [],
    } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      );
    }

    // Create resource with visibility: 'class'
    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        url: url || null,
        fileKey: fileKey || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        type,
        format: format || null,
        visibility: 'class',
        classId: improvClass.id,
        tags: tags || null,
        organizationId: improvClass.organizationId,
        createdById: session.user.id,
        skills: {
          create: skillIds.map((skillId: string) => ({ skillId })),
        },
        objectives: {
          create: objectiveIds.map((objectiveId: string) => ({ objectiveId })),
        },
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        skills: { include: { skill: { select: { id: true, name: true } } } },
        objectives: { include: { objective: { select: { id: true, text: true } } } },
      },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    console.error('Failed to create class resource:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to create resource', details: errorMessage },
      { status: 500 }
    );
  }
}
