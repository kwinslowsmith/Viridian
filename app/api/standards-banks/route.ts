import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const standardsBanks = await prisma.standardsBank.findMany({
      include: {
        standards: {
          include: {
            exampleObjectives: { orderBy: { sequenceNum: "asc" } },
            resources: { select: { id: true, type: true, title: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ standardsBanks });
  } catch (err) {
    console.error("Failed to fetch standards banks:", err);
    return NextResponse.json(
      { error: "Failed to fetch standards banks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, subject, gradeLevel, description, source } =
      await request.json();

    if (!name || !subject || !gradeLevel) {
      return NextResponse.json(
        {
          error: "Missing required fields: name, subject, gradeLevel",
        },
        { status: 400 }
      );
    }

    const standardsBank = await prisma.standardsBank.create({
      data: {
        name,
        subject,
        gradeLevel,
        description: description || null,
        source: source || null,
      },
    });

    return NextResponse.json(standardsBank, { status: 201 });
  } catch (err) {
    console.error("Failed to create standards bank:", err);
    return NextResponse.json(
      { error: "Failed to create standards bank" },
      { status: 500 }
    );
  }
}
