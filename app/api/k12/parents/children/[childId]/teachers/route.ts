import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { childId } = await params;

  try {
    // Verify parent-child relationship
    const parentChild = await prisma.parentChild.findUnique({
      where: {
        parentId_childId: {
          parentId: session.user.id,
          childId,
        },
      },
    });

    if (!parentChild) {
      return NextResponse.json(
        { error: 'Not authorized to view this child\'s teachers' },
        { status: 403 }
      );
    }

    // Get child's class enrollments and teacher info
    const enrollments = await prisma.k12Enrollment.findMany({
      where: { studentId: childId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            instructorId: true,
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    // Extract unique teachers
    const teachersMap = new Map();
    for (const enrollment of enrollments) {
      if (!teachersMap.has(enrollment.class.instructorId)) {
        teachersMap.set(enrollment.class.instructorId, {
          id: enrollment.class.instructor.id,
          name: enrollment.class.instructor.name,
          email: enrollment.class.instructor.email,
          className: enrollment.class.name,
        });
      }
    }

    const teachers = Array.from(teachersMap.values());

    // Get conversation and message info for each teacher
    const teachersWithConversations = await Promise.all(
      teachers.map(async (teacher) => {
        // Look for direct conversation
        const conversation = await prisma.conversation.findFirst({
          where: {
            type: 'direct',
            participants: {
              some: {
                AND: [
                  { userId: session.user.id },
                  {
                    conversation: {
                      participants: {
                        some: { userId: teacher.id },
                      },
                    },
                  },
                ],
              },
            },
          },
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            participants: {
              where: { userId: session.user.id },
            },
          },
        });

        const lastMessage = conversation?.messages[0];
        const lastReadAt = conversation?.participants[0]?.lastReadAt;

        let unreadCount = 0;
        if (conversation && lastReadAt) {
          const unreadMessages = await prisma.message.count({
            where: {
              conversationId: conversation.id,
              createdAt: { gt: lastReadAt },
              senderId: { not: session.user.id },
            },
          });
          unreadCount = unreadMessages;
        }

        return {
          teacher,
          conversationId: conversation?.id,
          unreadCount,
          lastMessage: lastMessage ? {
            id: lastMessage.id,
            text: lastMessage.content,
            senderId: lastMessage.senderId,
            senderName:
              lastMessage.senderId === session.user.id
                ? 'You'
                : lastMessage.senderName || teacher.name,
            sentAt: lastMessage.createdAt.toISOString(),
            isFromParent: lastMessage.senderId === session.user.id,
          } : undefined,
          lastMessageAt: lastMessage?.createdAt.toISOString(),
        };
      })
    );

    return NextResponse.json({
      childId,
      teachers: teachersWithConversations.map((tc) => ({
        teacher: tc.teacher,
        conversationId: tc.conversationId,
        unreadCount: tc.unreadCount,
        lastMessage: tc.lastMessage,
        lastMessageAt: tc.lastMessageAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
