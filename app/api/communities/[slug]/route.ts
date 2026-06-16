import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
      include: {
        curator: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
        modules: {
          orderBy: { sequenceNum: 'asc' },
          select: { id: true, title: true, description: true, sequenceNum: true, estimatedHours: true },
        },
        members: {
          select: { id: true, userId: true, role: true, joinedAt: true, progress: true },
        },
        _count: { select: { members: true, modules: true } },
      },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(community);
  } catch (error) {
    console.error('Failed to fetch community:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const { name, description, coverImage, isPublic, requiresApprovalToJoin, topic, difficulty, estimatedHours } = await request.json();

    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Only curator or org admin can edit
    if (community.curatorId !== session.user.id) {
      if (community.organizationId) {
        const orgRole = await prisma.organizationRole.findFirst({
          where: {
            userId: session.user.id,
            organizationId: community.organizationId,
            role: { in: ['SuperAdmin', 'SchoolAdmin'] },
          },
        });

        if (!orgRole) {
          return NextResponse.json(
            { error: 'You do not have permission to edit this community' },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'You do not have permission to edit this community' },
          { status: 403 }
        );
      }
    }

    const updated = await prisma.learningCommunity.update({
      where: { id: community.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(coverImage !== undefined && { coverImage }),
        ...(isPublic !== undefined && { isPublic }),
        ...(requiresApprovalToJoin !== undefined && { requiresApprovalToJoin }),
        ...(topic !== undefined && { topic }),
        ...(difficulty !== undefined && { difficulty }),
        ...(estimatedHours !== undefined && { estimatedHours }),
      },
      include: {
        curator: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
        _count: { select: { members: true, modules: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update community:', error);
    return NextResponse.json(
      { error: 'Failed to update community' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug } = await params;

    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Only curator or org admin can delete
    if (community.curatorId !== session.user.id) {
      if (community.organizationId) {
        const orgRole = await prisma.organizationRole.findFirst({
          where: {
            userId: session.user.id,
            organizationId: community.organizationId,
            role: { in: ['SuperAdmin', 'SchoolAdmin'] },
          },
        });

        if (!orgRole) {
          return NextResponse.json(
            { error: 'You do not have permission to delete this community' },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'You do not have permission to delete this community' },
          { status: 403 }
        );
      }
    }

    // Archive instead of delete
    await prisma.learningCommunity.update({
      where: { id: community.id },
      data: { status: 'archived' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete community:', error);
    return NextResponse.json(
      { error: 'Failed to delete community' },
      { status: 500 }
    );
  }
}
