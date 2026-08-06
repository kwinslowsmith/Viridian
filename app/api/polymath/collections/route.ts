import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      topic,
      tags,
      resources = [], // Array of resource IDs to add to collection
      coverImage,
      authorType = 'individual',
      authorId,
      organizationId,
      communityId,
      eventId,
      visibility = 'public',
    } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Missing required fields: name' },
        { status: 400 }
      );
    }

    if (!authorType || !authorId) {
      return NextResponse.json(
        { error: 'Missing required fields: authorType, authorId' },
        { status: 400 }
      );
    }

    // Validate and check permissions based on authorType
    let requiresApproval = false;
    let approvalChain: string[] = [];

    if (authorType === 'individual') {
      if (authorId !== session.user.id) {
        return NextResponse.json(
          { error: 'Cannot post on behalf of another user' },
          { status: 403 }
        );
      }
      requiresApproval = false;
    } else if (authorType === 'organization') {
      if (!organizationId || organizationId !== authorId) {
        return NextResponse.json(
          { error: 'Invalid organizationId for organization post' },
          { status: 400 }
        );
      }

      const orgRole = await prisma.organizationRole.findUnique({
        where: {
          userId_organizationId: {
            userId: session.user.id,
            organizationId: authorId,
          },
        },
      });

      if (!orgRole || !['SuperAdmin', 'SchoolAdmin'].includes(orgRole.role)) {
        return NextResponse.json(
          { error: 'You do not have permission to post as this organization' },
          { status: 403 }
        );
      }

      requiresApproval = true;
      const orgAdmins = await prisma.organizationRole.findMany({
        where: {
          organizationId: authorId,
          role: { in: ['SuperAdmin', 'SchoolAdmin'] },
        },
        select: { userId: true },
      });
      approvalChain = orgAdmins.map((a) => a.userId);
    } else if (authorType === 'community') {
      if (!communityId || communityId !== authorId) {
        return NextResponse.json(
          { error: 'Invalid communityId for community post' },
          { status: 400 }
        );
      }

      const communityMember = await prisma.learningCommunityMember.findUnique({
        where: {
          communityId_userId: {
            communityId: authorId,
            userId: session.user.id,
          },
        },
      });

      if (!communityMember || !['curator', 'moderator'].includes(communityMember.role)) {
        return NextResponse.json(
          { error: 'You do not have permission to post as this community' },
          { status: 403 }
        );
      }

      requiresApproval = true;
      const community = await prisma.learningCommunity.findUnique({
        where: { id: authorId },
        select: { curatorId: true },
      });
      approvalChain = community?.curatorId ? [community.curatorId] : [];
    } else if (authorType === 'event') {
      if (!eventId || eventId !== authorId) {
        return NextResponse.json(
          { error: 'Invalid eventId for event post' },
          { status: 400 }
        );
      }

      const event = await prisma.event.findUnique({
        where: { id: authorId },
        select: { createdById: true },
      });

      if (!event || event.createdById !== session.user.id) {
        return NextResponse.json(
          { error: 'You do not have permission to post as this event' },
          { status: 403 }
        );
      }

      requiresApproval = true;
      approvalChain = [event.createdById];
    } else {
      return NextResponse.json(
        { error: 'Invalid authorType' },
        { status: 400 }
      );
    }

    // Create collection with resources
    const collection = await prisma.polymathResourceCollection.create({
      data: {
        name,
        description: description || null,
        topic: topic || null,
        tags: tags || null,
        coverImage: coverImage || null,
        authorType,
        authorId,
        organizationId: organizationId || null,
        communityId: communityId || null,
        eventId: eventId || null,
        visibility,
        requiresApproval,
        status: requiresApproval ? 'pending_approval' : 'published',
        approvalChain: requiresApproval ? JSON.stringify(approvalChain) : null,
        publishedAt: requiresApproval ? null : new Date(),
        // Create relationships with resources if provided
        resources:
          resources.length > 0
            ? {
                create: resources.map((resourceId: string, index: number) => ({
                  resourceId,
                  sequenceNum: index,
                })),
              }
            : undefined,
      },
      include: {
        
        
        
        resources: {
          include: { resource: true },
          orderBy: { sequenceNum: 'asc' },
        },
      },
    });

    return NextResponse.json(
      {
        ...collection,
        resources: collection.resources.map((r) => r.resource),
        approvalChain: collection.approvalChain ? JSON.parse(collection.approvalChain) : [],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/polymath/collections]', error);
    return NextResponse.json(
      { error: 'Failed to create collection', details: error?.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');
    const authorType = req.nextUrl.searchParams.get('authorType');
    const status = req.nextUrl.searchParams.get('status');
    const visibility = req.nextUrl.searchParams.get('visibility');
    const communityId = req.nextUrl.searchParams.get('communityId');
    const organizationId = req.nextUrl.searchParams.get('organizationId');

    let whereClause: any = {};

    if (authorType) whereClause.authorType = authorType;
    if (status) whereClause.status = status;
    if (visibility) whereClause.visibility = visibility;
    if (communityId) whereClause.communityId = communityId;
    if (organizationId) whereClause.organizationId = organizationId;

    if (!userId) {
      whereClause.status = 'published';
      whereClause.visibility = 'public';
    } else {
      if (!status) {
        whereClause.OR = [
          { status: 'published' },
          {
            AND: [
              { status: 'pending_approval' },
              { authorId: userId },
            ],
          },
        ];
      }
    }

    const collections = await prisma.polymathResourceCollection.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        topic: true,
        tags: true,
        coverImage: true,
        authorType: true,
        authorId: true,
        organizationId: true,
        communityId: true,
        eventId: true,
        visibility: true,
        status: true,
        requiresApproval: true,
        approvalChain: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const parsedCollections = collections.map((collection) => ({
      ...collection,
      approvalChain: collection.approvalChain ? JSON.parse(collection.approvalChain) : [],
    }));

    return NextResponse.json(
      { collections: parsedCollections, count: parsedCollections.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[GET /api/polymath/collections]', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections', details: error?.message },
      { status: 500 }
    );
  }
}
