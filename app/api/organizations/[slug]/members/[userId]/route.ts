import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// PUT: Update user role in organization
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, userId } = await params;
    const { role } = await request.json();

    if (!role) {
      return NextResponse.json(
        { error: 'role required' },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Check if requester is SuperAdmin
    const requesterRole = await prisma.organizationRole.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: organization.id,
        },
      },
    });

    if (requesterRole?.role !== 'SuperAdmin') {
      return NextResponse.json(
        { error: 'Only SuperAdmin can change roles' },
        { status: 403 }
      );
    }

    // Update user role
    const updated = await prisma.organizationRole.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId: organization.id,
        },
      },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ member: updated }, { status: 200 });
  } catch (error) {
    console.error('Failed to update role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}
