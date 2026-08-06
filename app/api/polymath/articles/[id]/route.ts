import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

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
    const body = await req.json();

    const {
      title,
      content,
      abstract,
      topic,
      tags,
      coverImage,
      visibility,
    } = body;

    // Get the article
    const article = await prisma.polymathArticle.findUnique({
      where: { id },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Authorization: must be creator or org admin
    let isAuthorized = false;

    if (article.authorType === 'individual') {
      isAuthorized = article.authorId === session.user.id;
    } else if (article.authorType === 'organization') {
      // Check if user is org admin
      const orgRole = await prisma.organizationRole.findUnique({
        where: {
          userId_organizationId: {
            userId: session.user.id,
            organizationId: article.organizationId || '',
          },
        },
      });
      isAuthorized = !!(orgRole && ['SuperAdmin', 'SchoolAdmin'].includes(orgRole.role));
    } else if (article.authorType === 'community') {
      // Check if user is community curator
      const communityMember = await prisma.learningCommunityMember.findUnique({
        where: {
          communityId_userId: {
            communityId: article.communityId || '',
            userId: session.user.id,
          },
        },
      });
      isAuthorized = !!(communityMember && ['curator', 'moderator'].includes(communityMember.role));
    } else if (article.authorType === 'event') {
      // Check if user is event creator
      const event = await prisma.event.findUnique({
        where: { id: article.eventId || '' },
        select: { createdById: true },
      });
      isAuthorized = !!(event?.createdById === session.user.id);
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this article' },
        { status: 403 }
      );
    }

    // Only allow editing if status is draft or pending_approval
    if (!['draft', 'pending_approval'].includes(article.status)) {
      return NextResponse.json(
        { error: `Cannot edit articles with status "${article.status}"` },
        { status: 400 }
      );
    }

    // Update article
    const updatedArticle = await prisma.polymathArticle.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(abstract !== undefined && { abstract }),
        ...(topic !== undefined && { topic }),
        ...(tags !== undefined && { tags }),
        ...(coverImage !== undefined && { coverImage }),
        ...(visibility && { visibility }),
      },
      include: {
        
        
        
      },
    });

    return NextResponse.json(
      {
        ...updatedArticle,
        approvalChain: updatedArticle.approvalChain
          ? JSON.parse(updatedArticle.approvalChain)
          : [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[PUT /api/polymath/articles/[id]]', error);
    return NextResponse.json(
      { error: 'Failed to update article', details: error?.message },
      { status: 500 }
    );
  }
}
