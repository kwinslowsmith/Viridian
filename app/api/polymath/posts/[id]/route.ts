import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const post = await prisma.polymathPost.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
        community: { select: { id: true, name: true, slug: true } },
        class: { select: { id: true, name: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check visibility
    if (post.status !== 'published') {
      if (!userId || post.creatorId !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Check visibility rules for published posts
    if (post.visibility === 'organization' && userId) {
      const hasAccess = await prisma.organizationRole.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: post.organizationId!,
          },
        },
      });
      if (!hasAccess) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    if (post.visibility === 'class' && userId) {
      const hasAccess =
        (await prisma.k12Enrollment.findUnique({
          where: {
            classId_studentId: { classId: post.classId!, studentId: userId },
          },
        })) || (await prisma.k12Class.findUnique({
          where: { id: post.classId!, instructorId: userId },
        }));
      if (!hasAccess) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    if (post.visibility === 'community' && userId) {
      const hasAccess = await prisma.learningCommunityMember.findUnique({
        where: {
          communityId_userId: {
            communityId: post.communityId!,
            userId,
          },
        },
      });
      if (!hasAccess) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    if (post.visibility === 'private' && (!userId || post.creatorId !== userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error: any) {
    console.error('[GET /api/polymath/posts/:id]', error);
    return NextResponse.json(
      { error: 'Failed to fetch post', details: error?.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.polymathPost.findUnique({ where: { id } });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Only creator can edit
    if (post.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own posts' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, content, abstract, topic, tags, status, visibility, coverImage } = body;

    const updated = await prisma.polymathPost.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(abstract !== undefined && { abstract }),
        ...(topic && { topic }),
        ...(tags && { tags }),
        ...(status && { status }),
        ...(visibility && { visibility }),
        ...(coverImage && { coverImage }),
        ...(status === 'published' && !post.publishedAt && { publishedAt: new Date() }),
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
        community: { select: { id: true, name: true, slug: true } },
        class: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error('[PUT /api/polymath/posts/:id]', error);
    return NextResponse.json(
      { error: 'Failed to update post', details: error?.message },
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
    const post = await prisma.polymathPost.findUnique({ where: { id } });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Only creator can delete
    if (post.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own posts' },
        { status: 403 }
      );
    }

    await prisma.polymathPost.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[DELETE /api/polymath/posts/:id]', error);
    return NextResponse.json(
      { error: 'Failed to delete post', details: error?.message },
      { status: 500 }
    );
  }
}
