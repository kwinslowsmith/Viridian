import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; moduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, moduleId } = await params;
    const body = await req.json();

    const community = await prisma.learningCommunity.findUnique({
      where: { slug },
      select: { id: true, curatorId: true },
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user || community.curatorId !== user.id) {
      return NextResponse.json(
        { error: 'Only community curator can update modules' },
        { status: 403 }
      );
    }

    const module = await prisma.polymathModule.findUnique({
      where: { id: moduleId },
      select: { communityId: true },
    });

    if (!module || module.communityId !== community.id) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const updateData: any = {};
    Object.keys(body).forEach((key) => {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    });

    // Handle status changes
    if (body.status && body.status === 'published') {
      updateData.publishedAt = new Date();
    }

    const updated = await prisma.polymathModule.update({
      where: { id: moduleId },
      data: updateData,
      include: {},
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[PUT /modules/[moduleId]]', error);
    return NextResponse.json(
      { error: 'Failed to update module' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; moduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, moduleId } = await params;

    const community = await prisma.learningCommunity.findUnique({
      where: { slug },
      select: { id: true, curatorId: true },
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user || community.curatorId !== user.id) {
      return NextResponse.json(
        { error: 'Only community curator can delete modules' },
        { status: 403 }
      );
    }

    const module = await prisma.polymathModule.findUnique({
      where: { id: moduleId },
      select: { communityId: true },
    });

    if (!module || module.communityId !== community.id) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    await prisma.polymathModule.delete({
      where: { id: moduleId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /modules/[moduleId]]', error);
    return NextResponse.json(
      { error: 'Failed to delete module' },
      { status: 500 }
    );
  }
}
