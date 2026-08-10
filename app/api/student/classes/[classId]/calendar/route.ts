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

    // Verify student is enrolled
    const enrollment = await prisma.k12Enrollment.findFirst({
      where: { classId, studentId },
      include: { class: true },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Student not enrolled in this class" },
        { status: 403 }
      );
    }

    // Get weeks for the class
    const weeks = await prisma.k12Week.findMany({
      where: { classId },
      orderBy: { weekNum: "asc" },
    });

    // Get class standards and objectives
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

    // Build calendar data
    const calendarWeeks = weeks.map((week) => ({
      weekNumber: week.weekNum,
      startDate: week.startDate,
      endDate: week.endDate,
      title: week.title,
      unit: week.unit,
    }));

    // Flatten objectives from all standards
    const allObjectives = standards.flatMap((standard) =>
      standard.exampleObjectives
        .filter((obj) => obj.classObjectives.length > 0)
        .map((obj) => ({
          id: obj.id,
          label: obj.label,
          text: obj.classObjectives[0]?.customText || obj.text,
          standardName: standard.name,
          standardCode: standard.code,
        }))
    );

    return NextResponse.json({
      classId,
      className: enrollment.class.name,
      studentId,
      weeks: calendarWeeks,
      objectives: allObjectives,
    });
  } catch (err) {
    console.error("Failed to fetch calendar:", err);
    return NextResponse.json(
      { error: "Failed to fetch calendar" },
      { status: 500 }
    );
  }
}
