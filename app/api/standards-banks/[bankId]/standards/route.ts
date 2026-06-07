import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bankId: string }> }
) {
  try {
    const { bankId } = await params;
    const { code, name, description, exampleObjectives } = await request.json();

    if (!code || !name) {
      return NextResponse.json(
        { error: "Missing required fields: code, name" },
        { status: 400 }
      );
    }

    // Verify standards bank exists
    const bank = await prisma.standardsBank.findUnique({
      where: { id: bankId },
    });

    if (!bank) {
      return NextResponse.json(
        { error: "Standards bank not found" },
        { status: 404 }
      );
    }

    // Create standard
    const standard = await prisma.standard.create({
      data: {
        standardsBankId: bankId,
        code,
        name,
        description: description || null,
        exampleObjectives: {
          createMany: {
            data:
              exampleObjectives?.map(
                (obj: { label: string; text: string; description?: string }, index: number) => ({
                  label: obj.label,
                  text: obj.text,
                  description: obj.description || null,
                  sequenceNum: index,
                })
              ) || [],
          },
        },
      },
      include: {
        exampleObjectives: { orderBy: { sequenceNum: "asc" } },
      },
    });

    return NextResponse.json(standard, { status: 201 });
  } catch (err: any) {
    console.error("Failed to create standard:", err);
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Standard code already exists in this bank" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create standard" },
      { status: 500 }
    );
  }
}
