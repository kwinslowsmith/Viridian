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
      toolType,
      toolUrl,
      iframeUrl,
      codeRepository,
      thumbnail,
      difficulty = 'beginner',
      estimatedUsageTime,
      languages,
      accessibilityFeatures,
      topic,
      tags,
      authorType = 'individual',
      authorId,
      organizationId,
      communityId,
      eventId,
      visibility = 'public',
    } = body;

    // Validation
    if (!name || !toolType) {
      return NextResponse.json(
        { error: 'Missing required fields: name, toolType' },
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

    // Create tool
    const tool = await prisma.polymathTool.create({
      data: {
        name,
        description: description || null,
        toolType,
        toolUrl: toolUrl || null,
        iframeUrl: iframeUrl || null,
        codeRepository: codeRepository || null,
        thumbnail: thumbnail || null,
        difficulty: difficulty || null,
        estimatedUsageTime: estimatedUsageTime || null,
        languages: languages || null,
        accessibilityFeatures: accessibilityFeatures || null,
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
      },
      include: {
        
        
        
      },
    });

    return NextResponse.json(
      {
        ...tool,
        approvalChain: tool.approvalChain ? JSON.parse(tool.approvalChain) : [],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/polymath/tools]', error);
    return NextResponse.json(
      { error: 'Failed to create tool', details: error?.message },
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
    const toolType = req.nextUrl.searchParams.get('toolType');

    let whereClause: any = {};

    if (authorType) whereClause.authorType = authorType;
    if (status) whereClause.status = status;
    if (visibility) whereClause.visibility = visibility;
    if (communityId) whereClause.communityId = communityId;
    if (organizationId) whereClause.organizationId = organizationId;
    if (toolType) whereClause.toolType = toolType;

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

    const tools = await prisma.polymathTool.findMany({
      where: whereClause,
      include: {
        
        
        
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const parsedTools = tools.map((tool) => ({
      ...tool,
      approvalChain: tool.approvalChain ? JSON.parse(tool.approvalChain) : [],
    }));

    return NextResponse.json(
      { tools: parsedTools, count: parsedTools.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[GET /api/polymath/tools]', error);
    return NextResponse.json(
      { error: 'Failed to fetch tools', details: error?.message },
      { status: 500 }
    );
  }
}
