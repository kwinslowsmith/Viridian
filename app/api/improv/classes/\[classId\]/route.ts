import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const classId = params.classId;

    const improvClass = await prisma.improvClass.findUnique({
      where: { id: classId },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        enrollments: {
          include: { student: { select: { id: true, name: true, email: true } } },
        },
        weeks: {
          include: { weekSkills: { include: { skill: true } } },
          orderBy: { weekNum: 'asc' },
        },
      },
    });

    if (!improvClass) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(improvClass);
  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const classId = params.classId;
    const body = await request.json();
    const { name, subtitle, status } = body;

    const updatedClass = await prisma.improvClass.update({
      where: { id: classId },
      data: {
        ...(name && { name }),
        ...(subtitle !== undefined && { subtitle }),
        ...(status && { status }),
      },
      include: {
        enrollments: true,
        weeks: true,
      },
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { error: 'Failed to update class' },
      { status: 500 }
    );
  }
}
