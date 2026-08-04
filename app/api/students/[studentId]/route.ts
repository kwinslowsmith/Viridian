import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/students/[studentId]/progress
 * Get student's mastery progress across all standards
 *
 * Query params:
 * - domain: organizationId (required)
 * - classId: filter by class (optional)
 *
 * Returns: Student info + array of standards with mastery levels (1-4)
 * Auth: User logged in + org scope (teachers see only their class students)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { studentId } = await params;
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");
    const classId = searchParams.get("classId");

    if (!domain) {
      return NextResponse.json(
        { error: "Missing required query parameter: domain (organizationId)" },
        { status: 400 }
      );
    }

    // Verify user has access to this organization
    const userOrgRole = await prisma.organizationRole.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: domain,
        },
      },
    });

    if (!userOrgRole) {
      return NextResponse.json(
        { error: "Access denied to this organization" },
        { status: 403 }
      );
    }

    // Get student
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Build enrollment filter
    const enrollmentWhere: any = {
      studentId,
    };

    if (classId) {
      enrollmentWhere.classId = classId;

      // Verify teacher owns this class or is admin
      if (userOrgRole.role === "Teacher") {
        const isInstructor = await prisma.k12Class.findFirst({
          where: {
            id: classId,
            instructorId: session.user.id,
            organizationId: domain,
          },
        });
        if (!isInstructor) {
          return NextResponse.json(
            { error: "Access denied to this class" },
            { status: 403 }
          );
        }
      }
    } else {
      // If no classId, verify student is in a class the user can see
      if (userOrgRole.role === "Teacher") {
        const userClasses = await prisma.k12Class.findMany({
          where: {
            instructorId: session.user.id,
            organizationId: domain,
          },
          select: { id: true },
        });
        const classIds = userClasses.map(c => c.id);
        enrollmentWhere.classId = { in: classIds };
      }
    }

    // Get student's classes
    const enrollments = await prisma.k12Enrollment.findMany({
      where: enrollmentWhere,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            gradeLevel: true,
            subject: true,
          },
        },
      },
    });

    if (enrollments.length === 0 && classId) {
      return NextResponse.json(
        { error: "Student not found in this class" },
        { status: 404 }
      );
    }

    // Get student's progress across all standards in their classes
    const classIds = enrollments.map(e => e.classId);

    const studentProgress = await prisma.studentStandardProgress.findMany({
      where: {
        userId: studentId,
        organizationId: domain,
        classId: classIds.length > 0 ? { in: classIds } : undefined,
      },
      include: {
        standard: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            type: true,
            unit: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            skillCategory: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
        },
      },
      orderBy: {
        standard: {
          code: "asc",
        },
      },
    });

    // Get objective-level progress
    const objectiveProgress = await prisma.studentObjectiveProgress.findMany({
      where: {
        userId: studentId,
      },
      include: {
        objective: {
          select: {
            id: true,
            label: true,
            text: true,
            standardId: true,
          },
        },
      },
    });

    // Format response
    const skillsData = studentProgress.map(progress => ({
      standardId: progress.standard.id,
      standardCode: progress.standard.code,
      standardName: progress.standard.name,
      standardDescription: progress.standard.description,
      type: progress.standard.type,
      masteryLevel: progress.level || 0, // 0-4 scale (0 = no data, 1 = approaching, 2 = developing, 3 = proficient, 4 = advanced)
      completed: progress.completed,
      lastAssessedAt: progress.lastScoredAt,
      completedAt: progress.completedAt,
      classId: progress.classId,
      unit: progress.standard.unit,
      skillCategory: progress.standard.skillCategory,
    }));

    // Calculate summary stats
    const masteryLevels = skillsData.map(s => s.masteryLevel).filter(l => l > 0);
    const avgMastery =
      masteryLevels.length > 0
        ? (masteryLevels.reduce((a, b) => a + b, 0) / masteryLevels.length).toFixed(2)
        : 0;

    return NextResponse.json(
      {
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          classes: enrollments.map(e => ({
            id: e.class.id,
            name: e.class.name,
            gradeLevel: e.class.gradeLevel,
            subject: e.class.subject,
            enrolledAt: e.enrolledAt,
            status: e.status,
          })),
        },
        progress: {
          standards: skillsData,
          objectives: objectiveProgress.map(op => ({
            objectiveId: op.objective.id,
            objectiveLabel: op.objective.label,
            objectiveText: op.objective.text,
            standardId: op.objective.standardId,
            completed: op.completed,
            completedAt: op.completedAt,
          })),
        },
        summary: {
          totalStandards: skillsData.length,
          proficientCount: skillsData.filter(s => s.masteryLevel >= 3).length,
          developingCount: skillsData.filter(s => s.masteryLevel === 2).length,
          approachingCount: skillsData.filter(s => s.masteryLevel === 1).length,
          unassessedCount: skillsData.filter(s => s.masteryLevel === 0).length,
          averageMastery: avgMastery,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch student progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch student progress" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/students/[studentId]/progress
 * Update student's progress on a standard
 *
 * Body:
 * {
 *   domain: organizationId,
 *   classId: string,
 *   standardId: string,
 *   level: 1-4 (mastery level),
 *   completed?: boolean,
 *   objectiveProgressUpdates?: Array<{objectiveId, completed}>
 * }
 *
 * Auth: User logged in + teacher of the class
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { studentId } = await params;
    const body = await request.json();
    const {
      domain,
      classId,
      standardId,
      level,
      completed = false,
      objectiveProgressUpdates,
    } = body;

    if (!domain || !classId || !standardId) {
      return NextResponse.json(
        { error: "Missing required fields: domain, classId, standardId" },
        { status: 400 }
      );
    }

    if (level !== undefined && (level < 0 || level > 4)) {
      return NextResponse.json(
        { error: "Level must be between 0 and 4" },
        { status: 400 }
      );
    }

    // Verify user is instructor of this class
    const k12Class = await prisma.k12Class.findFirst({
      where: {
        id: classId,
        instructorId: session.user.id,
        organizationId: domain,
      },
    });

    if (!k12Class) {
      return NextResponse.json(
        { error: "Access denied. Only the class instructor can update progress" },
        { status: 403 }
      );
    }

    // Verify student is enrolled in this class
    const enrollment = await prisma.k12Enrollment.findUnique({
      where: {
        classId_studentId: {
          classId,
          studentId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Student not enrolled in this class" },
        { status: 404 }
      );
    }

    // Upsert student standard progress
    const progressRecord = await prisma.studentStandardProgress.upsert({
      where: {
        userId_standardId_organizationId: {
          userId: studentId,
          standardId,
          organizationId: domain,
        },
      },
      create: {
        userId: studentId,
        standardId,
        organizationId: domain,
        classId,
        level: level || null,
        completed,
        lastScoredAt: level !== undefined ? new Date() : null,
        completedAt: completed ? new Date() : null,
      },
      update: {
        level: level !== undefined ? level : undefined,
        completed: completed !== undefined ? completed : undefined,
        lastScoredAt: level !== undefined ? new Date() : undefined,
        completedAt: completed && !completed ? null : completed ? new Date() : undefined,
      },
      include: {
        standard: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
          },
        },
      },
    });

    // Update objective progress if provided
    if (objectiveProgressUpdates && Array.isArray(objectiveProgressUpdates)) {
      for (const update of objectiveProgressUpdates) {
        const { objectiveId, completed: objCompleted } = update;
        if (objectiveId) {
          await prisma.studentObjectiveProgress.upsert({
            where: {
              userId_objectiveId: {
                userId: studentId,
                objectiveId,
              },
            },
            create: {
              userId: studentId,
              objectiveId,
              completed: objCompleted || false,
              completedAt: objCompleted ? new Date() : null,
            },
            update: {
              completed: objCompleted || false,
              completedAt: objCompleted ? new Date() : null,
            },
          });
        }
      }
    }

    return NextResponse.json(
      {
        message: "Student progress updated",
        progress: {
          standardId: progressRecord.standard.id,
          standardCode: progressRecord.standard.code,
          standardName: progressRecord.standard.name,
          masteryLevel: progressRecord.level,
          completed: progressRecord.completed,
          lastAssessedAt: progressRecord.lastScoredAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update student progress:", error);
    return NextResponse.json(
      { error: "Failed to update student progress" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/students/[studentId]/progress
 * Delete student's progress on a standard
 *
 * Body:
 * {
 *   domain: organizationId,
 *   standardId: string
 * }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { studentId } = await params;
    const body = await request.json();
    const { domain, standardId } = body;

    if (!domain || !standardId) {
      return NextResponse.json(
        { error: "Missing required fields: domain, standardId" },
        { status: 400 }
      );
    }

    // Verify user has admin access to organization
    const userOrgRole = await prisma.organizationRole.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: domain,
        },
      },
    });

    if (!userOrgRole || !["SuperAdmin", "SchoolAdmin"].includes(userOrgRole.role)) {
      return NextResponse.json(
        { error: "Access denied. Only admins can delete student progress" },
        { status: 403 }
      );
    }

    // Delete progress record
    await prisma.studentStandardProgress.deleteMany({
      where: {
        userId: studentId,
        standardId,
        organizationId: domain,
      },
    });

    return NextResponse.json(
      { message: "Student progress deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete student progress:", error);
    return NextResponse.json(
      { error: "Failed to delete student progress" },
      { status: 500 }
    );
  }
}
