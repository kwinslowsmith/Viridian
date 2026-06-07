import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const skills = await prisma.improvSkill.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    const skillsWithLevels = skills.map((skill) => ({
      id: skill.id,
      slug: skill.slug,
      name: skill.name,
      category: skill.category,
      categoryIcon: skill.categoryIcon,
      categoryColor: skill.categoryColor,
      description: skill.description,
      levels: skill.levelDefinitions
        ? JSON.parse(skill.levelDefinitions)
        : {
            approaching: '',
            developing: '',
            proficient: '',
          },
    }));

    // Get unique categories
    const categories = Array.from(
      new Map(
        skillsWithLevels.map((skill) => [
          skill.category,
          {
            id: skill.category,
            name:
              skill.category.charAt(0).toUpperCase() +
              skill.category.slice(1).replace('-', ' '),
            icon: skill.categoryIcon,
            color: skill.categoryColor,
          },
        ])
      ).values()
    );

    return NextResponse.json({
      skills: skillsWithLevels,
      categories,
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}
