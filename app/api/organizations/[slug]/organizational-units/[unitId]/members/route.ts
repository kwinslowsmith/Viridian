import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; unitId: string }> }
) {
  try {
    const { slug, unitId } = await params;

    // Verify org exists
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get unit members
    const members = await prisma.organizationalUnitMember.findMany({
      where: { unitId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return NextResponse.json({
      members: members.map((m) => ({
        id: m.id,
        user: m.user,
        role: m.role,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch unit members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unit members' },
      { status: 500 }
    );
  }
}
