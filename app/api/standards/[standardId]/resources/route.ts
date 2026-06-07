import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ standardId: string }> }
) {
  try {
    const { standardId } = await params;

    const resources = await prisma.standardResource.findMany({
      where: { standardId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ resources });
  } catch (err) {
    console.error("Failed to fetch resources:", err);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ standardId: string }> }
) {
  try {
    const { standardId } = await params;
    const { type, title, description, url, fileId, format, objectiveLabels, createdById } =
      await request.json();

    if (!type || !title || !createdById) {
      return NextResponse.json(
        {
          error: "Missing required fields: type, title, createdById",
        },
        { status: 400 }
      );
    }

    if (!["material", "assessment", "tool"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be: material, assessment, or tool" },
        { status: 400 }
      );
    }

    // Verify standard exists
    const standard = await prisma.standard.findUnique({
      where: { id: standardId },
    });

    if (!standard) {
      return NextResponse.json(
        { error: "Standard not found" },
        { status: 404 }
      );
    }

    const resource = await prisma.standardResource.create({
      data: {
        standardId,
        type,
        title,
        description: description || null,
        url: url || null,
        fileId: fileId || null,
        format: format || null,
        objectiveLabels: objectiveLabels || null,
        createdById,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (err) {
    console.error("Failed to create resource:", err);
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
}
