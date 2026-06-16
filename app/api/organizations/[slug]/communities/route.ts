import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get organization
    const org = await prisma.organization.findUnique({
      where: { slug },
    });

    if (!org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get all communities in this organization
    const communities = await prisma.learningCommunity.findMany({
      where: {
        organizationId: org.id,
        status: { in: ['active', 'pending-approval'] },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        difficulty: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ communities }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch organization communities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}
