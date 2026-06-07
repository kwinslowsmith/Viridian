import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bankId: string }> }
) {
  try {
    const { bankId } = await params;

    const standardsBank = await prisma.standardsBank.findUnique({
      where: { id: bankId },
      include: {
        standards: {
          include: {
            exampleObjectives: { orderBy: { sequenceNum: "asc" } },
            resources: true,
          },
          orderBy: { code: "asc" },
        },
      },
    });

    if (!standardsBank) {
      return NextResponse.json(
        { error: "Standards bank not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(standardsBank);
  } catch (err) {
    console.error("Failed to fetch standards bank:", err);
    return NextResponse.json(
      { error: "Failed to fetch standards bank" },
      { status: 500 }
    );
  }
}
