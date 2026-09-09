import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/k12-classes/[classId]/intervention-groups
 * Returns all intervention groups for a class
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
    if (!classId) {
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

    // Get all intervention groups with their students
    const groups = await prisma.interventionGroup.findMany({
      where: { classId },
      select: {
        id: true,
        name: true,
        objectiveId: true,
        objective: {
          select: {
            id: true,
            label: true,
            text: true,
            standard: {
              select: { name: true },
            },
          },
        },
        meetingSchedule: true,
        startDate: true,
        endDate: true,
        students: {
          select: {
            studentId: true,
            enrollment: {
              select: { studentId: true },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = groups.map((group) => ({
      groupId: group.id,
      name: group.name,
      objectiveId: group.objectiveId,
      objectiveLabel: group.objective.label,
      objectiveText: group.objective.text,
      standardName: group.objective.standard.name,
      studentCount: group.students.length,
      studentIds: group.students.map((s) => s.enrollment.studentId),
      meetingSchedule: group.meetingSchedule,
      startDate: group.startDate,
      endDate: group.endDate,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching intervention groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch intervention groups' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/k12-classes/[classId]/intervention-groups
 * Creates a new intervention group
 * Body: { name, objectiveId, meetingSchedule, startDate }
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
    if (!classId) {
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

    const body = await request.json();
    const { name, objectiveId, meetingSchedule, startDate } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    if (!objectiveId || typeof objectiveId !== 'string') {
      return NextResponse.json(
        { error: 'objectiveId is required' },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        { error: 'startDate is required' },
        { status: 400 }
      );
    }

    // Verify objective exists
    const objective = await prisma.exampleObjective.findUnique({
      where: { id: objectiveId },
      select: { id: true },
    });

    if (!objective) {
      return NextResponse.json(
        { error: 'Objective not found' },
        { status: 404 }
      );
    }

    // Create intervention group
    const group = await prisma.interventionGroup.create({
      data: {
        classId,
        name: name.trim(),
        objectiveId,
        meetingSchedule: meetingSchedule?.trim() || null,
        startDate: new Date(startDate),
        endDate: null,
        createdBy: session.user.id,
      },
      select: {
        id: true,
        name: true,
        objectiveId: true,
        objective: {
          select: {
            label: true,
            text: true,
            standard: { select: { name: true } },
          },
        },
        meetingSchedule: true,
        startDate: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        groupId: group.id,
        name: group.name,
        objectiveId: group.objectiveId,
        objectiveLabel: group.objective.label,
        objectiveText: group.objective.text,
        standardName: group.objective.standard.name,
        studentCount: 0,
        studentIds: [],
        meetingSchedule: group.meetingSchedule,
        startDate: group.startDate,
        createdAt: group.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating intervention group:', error);
    return NextResponse.json(
      { error: 'Failed to create intervention group' },
      { status: 500 }
    );
  }
}
