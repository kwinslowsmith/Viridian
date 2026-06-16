import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const skills = await prisma.improvSkill.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { id: 'asc' }],
    });

    const skillsWithDefinitions = skills.map(skill => ({
      ...skill,
      levelDefinitions: skill.levelDefinitions ? JSON.parse(skill.levelDefinitions) : {},
    }));

    // Group by category
    const categories = ['foundation', 'scene-work', 'musical'];
    const grouped = categories.map(cat => ({
      id: cat,
      name: cat === 'foundation' ? 'Foundation' : cat === 'scene-work' ? 'Scene Work' : 'Musical',
      icon: skillsWithDefinitions.find(s => s.category === cat)?.categoryIcon || '',
      color: skillsWithDefinitions.find(s => s.category === cat)?.categoryColor || '',
      skills: skillsWithDefinitions.filter(s => s.category === cat),
    }));

    return NextResponse.json({ categories, skills: skillsWithDefinitions }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}
