import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const userId = request.headers.get('User-Id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Find organization by slug
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get classes where user is the instructor in this organization
    const classes = await prisma.improvClass.findMany({
      where: {
        organizationId: org.id,
        instructorId: userId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        weeks: {
          orderBy: { weekNum: 'asc' },
          select: {
            id: true,
            weekNum: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json({ classes }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch teaching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teaching classes' },
      { status: 500 }
    );
  }
}
