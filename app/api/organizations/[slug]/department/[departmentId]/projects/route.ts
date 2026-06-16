import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; departmentId: string }> }
) {
  try {
    const { slug, departmentId } = await params;

    // Verify org exists
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get projects for this department
    const projects = await prisma.project.findMany({
      where: {
        departmentId,
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        lead: p.lead,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; departmentId: string }> }
) {
  try {
    const { slug, departmentId } = await params;
    const body = await request.json();
    const { name, description, leadId } = body;

    // Verify org and department exist
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const department = await prisma.organizationalUnit.findUnique({
      where: { id: departmentId },
      select: { id: true, organizationId: true },
    });

    if (!department || department.organizationId !== org.id) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        scope: 'department',
        organizationId: org.id,
        departmentId,
        leadId,
        status: 'planning',
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
