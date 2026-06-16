import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; classId: string }> }
) {
  try {
    const { slug, classId } = await params;

    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get standards linked to this class via ClassStandard
    const classStandards = await prisma.classStandard.findMany({
      where: { classId },
      include: {
        standard: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
          },
        },
      },
    });

    // For each standard, get its objectives
    const standards = await Promise.all(
      classStandards.map(async (cs) => {
        const objectives = await prisma.exampleObjective.findMany({
          where: { standardId: cs.standard.id },
          select: {
            id: true,
            label: true,
            text: true,
          },
          orderBy: { sequenceNum: 'asc' },
        });

        return {
          id: cs.standard.id,
          code: cs.standard.code,
          name: cs.standard.name,
          type: cs.standard.type,
          objectives,
        };
      })
    );

    // Sort by type (skill first) then name
    standards.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'skill' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ standards });
  } catch (error) {
    console.error('Failed to fetch standards:', error);
    return NextResponse.json({ error: 'Failed to fetch standards' }, { status: 500 });
  }
}
