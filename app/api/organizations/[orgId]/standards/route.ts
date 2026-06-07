import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;

    const distributions = await prisma.standardsDistribution.findMany({
      where: { organizationId: orgId },
      include: {
        standard: {
          include: {
            standardsBank: true,
            exampleObjectives: true,
            resources: true,
          },
        },
      },
      orderBy: { distributedAt: "desc" },
    });

    return NextResponse.json({ distributions });
  } catch (err) {
    console.error("Failed to fetch org standards:", err);
    return NextResponse.json(
      { error: "Failed to fetch standards" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const { standardId, distributedBy } = await request.json();

    if (!standardId || !distributedBy) {
      return NextResponse.json(
        { error: "Missing required fields: standardId, distributedBy" },
        { status: 400 }
      );
    }

    // Verify org exists
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
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

    const distribution = await prisma.standardsDistribution.create({
      data: {
        standardId,
        organizationId: orgId,
        distributedBy,
        status: "available",
      },
      include: {
        standard: {
          include: {
            standardsBank: true,
            exampleObjectives: true,
          },
        },
      },
    });

    return NextResponse.json(distribution, { status: 201 });
  } catch (err: any) {
    console.error("Failed to distribute standard:", err);
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Standard already distributed to this organization" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to distribute standard" },
      { status: 500 }
    );
  }
}
