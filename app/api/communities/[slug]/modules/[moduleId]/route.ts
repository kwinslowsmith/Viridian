import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; moduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug, moduleId } = await params;
    const { title, description, estimatedHours } = await request.json();

    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Only curator can edit modules
    if (community.curatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to edit modules in this community' },
        { status: 403 }
      );
    }

    const module = await prisma.learningModule.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    if (module.communityId !== community.id) {
      return NextResponse.json(
        { error: 'Module does not belong to this community' },
        { status: 400 }
      );
    }

    const updated = await prisma.learningModule.update({
      where: { id: moduleId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(estimatedHours !== undefined && { estimatedHours }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update module:', error);
    return NextResponse.json(
      { error: 'Failed to update module' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; moduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug, moduleId } = await params;

    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Only curator can delete modules
    if (community.curatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete modules in this community' },
        { status: 403 }
      );
    }

    const module = await prisma.learningModule.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    if (module.communityId !== community.id) {
      return NextResponse.json(
        { error: 'Module does not belong to this community' },
        { status: 400 }
      );
    }

    await prisma.learningModule.delete({
      where: { id: moduleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete module:', error);
    return NextResponse.json(
      { error: 'Failed to delete module' },
      { status: 500 }
    );
  }
}
