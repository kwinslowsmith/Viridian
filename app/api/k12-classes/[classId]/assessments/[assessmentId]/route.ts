import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/k12-classes/[classId]/assessments/[assessmentId]
 * Returns a specific assessment with all submissions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; assessmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, assessmentId } = await params;
    if (!classId || !assessmentId) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Verify user is instructor for this class
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: { instructorId: true },
    });

    if (!k12Class || k12Class.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get assessment with submissions
    const assessment = await prisma.k12Assessment.findUnique({
      where: { id: assessmentId },
      select: {
        id: true,
        classId: true,
        title: true,
        description: true,
        type: true,
        dueDate: true,
        objectiveIds: true,
        createdAt: true,
        updatedAt: true,
        submissions: {
          select: {
            id: true,
            studentId: true,
            enrollmentId: true,
            submittedAt: true,
            grade: true,
            feedback: true,
            status: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!assessment || assessment.classId !== classId) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Enrich submissions with student names
    const enrichedSubmissions = await Promise.all(
      assessment.submissions.map(async (sub) => {
        const student = await prisma.user.findUnique({
          where: { id: sub.studentId },
          select: { name: true, email: true },
        });
        return {
          ...sub,
          studentName: student?.name || 'Unknown',
          studentEmail: student?.email || '',
        };
      })
    );

    return NextResponse.json({
      ...assessment,
      objectiveIds: assessment.objectiveIds ? JSON.parse(assessment.objectiveIds) : [],
      submissions: enrichedSubmissions,
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/k12-classes/[classId]/assessments/[assessmentId]
 * Updates an assessment
 * Body: { title?, description?, dueDate? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; assessmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, assessmentId } = await params;
    if (!classId || !assessmentId) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Verify user is instructor for this class
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: { instructorId: true },
    });

    if (!k12Class || k12Class.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify assessment exists and belongs to this class
    const assessment = await prisma.k12Assessment.findUnique({
      where: { id: assessmentId },
      select: { classId: true },
    });

    if (!assessment || assessment.classId !== classId) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, dueDate } = body;

    // Build update data
    const updateData: any = {};
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return NextResponse.json(
          { error: 'Title must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Update assessment
    const updated = await prisma.k12Assessment.update({
      where: { id: assessmentId },
      data: updateData,
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

    return NextResponse.json({
      ...updated,
      objectiveIds: updated.objectiveIds ? JSON.parse(updated.objectiveIds) : [],
    });
  } catch (error) {
    console.error('Error updating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/k12-classes/[classId]/assessments/[assessmentId]
 * Deletes an assessment and all its submissions
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; assessmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, assessmentId } = await params;
    if (!classId || !assessmentId) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Verify user is instructor for this class
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
      select: { instructorId: true },
    });

    if (!k12Class || k12Class.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify assessment exists and belongs to this class
    const assessment = await prisma.k12Assessment.findUnique({
      where: { id: assessmentId },
      select: { classId: true, id: true },
    });

    if (!assessment || assessment.classId !== classId) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Delete assessment (cascades to submissions)
    await prisma.k12Assessment.delete({
      where: { id: assessmentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to delete assessment' },
      { status: 500 }
    );
  }
}
