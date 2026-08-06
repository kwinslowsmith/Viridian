import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET students in a class
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId } = await params;

    // Verify instructor or student in class can see this
    const improvClass = await prisma.improvClass.findUnique({
      where: { id: classId },
    });

    if (!improvClass) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    const enrollments = await prisma.improvEnrollment.findMany({
      where: { classId, status: 'active' },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { student: { name: 'asc' } },
    });

    const students = enrollments.map(e => ({
      id: e.student.id,
      name: e.student.name,
      email: e.student.email,
      enrollmentId: e.id,
    }));

    return NextResponse.json({ students }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
