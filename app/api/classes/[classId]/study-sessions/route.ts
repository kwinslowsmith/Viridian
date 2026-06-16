import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const { weekNum } = Object.fromEntries(request.nextUrl.searchParams);

    const where: any = { classId };
    if (weekNum) {
      where.weekNum = parseInt(weekNum as string);
    }

    const sessions = await prisma.studySession.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("Failed to fetch study sessions:", err);
    return NextResponse.json(
      { error: "Failed to fetch study sessions" },
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
    const {
      organizationId,
      weekNum,
      title,
      description,
      date,
      isStudentCreated,
      createdById,
    } = await request.json();

    if (!organizationId || !weekNum || !title || !date || !createdById) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const session = await prisma.studySession.create({
      data: {
        classId,
        organizationId,
        weekNum,
        title,
        description,
        date: new Date(date),
        isStudentCreated: isStudentCreated || false,
        createdById,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (err) {
    console.error("Failed to create study session:", err);
    return NextResponse.json(
      { error: "Failed to create study session" },
      { status: 500 }
    );
  }
}
