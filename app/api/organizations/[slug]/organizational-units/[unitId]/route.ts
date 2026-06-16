import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; unitId: string }> }
) {
  try {
    const { slug, unitId } = await params;

    // Find organization
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get organizational unit with resource library
    const unit = await prisma.organizationalUnit.findUnique({
      where: { id: unitId },
      include: {
        resourceLibrary: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!unit || unit.organizationId !== org.id) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    return NextResponse.json({ unit });
  } catch (error) {
    console.error('Failed to fetch organizational unit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizational unit' },
      { status: 500 }
    );
  }
}
