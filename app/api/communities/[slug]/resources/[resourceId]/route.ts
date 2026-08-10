import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; resourceId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, resourceId } = await params;

    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
      select: { id: true, curatorId: true },
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Only curator can edit community resources
    if (community.curatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the curator can edit community resources' },
        { status: 403 }
      );
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { communityId: true },
    });

    if (!resource || resource.communityId !== community.id) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      url,
      fileKey,
      fileName,
      fileSize,
      mimeType,
      type,
      format,
      tags,
      skillIds = [],
      objectiveIds = [],
    } = body;

    const updatedResource = await prisma.$transaction(async (tx) => {
      // Delete existing skills and objectives
      // Note: These tables may not exist in current schema - commented out
      // await tx.resourceSkill.deleteMany({ where: { resourceId } });
      // await tx.resourceObjective.deleteMany({ where: { resourceId } });

      // Update resource
      return tx.resource.update({
        where: { id: resourceId },
        data: {
          title,
          description,
          url,
          fileKey,
          fileName,
          fileSize,
          mimeType,
          type,
          format,
          tags,
          // Note: skills and objectives relations not in current Resource model
        },
        include: {
          createdBy: { select: { id: true, name: true } },
        },
      });
    });

    return NextResponse.json({ resource: updatedResource });
  } catch (error) {
    console.error('Failed to update community resource:', error);
    return NextResponse.json(
      { error: 'Failed to update community resource' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; resourceId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, resourceId } = await params;

    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
      select: { id: true, curatorId: true },
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Only curator can delete community resources
    if (community.curatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the curator can delete community resources' },
        { status: 403 }
      );
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { communityId: true, fileKey: true },
    });

    if (!resource || resource.communityId !== community.id) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Delete file from Supabase if it exists
    if (resource.fileKey && supabaseAdmin) {
      try {
        await supabaseAdmin.storage.from('resources').remove([resource.fileKey]);
      } catch (err) {
        console.error('Failed to delete file from Supabase:', err);
        // Continue with DB deletion even if file deletion fails
      }
    }

    // Delete from database (cascade will handle relations)
    await prisma.resource.delete({
      where: { id: resourceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete community resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete community resource' },
      { status: 500 }
    );
  }
}
