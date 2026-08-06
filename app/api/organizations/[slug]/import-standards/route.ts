import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/organizations/[slug]/import-standards/available-banks
 * List all available StandardsBanks that can be imported into this org
 *
 * Returns: Array of StandardsBanks with metadata
 * Auth: User must be admin in the organization
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;

    // Get organization by slug to find ID
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const orgId = org.id;

    // Verify user has admin access to this organization
    const userOrgRole = await prisma.organizationRole.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: orgId,
        },
      },
    });

    if (!userOrgRole || userOrgRole.role !== "SuperAdmin") {
      return NextResponse.json(
        { error: "Access denied. Only admins can import standards." },
        { status: 403 }
      );
    }

    // Fetch all StandardsBanks
    const banks = await prisma.standardsBank.findMany({
      include: {
        _count: {
          select: {
            units: true,
            standards: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Check which banks are already imported to this org
    const importedBankIds = new Set(
      (
        await prisma.standard.findMany({
          where: { organizationId: orgId },
          select: { standardsBankId: true },
          distinct: ["standardsBankId"],
        })
      ).map((s) => s.standardsBankId).filter(Boolean) as string[]
    );

    const banksWithStatus = banks.map((bank) => ({
      id: bank.id,
      name: bank.name,
      subject: bank.subject,
      source: bank.source,
      description: bank.description,
      unitCount: bank._count.units,
      standardCount: bank._count.standards,
      isImported: importedBankIds.has(bank.id),
    }));

    return NextResponse.json({
      availableBanks: banksWithStatus,
      count: banksWithStatus.length,
    });
  } catch (error) {
    console.error("Failed to fetch available standards banks:", error);
    return NextResponse.json(
      { error: "Failed to fetch available standards banks" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations/[slug]/import-standards
 * Import all standards from a StandardsBank into an organization
 *
 * Body:
 * {
 *   standardsBankId: string (which bank to import)
 * }
 *
 * Returns: { imported: number, message: string }
 * Auth: User must be admin in the organization
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;

    // Get organization by slug to find ID
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const orgId = org.id;
    const { standardsBankId } = await request.json();

    if (!standardsBankId) {
      return NextResponse.json(
        { error: "Missing required field: standardsBankId" },
        { status: 400 }
      );
    }

    // Verify user has admin access to this organization
    const userOrgRole = await prisma.organizationRole.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: orgId,
        },
      },
    });

    if (!userOrgRole || userOrgRole.role !== "SuperAdmin") {
      return NextResponse.json(
        { error: "Access denied. Only admins can import standards." },
        { status: 403 }
      );
    }

    // Verify the StandardsBank exists
    const bank = await prisma.standardsBank.findUnique({
      where: { id: standardsBankId },
    });

    if (!bank) {
      return NextResponse.json(
        { error: "StandardsBank not found" },
        { status: 404 }
      );
    }

    // Fetch all units from this bank
    const unitsFromBank = await prisma.unit.findMany({
      where: { standardsBankId },
      include: {
        standards: {
          include: {
            exampleObjectives: {
              orderBy: { sequenceNum: "asc" },
            },
          },
        },
      },
      orderBy: { sequenceNum: "asc" },
    });

    let unitsCreated = 0;
    let standardsImported = 0;

    // Import units and standards into the organization
    for (const unitFromBank of unitsFromBank) {
      // Create or update unit in org
      const unitInOrg = await prisma.unit.upsert({
        where: {
          id: `${orgId}-unit-${unitFromBank.code}`,
        },
        update: {
          name: unitFromBank.name,
          subtitle: unitFromBank.subtitle,
          description: unitFromBank.description,
          sequenceNum: unitFromBank.sequenceNum,
        },
        create: {
          id: `${orgId}-unit-${unitFromBank.code}`,
          organizationId: orgId,
          code: unitFromBank.code,
          name: unitFromBank.name,
          subtitle: unitFromBank.subtitle,
          description: unitFromBank.description,
          sequenceNum: unitFromBank.sequenceNum,
        },
      });

      unitsCreated++;

      // Import standards from this unit
      for (const standardFromBank of unitFromBank.standards) {
        const standardInOrg = await prisma.standard.upsert({
          where: {
            id: `${orgId}-std-${standardFromBank.code}`,
          },
          update: {
            name: standardFromBank.name,
            description: standardFromBank.description,
            passPercentage: standardFromBank.passPercentage,
          },
          create: {
            id: `${orgId}-std-${standardFromBank.code}`,
            organizationId: orgId,
            standardsBankId: standardsBankId,
            type: standardFromBank.type,
            unitId: unitInOrg.id,
            code: standardFromBank.code,
            name: standardFromBank.name,
            description: standardFromBank.description,
            passPercentage: standardFromBank.passPercentage,
          },
        });

        standardsImported++;

        // Import example objectives
        for (const objective of standardFromBank.exampleObjectives) {
          await prisma.exampleObjective.upsert({
            where: {
              id: `${orgId}-obj-${objective.id}`,
            },
            update: {
              text: objective.text,
              learningTarget: objective.learningTarget,
              description: objective.description,
            },
            create: {
              id: `${orgId}-obj-${objective.id}`,
              standardId: standardInOrg.id,
              label: objective.label,
              text: objective.text,
              learningTarget: objective.learningTarget,
              description: objective.description,
              sequenceNum: objective.sequenceNum,
              source: "curriculum",
            },
          });
        }
      }
    }

    return NextResponse.json(
      {
        imported: standardsImported,
        unitsImported: unitsCreated,
        message: `Successfully imported ${standardsImported} standards from ${bank.name}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to import standards:", error);
    return NextResponse.json(
      { error: "Failed to import standards" },
      { status: 500 }
    );
  }
}
