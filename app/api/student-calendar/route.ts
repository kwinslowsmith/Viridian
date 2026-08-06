import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('User-Id');
    const startDate = request.nextUrl.searchParams.get('startDate');
    const endDate = request.nextUrl.searchParams.get('endDate');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days default

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get student's calendar preferences (which classes/communities they want to see)
    const calendarPrefs = await prisma.studentCalendarPreference.findMany({
      where: { studentId: userId, isVisible: true },
    });

    const items: any[] = [];

    // 1. Get K12Class daily entries for toggled-on classes
    const k12ClassPrefs = calendarPrefs.filter(p => p.classType === 'k12');
    if (k12ClassPrefs.length > 0) {
      const k12Days = await prisma.k12Day.findMany({
        where: {
          date: { gte: start, lte: end },
          week: {
            classId: { in: k12ClassPrefs.map(p => p.classId) },
          },
        },
        include: {
          week: {
            select: {
              classId: true,
              class: { select: { id: true, name: true } },
            },
          },
        },
      });

      k12Days.forEach(day => {
        items.push({
          id: `k12day-${day.id}`,
          type: 'k12-day',
          date: day.date,
          title: day.title || 'Class Schedule',
          description: day.description,
          classId: day.week.classId,
          className: day.week.class.name,
          homework: day.homework,
          isMajor: day.isMajor,
          materials: day.materialsJson ? JSON.parse(day.materialsJson) : [],
          standards: day.standardsJson ? JSON.parse(day.standardsJson) : [],
        });
      });
    }

    // 2. Get ImprovClass daily entries for toggled-on classes
    const improvClassPrefs = calendarPrefs.filter(p => p.classType === 'improv');
    if (improvClassPrefs.length > 0) {
      const improvDays = await prisma.improvDay.findMany({
        where: {
          date: { gte: start, lte: end },
          week: {
            classId: { in: improvClassPrefs.map(p => p.classId) },
          },
        },
        include: {
          week: {
            select: {
              classId: true,
              class: { select: { id: true, name: true } },
            },
          },
        },
      });

      improvDays.forEach(day => {
        items.push({
          id: `improvday-${day.id}`,
          type: 'improv-day',
          date: day.date,
          title: day.title || 'Class Schedule',
          description: day.description,
          classId: day.week.classId,
          className: day.week.class.name,
          homework: day.homework,
          isMajor: day.isMajor,
          materials: day.materialsJson ? JSON.parse(day.materialsJson) : [],
          skills: day.skillsJson ? JSON.parse(day.skillsJson) : [],
        });
      });
    }

    // 3. Get major assignments from all enrolled classes (whether toggled or not)
    const enrolledK12Classes = await prisma.k12Enrollment.findMany({
      where: { studentId: userId, status: 'active' },
      select: { classId: true },
    });

    const enrolledImprovClasses = await prisma.improvEnrollment.findMany({
      where: { studentId: userId, status: 'active' },
      select: { classId: true },
    });

    // Get major K12 assignments
    if (enrolledK12Classes.length > 0) {
      const majorK12Days = await prisma.k12Day.findMany({
        where: {
          isMajor: true,
          date: { gte: start, lte: end },
          week: {
            classId: { in: enrolledK12Classes.map(e => e.classId) },
          },
        },
        include: {
          week: {
            select: {
              classId: true,
              class: { select: { id: true, name: true } },
            },
          },
        },
      });

      majorK12Days.forEach(day => {
        // Only add if not already in items (from toggled class)
        if (!items.find(i => i.id === `k12day-${day.id}`)) {
          items.push({
            id: `k12day-${day.id}`,
            type: 'k12-major-assignment',
            date: day.date,
            title: day.title || 'Assignment',
            description: day.description,
            classId: day.week.classId,
            className: day.week.class.name,
            homework: day.homework,
            isMajor: true,
            materials: day.materialsJson ? JSON.parse(day.materialsJson) : [],
          });
        }
      });
    }

    // Get major Improv assignments
    if (enrolledImprovClasses.length > 0) {
      const majorImprovDays = await prisma.improvDay.findMany({
        where: {
          isMajor: true,
          date: { gte: start, lte: end },
          week: {
            classId: { in: enrolledImprovClasses.map(e => e.classId) },
          },
        },
        include: {
          week: {
            select: {
              classId: true,
              class: { select: { id: true, name: true } },
            },
          },
        },
      });

      majorImprovDays.forEach(day => {
        if (!items.find(i => i.id === `improvday-${day.id}`)) {
          items.push({
            id: `improvday-${day.id}`,
            type: 'improv-major-assignment',
            date: day.date,
            title: day.title || 'Assignment',
            description: day.description,
            classId: day.week.classId,
            className: day.week.class.name,
            homework: day.homework,
            isMajor: true,
            materials: day.materialsJson ? JSON.parse(day.materialsJson) : [],
          });
        }
      });
    }

    // 4. Get general events visible to this user
    const events = await prisma.event.findMany({
      where: {
        startDate: { gte: start, lte: end },
        OR: [
          { createdById: userId },
          { organizationId: null }, // Public events
        ],
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    events.forEach(event => {
      items.push({
        id: `event-${event.id}`,
        type: 'event',
        date: event.startDate,
        title: event.title,
        description: event.description,
      });
    });

    // Sort by date
    items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({
      items,
      startDate: start,
      endDate: end,
    });
  } catch (error) {
    console.error('Failed to fetch student calendar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar' },
      { status: 500 }
    );
  }
}
