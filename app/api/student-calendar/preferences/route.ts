import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get enrolled classes
    const k12Enrollments = await prisma.k12Enrollment.findMany({
      where: { studentId: session.user.id, status: 'active' },
      include: { class: { select: { id: true, name: true } } },
    });

    const improvEnrollments = await prisma.improvEnrollment.findMany({
      where: { studentId: session.user.id, status: 'active' },
      include: { class: { select: { id: true, name: true } } },
    });

    // Get current preferences
    const prefs = await prisma.studentCalendarPreference.findMany({
      where: { studentId: session.user.id },
    });

    const enrolledClasses = [
      ...k12Enrollments.map(e => ({
        classId: e.class.id,
        classType: 'k12' as const,
        className: e.class.name,
        isVisible: prefs.find(p => p.classId === e.class.id)?.isVisible ?? true,
      })),
      ...improvEnrollments.map(e => ({
        classId: e.class.id,
        classType: 'improv' as const,
        className: e.class.name,
        isVisible: prefs.find(p => p.classId === e.class.id)?.isVisible ?? true,
      })),
    ];

    return NextResponse.json({ enrolledClasses });
  } catch (error) {
    console.error('Failed to fetch preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, isVisible } = await request.json();

    if (!classId || isVisible === undefined) {
      return NextResponse.json({ error: 'Missing classId or isVisible' }, { status: 400 });
    }

    // Determine class type
    const k12Class = await prisma.k12Class.findUnique({ where: { id: classId } });
    const classType = k12Class ? 'k12' : 'improv';

    // Upsert preference
    await prisma.studentCalendarPreference.upsert({
      where: {
        studentId_classId_classType: {
          studentId: session.user.id,
          classId,
          classType,
        },
      },
      update: { isVisible },
      create: {
        studentId: session.user.id,
        classId,
        classType,
        isVisible,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update preference:', error);
    return NextResponse.json({ error: 'Failed to update preference' }, { status: 500 });
  }
}
