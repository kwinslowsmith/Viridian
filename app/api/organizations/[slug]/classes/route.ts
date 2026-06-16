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
    const k12Classes = await prisma.k12Class.findMany({
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
      },
      orderBy: { name: 'asc' },
    });

    // Get all Improv classes
    const improvClasses = await prisma.improvClass.findMany({
      where: { organizationId: org.id },
      select: {
        id: true,
        name: true,
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
        weeks: {
          select: { id: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const allClasses = [
      ...k12Classes.map((cls) => ({
        id: cls.id,
        name: cls.name,
        gradeLevel: cls.gradeLevel,
        subject: cls.subject,
        instructor: cls.instructor,
        type: 'k12',
        weeks: undefined,
        _count: { enrollments: 0 },
      })),
      ...improvClasses.map((cls) => ({
        id: cls.id,
        name: cls.name,
        instructor: cls.instructor,
        type: 'improv',
        weeks: cls.weeks,
        _count: cls._count,
      })),
    ];

    return NextResponse.json({
      classes: allClasses,
    });
  } catch (error) {
    console.error('Failed to fetch classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}
