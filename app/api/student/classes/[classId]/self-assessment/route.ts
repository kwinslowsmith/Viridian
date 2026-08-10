import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const studentId = request.nextUrl.searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId query parameter is required" },
        { status: 400 }
      );
    }

    // Verify student is enrolled in this class
    const enrollment = await prisma.k12Enrollment.findFirst({
      where: { classId, studentId },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Student not enrolled in this class" },
        { status: 403 }
      );
    }

    // Get the class
    const classData = await prisma.k12Class.findUnique({
      where: { id: classId },
    });

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Get standards with active objectives
    const classStandards = await prisma.classStandard.findMany({
      where: { classId },
    });

    const standardIds = classStandards.map((cs) => cs.standardId);

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

    // Filter to only active objectives
    const assessmentData = standards.map((standard) => ({
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
          };
        }),
    }));

    return NextResponse.json({
      classId,
      className: classData.name,
      studentId,
      standards: assessmentData,
    });
  } catch (err) {
    console.error("Failed to fetch assessment:", err);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const { studentId, assessments } = await request.json();

    if (!studentId || !Array.isArray(assessments)) {
      return NextResponse.json(
        { error: "studentId and assessments array are required" },
        { status: 400 }
      );
    }

    // Verify student is enrolled
    const enrollment = await prisma.k12Enrollment.findFirst({
      where: { classId, studentId },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Student not enrolled in this class" },
        { status: 403 }
      );
    }

    // Create student assessment records
    // For now, we'll store these as ImprovStudentRating records
    // TODO: Create a proper StudentObjectiveRating model

    return NextResponse.json(
      { message: "Assessments saved (feature in development)" },
      { status: 201 }
    );
  } catch (err) {
    console.error("Failed to save assessment:", err);
    return NextResponse.json(
      { error: "Failed to save assessment" },
      { status: 500 }
    );
  }
}
