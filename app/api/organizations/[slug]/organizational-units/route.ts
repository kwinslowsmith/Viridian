import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find organization
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get all organizational units (departments, grade levels, etc.)
    const units = await prisma.organizationalUnit.findMany({
      where: {
        organizationId: org.id,
        parentId: null, // Only top-level units
      },
      include: {
        resourceLibrary: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      units: units.map((unit) => ({
        id: unit.id,
        name: unit.name,
        description: unit.description,
        type: unit.type,
        resourceLibrary: unit.resourceLibrary || null,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch organizational units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizational units', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
