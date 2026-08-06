import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ organizations });
  } catch (err) {
    console.error("Failed to fetch organizations:", err);
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, description, topic, logo, isPublic } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
    }

    // Generate slug from name
    const baseSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    let slug = baseSlug;
    let counter = 1;

    // Check for existing slug and append counter if needed
    while (true) {
      const existing = await prisma.organization.findFirst({
        where: { slug },
      });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        description: description || null,
        topic: topic || null,
        logo: logo || null,
        isPublic: isPublic || false,
      },
      include: {
        _count: {
          select: { learningCommunities: true, users: true },
        },
      },
    });

    // Add creator as SuperAdmin
    await prisma.organizationRole.create({
      data: {
        userId: session.user.id,
        organizationId: organization.id,
        role: "SuperAdmin",
      },
    });

    return NextResponse.json({ organization }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Organization name already exists" }, { status: 409 });
    }
    console.error("Failed to create organization:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
