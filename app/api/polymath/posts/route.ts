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
      content,
      abstract,
      topic,
      tags,
      authorType, // "user" | "organization" | "community" | "class"
      authorId,
      organizationId,
      communityId,
      classId,
      status = 'draft', // "draft" | "published" | "archived"
      visibility = 'public', // "public" | "organization" | "community" | "class" | "private"
      coverImage,
    } = body;

    // Validation
    if (!title || !content || !authorType || !authorId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, authorType, authorId' },
        { status: 400 }
      );
    }

    // Verify user has permission to create post as this author
    if (authorType === 'organization') {
      const orgRole = await prisma.organizationRole.findUnique({
        where: {
          userId_organizationId: {
            userId: session.user.id,
            organizationId: authorId,
          },
        },
      });

      if (!orgRole || !['SuperAdmin', 'Admin'].includes(orgRole.role)) {
        return NextResponse.json(
          { error: 'You do not have permission to post as this organization' },
          { status: 403 }
        );
      }
    } else if (authorType === 'community') {
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
    } else if (authorType === 'class') {
      const classRecord = await prisma.k12Class.findUnique({
        where: { id: authorId },
      });

      if (!classRecord || classRecord.instructorId !== session.user.id) {
        return NextResponse.json(
          { error: 'You do not have permission to post as this class' },
          { status: 403 }
        );
      }
    }

    // Create post
    const post = await prisma.polymathPost.create({
      data: {
        title,
        content,
        abstract: abstract || null,
        topic: topic || null,
        tags: tags || null,
        authorType,
        authorId,
        creatorId: session.user.id,
        organizationId: organizationId || null,
        communityId: communityId || null,
        classId: classId || null,
        status,
        visibility,
        coverImage: coverImage || null,
        publishedAt: status === 'published' ? new Date() : null,
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
        community: { select: { id: true, name: true, slug: true } },
        class: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/polymath/posts]', error);
    return NextResponse.json(
      { error: 'Failed to create post', details: error?.message },
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
    const organizationId = req.nextUrl.searchParams.get('organizationId');
    const communityId = req.nextUrl.searchParams.get('communityId');
    const classId = req.nextUrl.searchParams.get('classId');
    const authorType = req.nextUrl.searchParams.get('authorType');

    // Build where clause based on visibility and user access
    let whereClause: any = {
      status: 'published',
    };

    // Add filters
    if (organizationId) whereClause.organizationId = organizationId;
    if (communityId) whereClause.communityId = communityId;
    if (classId) whereClause.classId = classId;
    if (authorType) whereClause.authorType = authorType;

    // Apply visibility rules
    if (userId) {
      // User is logged in - get their org memberships and class enrollments
      const orgMemberships = await prisma.organizationRole.findMany({
        where: { userId },
        select: { organizationId: true },
      });
      const orgIds = orgMemberships.map((m) => m.organizationId);

      const classEnrollments = await prisma.k12Enrollment.findMany({
        where: { studentId: userId },
        select: { classId: true },
      });
      const classIds = classEnrollments.map((e) => e.classId);

      // Also get classes where user is instructor
      const instructorClasses = await prisma.k12Class.findMany({
        where: { instructorId: userId },
        select: { id: true },
      });
      const instructorClassIds = instructorClasses.map((c) => c.id);

      // Visibility: public, or (organization + user is member), or (class + user is enrolled/instructor), or (community + user is member)
      whereClause.OR = [
        { visibility: 'public' },
        { AND: [{ visibility: 'organization' }, { organizationId: { in: orgIds } }] },
        { AND: [{ visibility: 'class' }, { classId: { in: [...classIds, ...instructorClassIds] } }] },
      ];

      // Add community visibility if user is a community member
      const communityMemberships = await prisma.learningCommunityMember.findMany({
        where: { userId },
        select: { communityId: true },
      });
      const communityIds = communityMemberships.map((m) => m.communityId);

      if (communityIds.length > 0) {
        whereClause.OR.push({ AND: [{ visibility: 'community' }, { communityId: { in: communityIds } }] });
      }
    } else {
      // Not logged in - only see public posts
      whereClause.visibility = 'public';
    }

    const posts = await prisma.polymathPost.findMany({
      where: whereClause,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
        community: { select: { id: true, name: true, slug: true } },
        class: { select: { id: true, name: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({ posts, count: posts.length }, { status: 200 });
  } catch (error: any) {
    console.error('[GET /api/polymath/posts]', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts', details: error?.message },
      { status: 500 }
    );
  }
}
