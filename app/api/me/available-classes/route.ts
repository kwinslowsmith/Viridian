import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: List classes available for enrollment (excluding already enrolled)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's enrollments
    const enrolledClasses = await prisma.improvEnrollment.findMany({
      where: { studentId: session.user.id },
      select: { classId: true },
    });

    const enrolledClassIds = enrolledClasses.map((e) => e.classId);

    // Get all active classes excluding those already enrolled in
    const classes = await prisma.improvClass.findMany({
      where: {
        status: 'active',
        id: { notIn: enrolledClassIds },
      },
      include: {
        instructor: { select: { id: true, name: true } },
        organization: { select: { id: true, name: true, slug: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json({ classes });
  } catch (error) {
    console.error('Failed to fetch available classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}
