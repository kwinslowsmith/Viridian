import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; classId: string }> }
) {
  try {
    const { slug, classId } = await params;
    const userId = request.headers.get('User-Id');

    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
      include: {
        instructor: {
          select: { id: true, name: true },
        },
      },
    });

    if (!k12Class || k12Class.organizationId !== org.id) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Determine user role
    let userRole = 'Student';
    if (k12Class.instructorId === userId) {
      userRole = 'Teacher';
    } else if (userId) {
      const orgRole = await prisma.organizationRole.findFirst({
        where: {
          userId,
          organizationId: org.id,
          role: { in: ['SuperAdmin', 'Admin'] },
        },
      });
      if (orgRole) {
        userRole = 'Admin';
      }
    }

    return NextResponse.json({
      class: {
        id: k12Class.id,
        name: k12Class.name,
        gradeLevel: k12Class.gradeLevel,
        subject: k12Class.subject,
        startDate: k12Class.startDate,
        endDate: k12Class.endDate,
        numUnits: k12Class.numUnits,
        status: k12Class.status,
        instructor: k12Class.instructor,
      },
      userRole,
    });
  } catch (error) {
    console.error('Failed to fetch K12 class:', error);
    return NextResponse.json({ error: 'Failed to fetch class' }, { status: 500 });
  }
}
