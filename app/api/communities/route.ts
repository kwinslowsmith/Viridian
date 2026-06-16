import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'all'; // 'global', 'organization', 'all'
    const topic = searchParams.get('topic');
    const search = searchParams.get('search');
    const organizationId = searchParams.get('organizationId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {
      status: 'active',
      isPublic: true,
    };

    // Filter by scope
    if (scope === 'global') {
      where.scope = 'global';
    } else if (scope === 'organization') {
      where.scope = 'organization';
    }

    // Filter by organization if specified
    if (organizationId) {
      where.organizationId = organizationId;
    }

    // Filter by topic
    if (topic) {
      where.topic = topic;
    }

    // Search by name or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [communities, total] = await Promise.all([
      prisma.learningCommunity.findMany({
        where,
        include: {
          curator: { select: { id: true, name: true, email: true } },
          organization: { select: { id: true, name: true, slug: true } },
          _count: { select: { members: true, modules: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.learningCommunity.count({ where }),
    ]);

    return NextResponse.json({
      communities,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Failed to fetch communities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, description, coverImage, scope, organizationId, topic, difficulty, estimatedHours, isPublic, requiresApprovalToJoin } = await request.json();

    if (!name || !scope) {
      return NextResponse.json(
        { error: 'Name and scope are required' },
        { status: 400 }
      );
    }

    // Validate scope
    if (!['global', 'organization'].includes(scope)) {
      return NextResponse.json(
        { error: 'Invalid scope. Must be "global" or "organization"' },
        { status: 400 }
      );
    }

    // Organization-scoped communities must have organizationId
    if (scope === 'organization' && !organizationId) {
      return NextResponse.json(
        { error: 'organizationId required for organization-scoped communities' },
        { status: 400 }
      );
    }

    // Check user is curator (or admin) for this organization if org-scoped
    if (scope === 'organization' && organizationId) {
      const orgRole = await prisma.organizationRole.findFirst({
        where: {
          userId: session.user.id,
          organizationId,
          role: { in: ['SuperAdmin', 'SchoolAdmin'] },
        },
      });

      if (!orgRole) {
        return NextResponse.json(
          { error: 'You do not have permission to create communities in this organization' },
          { status: 403 }
        );
      }
    }

    // Generate slug from name
    const baseSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    let slug = baseSlug;
    let counter = 1;

    // Check for existing slug (per org if org-scoped)
    while (true) {
      const existing = await prisma.learningCommunity.findFirst({
        where: {
          slug,
          organizationId: scope === 'organization' ? organizationId : null,
        },
      });

      if (!existing) break;
      slug = `${baseSlug}-${counter++}`;
    }

    const community = await prisma.learningCommunity.create({
      data: {
        name,
        slug,
        description,
        coverImage,
        scope,
        organizationId: scope === 'organization' ? organizationId : null,
        curatorId: session.user.id,
        topic,
        difficulty,
        estimatedHours,
        isPublic: isPublic !== false,
        requiresApprovalToJoin: requiresApprovalToJoin || false,
        status: 'active',
      },
      include: {
        curator: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
        _count: { select: { members: true, modules: true } },
      },
    });

    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    console.error('Failed to create community:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create community' },
      { status: 500 }
    );
  }
}
