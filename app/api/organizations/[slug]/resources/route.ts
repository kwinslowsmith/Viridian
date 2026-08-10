import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET: List org resources and public resources
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Verify org exists and user has access
    const org = await prisma.organization.findUnique({
      where: { slug },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check if user is org member
    const orgMembership = await prisma.organizationRole.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: org.id,
        },
      },
    });

    if (!orgMembership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const skillId = searchParams.get('skillId');
    const type = searchParams.get('type');
    const visibility = searchParams.get('visibility');
    const search = searchParams.get('search');

    // Build where clause
    const whereClause: any = {
      organizationId: org.id,
      OR: [
        { visibility: 'org' },
        { visibility: 'public' },
        ...(classId ? [{ classId, visibility: 'class' }] : []),
      ],
    };

    if (type) {
      whereClause.type = type;
    }

    if (visibility) {
      whereClause.visibility = visibility;
    }

    if (skillId) {
      whereClause.skills = {
        some: { skillId },
      };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const resources = await prisma.resource.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Failed to fetch resources:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch resources', details: errorMessage },
      { status: 500 }
    );
  }
}

// POST: Create a new org resource
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Verify org exists
    const org = await prisma.organization.findUnique({
      where: { slug },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check if user has permission to create (Teacher, SuperAdmin, or *Admin)
    const orgRole = await prisma.organizationRole.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: org.id,
        },
      },
    });

    if (!orgRole || !['Teacher', 'SuperAdmin', 'SchoolAdmin', 'GradeLeadAdmin', 'SchedulerAdmin'].includes(orgRole.role)) {
      return NextResponse.json(
        { error: 'Only teachers and admins can create resources' },
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

    if (!title || !type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      );
    }

    // If visibility is 'class', verify user is the instructor
    if (visibility === 'class' && classId) {
      const k12Class = await prisma.k12Class.findUnique({
        where: { id: classId },
      });

      if (!k12Class || k12Class.instructorId !== session.user.id) {
        return NextResponse.json(
          { error: 'Only the class instructor can create class-scoped resources' },
          { status: 403 }
        );
      }
    }

    // Create resource with nested skill and objective creates
    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        url: url || null,
        fileKey: fileKey || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        type,
        format: format || null,
        visibility: visibility || 'org',
        k12ClassId: classId || null,
        tags: tags || null,
        organizationId: org.id,
        createdById: session.user.id,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    console.error('Failed to create resource:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to create resource', details: errorMessage },
      { status: 500 }
    );
  }
}
