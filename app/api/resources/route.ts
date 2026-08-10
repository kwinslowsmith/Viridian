import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET: Global library - list public resources (authenticated users only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // Build where clause - only public resources
    const whereClause: any = {
      visibility: 'public',
    };

    if (type) {
      whereClause.type = type;
    }

    if (skillId) {
      whereClause.skills = {
        some: { skillId },
      };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const resources = await prisma.resource.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, name: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to 100 results for performance
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Failed to fetch public resources:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch resources', details: errorMessage },
      { status: 500 }
    );
  }
}
