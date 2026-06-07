import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { skillId: string } }
) {
  try {
    const { skillId } = params;

    const skill = await prisma.improvSkill.findUnique({
      where: { id: skillId },
      include: {
        objectives: {
          orderBy: { sequenceNum: 'asc' },
        },
      },
    });

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      skill: {
        id: skill.id,
        slug: skill.slug,
        name: skill.name,
        category: skill.category,
        description: skill.description,
        levels: skill.levelDefinitions
          ? JSON.parse(skill.levelDefinitions)
          : {
              approaching: '',
              developing: '',
              proficient: '',
            },
      },
      objectives: skill.objectives,
    });
  } catch (error) {
    console.error('Error fetching skill:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill' },
      { status: 500 }
    );
  }
}
