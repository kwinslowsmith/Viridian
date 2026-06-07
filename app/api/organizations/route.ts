import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
    const { name } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
    }

    const organization = await prisma.organization.create({
      data: { name },
    });

    return NextResponse.json({ organization }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Organization name already exists" }, { status: 409 });
    }
    console.error("Failed to create organization:", err);
    return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
  }
}
