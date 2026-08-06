import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; collectionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, collectionId } = await params;
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
        { error: 'Only community curator can update collections' },
        { status: 403 }
      );
    }

    const collection = await prisma.polymathResourceCollection.findUnique({
      where: { id: collectionId },
      select: { communityId: true },
    });

    if (!collection || collection.communityId !== community.id) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const updateData: any = {};
    Object.keys(body).forEach((key) => {
      if (key !== 'resourceIds' && body[key] !== undefined) {
        updateData[key] = body[key];
      }
    });

    // Handle status changes
    if (body.status && body.status === 'published') {
      updateData.publishedAt = new Date();
    }

    // Handle resource updates
    if (body.resourceIds) {
      // Delete existing resources and create new ones
      await prisma.polymathCollectionResource.deleteMany({
        where: { collectionId },
      });

      updateData.resources = {
        create: body.resourceIds.map((resourceId: string, idx: number) => ({
          resourceId,
          sequenceNum: idx,
        })),
      };
    }

    const updated = await prisma.polymathResourceCollection.update({
      where: { id: collectionId },
      data: updateData,
      include: {resources: {
          include: { resource: true },
          orderBy: { sequenceNum: 'asc' },
        },
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[PUT /collections/[collectionId]]', error);
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; collectionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, collectionId } = await params;

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
        { error: 'Only community curator can delete collections' },
        { status: 403 }
      );
    }

    const collection = await prisma.polymathResourceCollection.findUnique({
      where: { id: collectionId },
      select: { communityId: true },
    });

    if (!collection || collection.communityId !== community.id) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    await prisma.polymathResourceCollection.delete({
      where: { id: collectionId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /collections/[collectionId]]', error);
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
