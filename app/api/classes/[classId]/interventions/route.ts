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

    const interventions = await prisma.interventionBlock.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ interventions });
  } catch (err) {
    console.error("Failed to fetch interventions:", err);
    return NextResponse.json(
      { error: "Failed to fetch interventions" },
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
    const { organizationId, weekNum, title, description, date, createdById } =
      await request.json();

    if (!organizationId || !weekNum || !title || !date || !createdById) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const intervention = await prisma.interventionBlock.create({
      data: {
        classId,
        organizationId,
        weekNum,
        title,
        description,
        date: new Date(date),
        createdById,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ intervention }, { status: 201 });
  } catch (err) {
    console.error("Failed to create intervention:", err);
    return NextResponse.json(
      { error: "Failed to create intervention" },
      { status: 500 }
    );
  }
}
