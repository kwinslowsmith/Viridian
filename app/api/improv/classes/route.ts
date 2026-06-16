import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    const where: any = {};
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const classes = await prisma.improvClass.findMany({
      where,
      include: {
        enrollments: { include: { student: true } },
        weeks: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, subtitle, numWeeks, startDate, organizationId, instructorId } = body;

    if (!name || !startDate || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, startDate, organizationId' },
        { status: 400 }
      );
    }

    let teacherId = instructorId || request.headers.get('x-teacher-id');

    // If no instructor provided, find or create a default one
    if (!teacherId) {
      const defaultInstructor = await prisma.user.findFirst({
        where: { email: 'admin@viridian.local' }
      });

      if (defaultInstructor) {
        teacherId = defaultInstructor.id;
      } else {
        // Create a default admin user if it doesn't exist
        const newAdmin = await prisma.user.create({
          data: {
            email: 'admin@viridian.local',
            name: 'Admin',
            role: 'instructor'
          }
        });
        teacherId = newAdmin.id;
      }
    }

    const newClass = await prisma.improvClass.create({
      data: {
        name,
        subtitle: subtitle || null,
        numWeeks: numWeeks || 8,
        startDate: new Date(startDate),
        instructorId: teacherId,
        organizationId,
        status: 'active',
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}
