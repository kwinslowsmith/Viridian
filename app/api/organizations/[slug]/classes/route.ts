import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find organization
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get all K12 classes
    const classes = await prisma.k12Class.findMany({
      where: { organizationId: org.id },
      select: {
        id: true,
        name: true,
        gradeLevel: true,
        subject: true,
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      classes: classes.map((cls) => ({
        ...cls,
        type: 'k12',
      })),
    });
  } catch (error) {
    console.error('Failed to fetch classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}
