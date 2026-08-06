import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// PUT: Update a resource
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

    // Verify org exists
    const org = await prisma.organization.findUnique({
      where: { slug },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Fetch resource and verify ownership/permissions
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource || resource.organizationId !== org.id) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Check if user can edit (creator or admin)
    const orgRole = await prisma.organizationRole.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: org.id,
        },
      },
    });

    const isCreator = resource.createdById === session.user.id;
    const isAdmin = orgRole && ['SuperAdmin', 'SchoolAdmin', 'GradeLeadAdmin'].includes(orgRole.role);

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { error: 'Only the creator or an admin can edit this resource' },
        { status: 403 }
      );
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
      visibility,
      classId,
      tags,
      skillIds = [],
      objectiveIds = [],
    } = body;

    // Delete existing skill/objective relations
    await prisma.$transaction([
      prisma.resourceSkill.deleteMany({ where: { resourceId } }),
      prisma.resourceObjective.deleteMany({ where: { resourceId } }),
    ]);

    // Update resource
    const updatedResource = await prisma.resource.update({
      where: { id: resourceId },
      data: {
        title: title || resource.title,
        description: description !== undefined ? description : resource.description,
        url: url !== undefined ? url : resource.url,
        fileKey: fileKey !== undefined ? fileKey : resource.fileKey,
        fileName: fileName !== undefined ? fileName : resource.fileName,
        fileSize: fileSize !== undefined ? fileSize : resource.fileSize,
        mimeType: mimeType !== undefined ? mimeType : resource.mimeType,
        type: type || resource.type,
        format: format !== undefined ? format : resource.format,
        visibility: visibility || resource.visibility,
        classId: classId !== undefined ? classId : resource.classId,
        tags: tags !== undefined ? tags : resource.tags,
        skills: {
          create: skillIds.map((skillId: string) => ({ skillId })),
        },
        objectives: {
          create: objectiveIds.map((objectiveId: string) => ({ objectiveId })),
        },
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        skills: { include: { skill: { select: { id: true, name: true } } } },
        objectives: { include: { objective: { select: { id: true, text: true } } } },
      },
    });

    return NextResponse.json({ resource: updatedResource });
  } catch (error) {
    console.error('Failed to update resource:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to update resource', details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE: Delete a resource
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

    // Verify org exists
    const org = await prisma.organization.findUnique({
      where: { slug },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Fetch resource and verify ownership/permissions
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource || resource.organizationId !== org.id) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Check if user can delete (creator or admin)
    const orgRole = await prisma.organizationRole.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: org.id,
        },
      },
    });

    const isCreator = resource.createdById === session.user.id;
    const isAdmin = orgRole && ['SuperAdmin', 'SchoolAdmin', 'GradeLeadAdmin'].includes(orgRole.role);

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { error: 'Only the creator or an admin can delete this resource' },
        { status: 403 }
      );
    }

    // Delete file from Supabase storage if it exists
    if (resource.fileKey) {
      try {
        await supabaseAdmin.storage.from('resources').remove([resource.fileKey]);
      } catch (storageError) {
        console.error('Failed to delete file from storage:', storageError);
        // Continue with DB deletion even if storage delete fails
      }
    }

    // Delete resource (cascade deletes ResourceSkill and ResourceObjective)
    await prisma.resource.delete({
      where: { id: resourceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete resource:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to delete resource', details: errorMessage },
      { status: 500 }
    );
  }
}
