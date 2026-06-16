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

    // TODO: Add departmentId to K12Class schema to properly associate classes with departments
    // For now, return all org classes (department filtering can be added later)
    const classes = await prisma.k12Class.findMany({
      where: { organizationId: org.id },
      select: {
        id: true,
        name: true,
        gradeLevel: true,
        subject: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ classes });
  } catch (error) {
    console.error('Failed to fetch classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}
