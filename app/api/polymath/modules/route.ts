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
      title,
      description,
      topic,
      tags,
      lessonsJson,
      estimatedHours,
      difficulty = 'beginner',
      coverImage,
      authorType = 'individual',
      authorId,
      organizationId,
      communityId,
      eventId,
      visibility = 'public',
      sequenceNum = 0,
    } = body;

    // Validation
    if (!title || !lessonsJson) {
      return NextResponse.json(
        { error: 'Missing required fields: title, lessonsJson' },
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

    // Create module
    const module = await prisma.polymathModule.create({
      data: {
        title,
        description: description || null,
        topic: topic || null,
        tags: tags || null,
        lessonsJson: lessonsJson ? JSON.stringify(lessonsJson) : null,
        estimatedHours: estimatedHours || null,
        difficulty: difficulty || null,
        coverImage: coverImage || null,
        authorType,
        authorId,
        organizationId: organizationId || null,
        communityId: communityId || null,
        eventId: eventId || null,
        visibility,
        sequenceNum,
        requiresApproval,
        status: requiresApproval ? 'pending_approval' : 'published',
        approvalChain: requiresApproval ? JSON.stringify(approvalChain) : null,
        publishedAt: requiresApproval ? null : new Date(),
      },
      include: {
        
        
        
      },
    });

    return NextResponse.json(
      {
        ...module,
        lessonsJson: module.lessonsJson ? JSON.parse(module.lessonsJson) : [],
        approvalChain: module.approvalChain ? JSON.parse(module.approvalChain) : [],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/polymath/modules]', error);
    return NextResponse.json(
      { error: 'Failed to create module', details: error?.message },
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

    const modules = await prisma.polymathModule.findMany({
      where: whereClause,
      include: {
        
        
        
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const parsedModules = modules.map((module) => ({
      ...module,
      lessonsJson: module.lessonsJson ? JSON.parse(module.lessonsJson) : [],
      approvalChain: module.approvalChain ? JSON.parse(module.approvalChain) : [],
    }));

    return NextResponse.json(
      { modules: parsedModules, count: parsedModules.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[GET /api/polymath/modules]', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules', details: error?.message },
      { status: 500 }
    );
  }
}
