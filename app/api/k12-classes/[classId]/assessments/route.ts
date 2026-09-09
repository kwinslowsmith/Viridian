import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/k12-classes/[classId]/assessments
 * Returns all assessments for a class with submission counts
 */
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
    if (!classId || typeof classId !== 'string' || classId.trim() === '') {
      return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 });
    }

    // Verify user is instructor for this class
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: { instructorId: true },
    });

    if (!k12Class || k12Class.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all assessments with submission counts
    const assessments = await prisma.k12Assessment.findMany({
      where: { classId },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        dueDate: true,
        objectiveIds: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate graded count for each assessment
    const assessmentsWithCounts = await Promise.all(
      assessments.map(async (assessment) => {
        const gradedCount = await prisma.k12Submission.count({
          where: {
            assessmentId: assessment.id,
            grade: { not: null },
          },
        });

        return {
          id: assessment.id,
          title: assessment.title,
          description: assessment.description,
          type: assessment.type,
          dueDate: assessment.dueDate,
          objectiveIds: assessment.objectiveIds ? JSON.parse(assessment.objectiveIds) : [],
          submissionCount: assessment._count.submissions,
          gradedCount,
          createdAt: assessment.createdAt,
          updatedAt: assessment.updatedAt,
        };
      })
    );

    return NextResponse.json(assessmentsWithCounts);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/k12-classes/[classId]/assessments
 * Creates a new assessment
 * Body: { title, description?, type, objectiveIds[], dueDate? }
 */
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
    if (!classId || typeof classId !== 'string' || classId.trim() === '') {
      return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 });
    }

    // Verify user is instructor for this class
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: { instructorId: true, id: true },
    });

    if (!k12Class || k12Class.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, type, objectiveIds, dueDate } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!type || !['formative', 'summative'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "formative" or "summative"' },
        { status: 400 }
      );
    }

    if (objectiveIds && !Array.isArray(objectiveIds)) {
      return NextResponse.json(
        { error: 'objectiveIds must be an array' },
        { status: 400 }
      );
    }

    // Create assessment
    const assessment = await prisma.k12Assessment.create({
      data: {
        classId,
        title: title.trim(),
        description: description?.trim() || null,
        type,
        objectiveIds: objectiveIds ? JSON.stringify(objectiveIds) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        standardId: '', // Placeholder - will be set by teacher UI later
        createdBy: session.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        dueDate: true,
        objectiveIds: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        ...assessment,
        objectiveIds: assessment.objectiveIds ? JSON.parse(assessment.objectiveIds) : [],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}
