import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { classId: string; weekNum: string } }
) {
  try {
    const { classId, weekNum } = params;
    const weekNumber = parseInt(weekNum, 10);
    const body = await request.json();
    const { skillIds } = body;

    if (!Array.isArray(skillIds)) {
      return NextResponse.json(
        { error: 'skillIds must be an array' },
        { status: 400 }
      );
    }

    const week = await prisma.improvWeek.findUnique({
      where: {
        classId_weekNum: {
          classId,
          weekNum: weekNumber,
        },
      },
    });

    if (!week) {
      return NextResponse.json(
        { error: 'Week not found' },
        { status: 404 }
      );
    }

    // Delete existing week skills
    await prisma.improvWeekSkill.deleteMany({
      where: { weekId: week.id },
    });

    // Create new week skills
    const newWeekSkills = await Promise.all(
      skillIds.map((skillId, index) =>
        prisma.improvWeekSkill.create({
          data: {
            weekId: week.id,
            skillId,
            isAnchor: true,
            sequenceNum: index,
          },
          include: { skill: true },
        })
      )
    );

    return NextResponse.json(newWeekSkills);
  } catch (error) {
    console.error('Error updating anchor skills:', error);
    return NextResponse.json(
      { error: 'Failed to update anchor skills' },
      { status: 500 }
    );
  }
}
