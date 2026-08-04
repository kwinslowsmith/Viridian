import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/classes/[classId]/mastery-summary
 * Get class-level mastery grid (rows=students, cols=standards, cells=mastery level 1-4)
 *
 * Query params:
 * - domain: organizationId (required)
 * - type: "skill" | "content" (optional filter)
 * - unitId: filter by unit (optional)
 *
 * Returns: Grid data with students, standards, and mastery matrix
 * Auth: User logged in + class instructor or admin
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { classId } = await params;
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");
    const type = searchParams.get("type");
    const unitId = searchParams.get("unitId");

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

    // Get class
    const k12Class = await prisma.k12Class.findFirst({
      where: {
        id: classId,
        organizationId: domain,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!k12Class) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    // Verify user is instructor or admin
    if (
      k12Class.instructorId !== session.user.id &&
      !["SuperAdmin", "SchoolAdmin"].includes(userOrgRole.role)
    ) {
      return NextResponse.json(
        { error: "Access denied to this class" },
        { status: 403 }
      );
    }

    // Get all students in the class
    const enrollments = await prisma.k12Enrollment.findMany({
      where: {
        classId,
        status: "active",
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        student: { name: "asc" },
      },
    });

    // Build standard filter
    const standardWhere: any = {
      organizationId: domain,
    };

    if (type) {
      standardWhere.type = type;
    }

    if (unitId) {
      standardWhere.unitId = unitId;
    }

    // Get all standards for the class
    const standards = await prisma.standard.findMany({
      where: standardWhere,
      include: {
        unit: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        skillCategory: {
          select: {
            id: true,
            code: true,
            name: true,
            icon: true,
          },
        },
      },
      orderBy: [
        { type: "asc" },
        { code: "asc" },
      ],
    });

    // Get all progress records for all students in this class
    const allProgress = await prisma.studentStandardProgress.findMany({
      where: {
        classId,
        organizationId: domain,
      },
      select: {
        userId: true,
        standardId: true,
        level: true,
        completed: true,
        lastScoredAt: true,
      },
    });

    // Build progress lookup map: { userId -> { standardId -> level } }
    const progressMap = new Map<string, Map<string, any>>();
    for (const progress of allProgress) {
      if (!progressMap.has(progress.userId)) {
        progressMap.set(progress.userId, new Map());
      }
      const userProgress = progressMap.get(progress.userId)!;
      userProgress.set(progress.standardId, {
        level: progress.level || 0,
        completed: progress.completed,
        lastScoredAt: progress.lastScoredAt,
      });
    }

    // Build matrix: rows are students, columns are standards
    const students = enrollments.map(enrollment => ({
      id: enrollment.student.id,
      name: enrollment.student.name,
      email: enrollment.student.email,
    }));

    const standardsColumn = standards.map(standard => ({
      id: standard.id,
      code: standard.code,
      name: standard.name,
      type: standard.type,
      unit: standard.unit,
      skillCategory: standard.skillCategory,
    }));

    // Build mastery matrix
    const matrix = students.map(student => {
      const row = {
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        masteryByStandard: standardsColumn.map(standard => {
          const userProgress = progressMap.get(student.id)?.get(standard.id);
          return {
            standardId: standard.id,
            standardCode: standard.code,
            standardName: standard.name,
            masteryLevel: userProgress?.level || 0, // 0-4 scale
            completed: userProgress?.completed || false,
            lastScoredAt: userProgress?.lastScoredAt,
          };
        }),
      };
      return row;
    });

    // Calculate class-level summary statistics
    const totalStudents = students.length;
    const totalStandards = standards.length;
    let proficientCount = 0;
    let developingCount = 0;
    let approachingCount = 0;
    let unassessedCount = 0;

    for (const entry of allProgress) {
      if (entry.level === undefined || entry.level === null || entry.level === 0) {
        unassessedCount++;
      } else if (entry.level >= 3) {
        proficientCount++;
      } else if (entry.level === 2) {
        developingCount++;
      } else if (entry.level === 1) {
        approachingCount++;
      }
    }

    const avgMastery =
      allProgress.length > 0
        ? (
            allProgress
              .filter(p => p.level && p.level > 0)
              .reduce((sum, p) => sum + (p.level || 0), 0) /
            Math.max(
              1,
              allProgress.filter(p => p.level && p.level > 0).length
            )
          ).toFixed(2)
        : 0;

    return NextResponse.json(
      {
        class: {
          id: k12Class.id,
          name: k12Class.name,
          gradeLevel: k12Class.gradeLevel,
          subject: k12Class.subject,
          instructorId: k12Class.instructorId,
          instructorName: k12Class.instructor.name,
          organizationId: domain,
          organizationName: k12Class.organization.name,
        },
        students,
        standards: standardsColumn,
        matrix,
        summary: {
          totalStudents,
          totalStandards,
          totalAssessments: allProgress.length,
          proficientCount,
          developingCount,
          approachingCount,
          unassessedCount,
          averageMastery: parseFloat(avgMastery as string),
          proficiencyRate: totalStandards > 0 ? (proficientCount / (allProgress.length || 1) * 100).toFixed(1) : "0",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch mastery summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch mastery summary" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/classes/[classId]/mastery-summary/bulk-update
 * Bulk update mastery levels for multiple students
 *
 * Body:
 * {
 *   domain: organizationId,
 *   updates: Array<{
 *     studentId: string,
 *     standardId: string,
 *     level: 0-4
 *   }>
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { classId } = await params;
    const body = await request.json();
    const { domain, updates } = body;

    if (!domain || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Missing required fields: domain, updates" },
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

    // Process bulk updates
    const updateResults = [];
    for (const update of updates) {
      const { studentId, standardId, level } = update;

      if (!studentId || !standardId || level === undefined) {
        updateResults.push({
          studentId,
          standardId,
          status: "error",
          message: "Missing required fields",
        });
        continue;
      }

      if (level < 0 || level > 4) {
        updateResults.push({
          studentId,
          standardId,
          status: "error",
          message: "Level must be between 0 and 4",
        });
        continue;
      }

      try {
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
          updateResults.push({
            studentId,
            standardId,
            status: "error",
            message: "Student not enrolled in this class",
          });
          continue;
        }

        // Upsert progress
        await prisma.studentStandardProgress.upsert({
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
            lastScoredAt: new Date(),
          },
          update: {
            level: level || null,
            lastScoredAt: new Date(),
          },
        });

        updateResults.push({
          studentId,
          standardId,
          status: "success",
          level,
        });
      } catch (err) {
        updateResults.push({
          studentId,
          standardId,
          status: "error",
          message: "Database error",
        });
      }
    }

    return NextResponse.json(
      {
        message: "Bulk update complete",
        results: updateResults,
        successCount: updateResults.filter(r => r.status === "success").length,
        errorCount: updateResults.filter(r => r.status === "error").length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to bulk update mastery:", error);
    return NextResponse.json(
      { error: "Failed to bulk update mastery" },
      { status: 500 }
    );
  }
}
