import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/students/[studentId]/progress
 * Handled by dynamic route: app/api/students/[studentId]/route.ts
 */

/**
 * GET /api/students
 * List all students in an organization (teachers/admins only)
 *
 * Query params:
 * - domain: organizationId (required)
 * - classId: filter by class (optional)
 * - role: "student" | "teacher" (optional)
 *
 * Returns: Array of students with basic info
 * Auth: User logged in + org scope (teachers see only their class)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    // If teacher, only show their class students
    let k12Enrollments: any[] = [];
    if (classId) {
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

      // Get students in this class
      k12Enrollments = await prisma.k12Enrollment.findMany({
        where: {
          classId,
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          class: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          student: { name: "asc" },
        },
      });
    } else {
      // Get all students in organization (admins only)
      if (!["SuperAdmin", "SchoolAdmin"].includes(userOrgRole.role)) {
        return NextResponse.json(
          { error: "Access denied. Only admins can view all students" },
          { status: 403 }
        );
      }

      k12Enrollments = await prisma.k12Enrollment.findMany({
        where: {
          class: {
            organizationId: domain,
          },
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          class: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          student: { name: "asc" },
        },
      });
    }

    const students = k12Enrollments.map(enrollment => ({
      id: enrollment.student.id,
      name: enrollment.student.name,
      email: enrollment.student.email,
      classId: enrollment.class.id,
      className: enrollment.class.name,
      enrolledAt: enrollment.enrolledAt,
      status: enrollment.status,
    }));

    return NextResponse.json(
      {
        students,
        count: students.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
