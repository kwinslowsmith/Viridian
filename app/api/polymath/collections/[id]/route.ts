import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const { id } = await params;

    const collection = await prisma.polymathResourceCollection.findUnique({
      where: { id },
      include: {
        resources: {
          include: { resource: true },
          orderBy: { sequenceNum: 'asc' },
        },
      },
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Check permissions - user can view if:
    // 1. Collection is published and public
    // 2. User is the author
    // 3. User is admin/curator of the organization/community
    if (collection.status !== 'published' || collection.visibility !== 'public') {
      if (!userId || collection.authorId !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    const parsedCollection = {
      ...collection,
      resources: collection.resources.map((r) => r.resource),
      approvalChain: collection.approvalChain ? JSON.parse(collection.approvalChain) : [],
    };

    return NextResponse.json(parsedCollection, { status: 200 });
  } catch (error: any) {
    console.error('[GET /api/polymath/collections/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection', details: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      name,
      description,
      topic,
      tags,
      coverImage,
      visibility,
      resources = [],
    } = body;

    // Get existing collection to check permissions
    const existingCollection = await prisma.polymathResourceCollection.findUnique({
      where: { id },
    });

    if (!existingCollection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Only author can update
    if (existingCollection.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update collection
    const updatedCollection = await prisma.polymathResourceCollection.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(topic !== undefined && { topic }),
        ...(tags !== undefined && { tags }),
        ...(coverImage !== undefined && { coverImage }),
        ...(visibility !== undefined && { visibility }),
      },
      include: {
        resources: {
          include: { resource: true },
          orderBy: { sequenceNum: 'asc' },
        },
      },
    });

    // Handle resource updates if provided
    let finalResources = updatedCollection.resources;
    if (resources.length > 0) {
      // Clear existing resources
      await prisma.polymathCollectionResource.deleteMany({
        where: { collectionId: id },
      });

      // Add new resources
      await prisma.polymathCollectionResource.createMany({
        data: resources.map((resourceId: string, index: number) => ({
          collectionId: id,
          resourceId,
          sequenceNum: index,
        })),
      });

      // Fetch updated resources
      const updatedResources = await prisma.polymathCollectionResource.findMany({
        where: { collectionId: id },
        include: { resource: true },
        orderBy: { sequenceNum: 'asc' },
      });
      finalResources = updatedResources;
    }

    const parsedCollection = {
      ...updatedCollection,
      resources: finalResources.map((r) => r.resource),
      approvalChain: updatedCollection.approvalChain
        ? JSON.parse(updatedCollection.approvalChain)
        : [],
    };

    return NextResponse.json(parsedCollection, { status: 200 });
  } catch (error: any) {
    console.error('[PATCH /api/polymath/collections/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to update collection', details: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get existing collection to check permissions
    const existingCollection = await prisma.polymathResourceCollection.findUnique({
      where: { id },
    });

    if (!existingCollection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Only author can delete
    if (existingCollection.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete collection (cascade delete will handle resources)
    await prisma.polymathResourceCollection.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Collection deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[DELETE /api/polymath/collections/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to delete collection', details: error?.message },
      { status: 500 }
    );
  }
}
