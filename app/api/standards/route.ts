import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/standards?domain=[organizationId]
 * List all standards for a domain/school
 *
 * Query params:
 * - domain: organizationId (required)
 * - type: "skill" | "content" (optional filter)
 * - unitId: filter by unit (optional)
 * - skillCategoryId: filter by skill category (optional)
 *
 * Returns: Array of standards with ID, name, description, metadata
 * Auth: User logged in + org scope
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");
    const type = searchParams.get("type"); // "skill" or "content"
    const unitId = searchParams.get("unitId");
    const skillCategoryId = searchParams.get("skillCategoryId");

    if (!domain) {
      return NextResponse.json(
        { error: "Missing required query parameter: domain (organizationId)" },
        { status: 400 }
      );
    }

    // Verify user has access to this organization
    const userOrgRole = await prisma.organizationRole.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: domain,
        },
      },
    });

    if (!userOrgRole) {
      return NextResponse.json(
        { error: "Access denied to this organization" },
        { status: 403 }
      );
    }

    // Build query filters
    const where: any = {
      organizationId: domain,
    };

    if (type) {
      where.type = type;
    }

    if (unitId) {
      where.unitId = unitId;
    }

    if (skillCategoryId) {
      where.skillCategoryId = skillCategoryId;
    }

    // Fetch standards with related data
    const standards = await prisma.standard.findMany({
      where,
      include: {
        unit: true,
        skillCategory: true,
        exampleObjectives: {
          orderBy: { sequenceNum: "asc" },
        },
        _count: {
          select: {
            studentProgress: true,
            resources: true,
          },
        },
      },
      orderBy: [
        { type: "asc" },
        { code: "asc" },
      ],
    });

    // Format response
    const formattedStandards = standards.map(standard => ({
      id: standard.id,
      code: standard.code,
      name: standard.name,
      description: standard.description,
      type: standard.type,
      passPercentage: standard.passPercentage,
      unit: standard.unit,
      skillCategory: standard.skillCategory,
      objectiveCount: standard.exampleObjectives.length,
      objectives: standard.exampleObjectives,
      stats: {
        studentsTracked: standard._count.studentProgress,
        resourcesLinked: standard._count.resources,
      },
    }));

    return NextResponse.json(
      {
        standards: formattedStandards,
        count: formattedStandards.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch standards:", error);
    return NextResponse.json(
      { error: "Failed to fetch standards" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/standards
 * Create a new standard in an organization
 *
 * Body:
 * {
 *   domain: organizationId,
 *   code: string,
 *   name: string,
 *   description?: string,
 *   type: "skill" | "content",
 *   unitId?: string (for content standards),
 *   skillCategoryId?: string (for skill standards),
 *   passPercentage?: number (default 80),
 *   objectives?: Array<{label, text, description}>
 * }
 *
 * Auth: User logged in + org admin
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      domain,
      code,
      name,
      description,
      type = "content",
      unitId,
      skillCategoryId,
      passPercentage = 80,
      objectives,
    } = body;

    if (!domain || !code || !name) {
      return NextResponse.json(
        { error: "Missing required fields: domain, code, name" },
        { status: 400 }
      );
    }

    // Verify user is org admin
    const userOrgRole = await prisma.organizationRole.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: domain,
        },
      },
    });

    if (!userOrgRole || !["SuperAdmin", "SchoolAdmin"].includes(userOrgRole.role)) {
      return NextResponse.json(
        { error: "Access denied. Only admins can create standards" },
        { status: 403 }
      );
    }

    // Validate type-specific requirements
    if (type === "content" && !unitId) {
      return NextResponse.json(
        { error: "Content standards require unitId" },
        { status: 400 }
      );
    }

    if (type === "skill" && !skillCategoryId) {
      return NextResponse.json(
        { error: "Skill standards require skillCategoryId" },
        { status: 400 }
      );
    }

    // Create standard
    const standard = await prisma.standard.create({
      data: {
        organizationId: domain,
        code,
        name,
        description: description || null,
        type,
        unitId: type === "content" ? unitId : null,
        skillCategoryId: type === "skill" ? skillCategoryId : null,
        passPercentage,
        exampleObjectives: objectives
          ? {
              createMany: {
                data: objectives.map(
                  (obj: { label: string; text: string; description?: string }, index: number) => ({
                    label: obj.label,
                    text: obj.text,
                    description: obj.description || null,
                    sequenceNum: index,
                  })
                ),
              },
            }
          : undefined,
      },
      include: {
        unit: true,
        skillCategory: true,
        exampleObjectives: {
          orderBy: { sequenceNum: "asc" },
        },
      },
    });

    return NextResponse.json(
      {
        id: standard.id,
        code: standard.code,
        name: standard.name,
        description: standard.description,
        type: standard.type,
        passPercentage: standard.passPercentage,
        unit: standard.unit,
        skillCategory: standard.skillCategory,
        objectives: standard.exampleObjectives,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create standard:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Standard code already exists in this organization" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create standard" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/standards
 * Update an existing standard
 *
 * Body:
 * {
 *   standardId: string,
 *   name?: string,
 *   description?: string,
 *   passPercentage?: number,
 *   ... other fields
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { standardId, domain, ...updateData } = body;

    if (!standardId || !domain) {
      return NextResponse.json(
        { error: "Missing required fields: standardId, domain" },
        { status: 400 }
      );
    }

    // Verify user is org admin
    const userOrgRole = await prisma.organizationRole.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: domain,
        },
      },
    });

    if (!userOrgRole || !["SuperAdmin", "SchoolAdmin"].includes(userOrgRole.role)) {
      return NextResponse.json(
        { error: "Access denied. Only admins can update standards" },
        { status: 403 }
      );
    }

    // Verify standard belongs to org
    const standard = await prisma.standard.findUnique({
      where: { id: standardId },
    });

    if (!standard || standard.organizationId !== domain) {
      return NextResponse.json(
        { error: "Standard not found in this organization" },
        { status: 404 }
      );
    }

    // Update standard
    const updated = await prisma.standard.update({
      where: { id: standardId },
      data: updateData,
      include: {
        unit: true,
        skillCategory: true,
        exampleObjectives: {
          orderBy: { sequenceNum: "asc" },
        },
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Failed to update standard:", error);
    return NextResponse.json(
      { error: "Failed to update standard" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/standards
 * Delete a standard
 *
 * Body:
 * {
 *   standardId: string,
 *   domain: organizationId
 * }
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { standardId, domain } = body;

    if (!standardId || !domain) {
      return NextResponse.json(
        { error: "Missing required fields: standardId, domain" },
        { status: 400 }
      );
    }

    // Verify user is org admin
    const userOrgRole = await prisma.organizationRole.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: domain,
        },
      },
    });

    if (!userOrgRole || !["SuperAdmin", "SchoolAdmin"].includes(userOrgRole.role)) {
      return NextResponse.json(
        { error: "Access denied. Only admins can delete standards" },
        { status: 403 }
      );
    }

    // Verify standard belongs to org
    const standard = await prisma.standard.findUnique({
      where: { id: standardId },
    });

    if (!standard || standard.organizationId !== domain) {
      return NextResponse.json(
        { error: "Standard not found in this organization" },
        { status: 404 }
      );
    }

    // Delete standard (cascade deletes related data)
    await prisma.standard.delete({
      where: { id: standardId },
    });

    return NextResponse.json(
      { message: "Standard deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete standard:", error);
    return NextResponse.json(
      { error: "Failed to delete standard" },
      { status: 500 }
    );
  }
}
