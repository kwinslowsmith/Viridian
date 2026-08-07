import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET: Get assessment(s) for this objective
// Teachers see all student assessments, students see only their own
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; objectiveId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, objectiveId } = await params;
    if (!classId || !objectiveId || typeof classId !== 'string' || typeof objectiveId !== 'string') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Check if user is the instructor and class exists
    const improvClass = await prisma.improvClass.findUnique({
      where: { id: classId },
    });

    if (!improvClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Verify objective exists
    const objective = await prisma.improvObjective.findUnique({
      where: { id: objectiveId },
    });

    if (!objective) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    const isTeacher = improvClass.instructorId === session.user.id;

    if (isTeacher) {
      // Return all assessments for this objective
      const assessments = await prisma.improvObjectiveAssessment.findMany({
        where: { objectiveId },
        include: {
          objective: {
            include: { skill: true },
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [
          { status: 'desc' }, // graded first
          { submittedAt: 'desc' },
        ],
      });

      return NextResponse.json({ assessments });
    } else {
      // Return only this student's assessment
      const assessment = await prisma.improvObjectiveAssessment.findUnique({
        where: {
          objectiveId_studentId: {
            objectiveId,
            studentId: session.user.id,
          },
        },
        include: {
          objective: {
            include: { skill: true },
          },
        },
      });

      if (!assessment) {
        return NextResponse.json({
          assessment: {
            objectiveId,
            studentId: session.user.id,
            classId,
            objective,
            status: 'not-started',
          },
        });
      }

      return NextResponse.json({ assessment });
    }
  } catch (error) {
    console.error('Failed to fetch assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}

// POST: Create or update student submission
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; objectiveId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, objectiveId } = await params;
    if (!classId || !objectiveId || typeof classId !== 'string' || typeof objectiveId !== 'string') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const body = await request.json();
    const {
      submissionType,
      submissionUrl,
      submissionText,
      studentRubricType,
      studentRating,
      studentFeedback,
    } = body;

    // Validate submissionType
    const validTypes = ['text', 'google-doc', 'url', 'file'];
    if (submissionType && !validTypes.includes(submissionType)) {
      return NextResponse.json(
        { error: 'Invalid submission type' },
        { status: 400 }
      );
    }

    // Verify objective exists
    const objective = await prisma.improvObjective.findUnique({
      where: { id: objectiveId },
    });

    if (!objective) {
      return NextResponse.json(
        { error: 'Objective not found' },
        { status: 404 }
      );
    }

    // Check student is enrolled in class
    const enrollment = await prisma.improvEnrollment.findUnique({
      where: {
        classId_studentId: {
          classId,
          studentId: session.user.id,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this class' },
        { status: 403 }
      );
    }

    const assessment = await prisma.improvObjectiveAssessment.upsert({
      where: {
        objectiveId_studentId: {
          objectiveId,
          studentId: session.user.id,
        },
      },
      update: {
        submissionType,
        submissionUrl: submissionType === 'google-doc' || submissionType === 'url' ? submissionUrl : null,
        submissionText: submissionType === 'text' ? submissionText : null,
        studentRubricType,
        studentRating: typeof studentRating === 'number' && studentRating >= 0 && studentRating <= 5 ? studentRating : null,
        studentFeedback,
        submittedAt: new Date(),
        status: 'submitted',
      },
      create: {
        objectiveId,
        studentId: session.user.id,
        classId,
        submissionType,
        submissionUrl: submissionType === 'google-doc' || submissionType === 'url' ? submissionUrl : null,
        submissionText: submissionType === 'text' ? submissionText : null,
        studentRubricType,
        studentRating: typeof studentRating === 'number' && studentRating >= 0 && studentRating <= 5 ? studentRating : null,
        studentFeedback,
        submittedAt: new Date(),
        status: 'submitted',
      },
      include: {
        objective: {
          include: { skill: true },
        },
      },
    });

    return NextResponse.json({ assessment }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit assessment:', error);
    return NextResponse.json(
      { error: 'Failed to submit assessment' },
      { status: 500 }
    );
  }
}

// PUT: Teacher feedback on assessment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; objectiveId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, objectiveId } = await params;
    if (!classId || !objectiveId || typeof classId !== 'string' || typeof objectiveId !== 'string') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const body = await request.json();
    const {
      studentId,
      teacherRubricType,
      teacherRating,
      teacherFeedback,
      rubricName,
    } = body;

    if (!studentId || typeof studentId !== 'string') {
      return NextResponse.json(
        { error: 'studentId required' },
        { status: 400 }
      );
    }

    // Validate teacherRating
    if (typeof teacherRating !== 'number' || (teacherRating !== 0 && teacherRating !== 1)) {
      return NextResponse.json(
        { error: 'teacherRating must be 0 or 1' },
        { status: 400 }
      );
    }

    // Verify instructor and class exists
    const improvClass = await prisma.improvClass.findUnique({
      where: { id: classId },
    });

    if (!improvClass || improvClass.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only instructor can provide feedback' },
        { status: 403 }
      );
    }

    // Verify objective exists
    const objective = await prisma.improvObjective.findUnique({
      where: { id: objectiveId },
    });

    if (!objective) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    // Check if assessment exists before updating
    const existingAssessment = await prisma.improvObjectiveAssessment.findUnique({
      where: {
        objectiveId_studentId: {
          objectiveId,
          studentId,
        },
      },
    });

    if (!existingAssessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    const assessment = await prisma.improvObjectiveAssessment.update({
      where: {
        objectiveId_studentId: {
          objectiveId,
          studentId,
        },
      },
      data: {
        teacherRubricType,
        teacherRating,
        teacherFeedback,
        rubricName,
        gradeAt: new Date(),
        status: 'graded',
      },
      include: {
        objective: {
          include: { skill: true },
        },
      },
    });

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error('Failed to update assessment:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment' },
      { status: 500 }
    );
  }
}
