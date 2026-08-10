import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'parent') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Get all children for this parent
    const parentChildren = await prisma.parentChild.findMany({
      where: { parentId: session.user.id },
      include: {
        child: {
          select: {
            id: true,
            name: true,
            k12Enrollments: {
              select: { class: { select: { gradeLevel: true } } },
              take: 1,
              orderBy: { enrolledAt: 'desc' },
            },
          },
        },
      },
      orderBy: { child: { name: 'asc' } },
    });

    const children = parentChildren.map((pc) => ({
      id: pc.child.id,
      name: pc.child.name,
      gradeLevel: pc.child.k12Enrollments[0]
        ? parseInt(pc.child.k12Enrollments[0].class.gradeLevel)
        : undefined,
    }));

    return NextResponse.json({ children });
  } catch (error) {
    console.error('Error fetching parent children:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
