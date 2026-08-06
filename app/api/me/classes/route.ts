import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get all organizations the user is in
    const userOrganizations = await prisma.organizationRole.findMany({
      where: { userId },
      select: { organizationId: true },
    });

    const orgIds = userOrganizations.map((o) => o.organizationId);

    // Get all classes in user's organizations
    const classes = await prisma.improvClass.findMany({
      where: {
        organizationId: { in: orgIds },
      },
      include: {
        instructor: { select: { id: true, name: true } },
        weeks: {
          select: {
            id: true,
            weekNum: true,
            title: true,
            startDate: true,
            endDate: true,
          },
          orderBy: { weekNum: 'asc' },
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ classes }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}
