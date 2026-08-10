import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const classId = request.nextUrl.searchParams.get("classId");

    if (!classId) {
      return NextResponse.json(
        { error: "classId query parameter is required" },
        { status: 400 }
      );
    }

    // Get student enrollment
    const enrollment = await prisma.k12Enrollment.findFirst({
      where: { classId, studentId },
      include: {
        student: { select: { id: true, name: true, email: true } },
        class: { select: { id: true, name: true } },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Get class standards
    const classStandards = await prisma.classStandard.findMany({
      where: { classId },
    });

    const standardIds = classStandards.map((cs) => cs.standardId);

    // Get standards with objectives
    const standards = await prisma.standard.findMany({
      where: { id: { in: standardIds } },
      include: {
        exampleObjectives: {
          orderBy: { sequenceNum: "asc" },
          include: {
            classObjectives: {
              where: { classId, isActive: true },
              take: 1,
            },
          },
        },
      },
    });

    // Build comparison data
    const comparison = standards.map((standard) => ({
      standardId: standard.id,
      standardCode: standard.code,
      standardName: standard.name,
      objectives: standard.exampleObjectives
        .filter((obj) => obj.classObjectives.length > 0)
        .map((obj) => {
          const customization = obj.classObjectives[0];
          return {
            id: obj.id,
            label: obj.label,
            text: customization?.customText || obj.text,
            // TODO: Fetch actual student and teacher ratings
            studentRating: null, // Will be filled from StudentObjectiveRating
            teacherRating: null, // Will be filled from TeacherObjectiveRating
          };
        }),
    }));

    return NextResponse.json({
      classId,
      className: enrollment.class.name,
      studentName: enrollment.student.name,
      studentId,
      standards: comparison,
    });
  } catch (err) {
    console.error("Failed to fetch comparison:", err);
    return NextResponse.json(
      { error: "Failed to fetch comparison" },
      { status: 500 }
    );
  }
}
