import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get all conversations the user is a participant in
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
            removedAt: null,
          },
        },
      },
      include: {
        participants: {
          select: {
            userId: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { id: true, content: true, createdAt: true, sender: { select: { name: true } } },
        },
        class: { select: { id: true, name: true } },
        event: { select: { id: true, title: true } },
        organization: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find((p) => p.userId === userId);
        const lastReadAt = participant?.user ? new Date(participant.user.id) : new Date();

        // Get the actual lastReadAt from the database
        const actualParticipant = await prisma.conversationParticipant.findUnique({
          where: {
            conversationId_userId: {
              conversationId: conv.id,
              userId,
            },
          },
        });

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            createdAt: {
              gt: actualParticipant?.lastReadAt || new Date(0),
            },
          },
        });

        return {
          ...conv,
          unreadCount,
          lastReadAt: actualParticipant?.lastReadAt,
        };
      })
    );

    return NextResponse.json({ conversations: conversationsWithUnread }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('📨 POST /api/conversations called');

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const userId = session.user.id;
    const body = await request.json();
    console.log('Request body:', body);

    const {
      type,
      participantIds = [],
      communityIds = [],
      classIds = [],
      departmentIds = [],
      classId,
      eventId,
      organizationId,
      title,
      isMail = false,
      allowReplies = true,
    } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      );
    }

    // For direct conversations, check if already exists
    if (type === 'direct' && participantIds.length === 1) {
      const otherUserId = participantIds[0];

      if (userId === otherUserId) {
        return NextResponse.json(
          { error: 'Cannot create a conversation with yourself' },
          { status: 400 }
        );
      }

      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: 'direct',
          participants: {
            every: {
              userId: { in: [userId, otherUserId] },
            },
          },
        },
        include: {
          participants: {
            select: {
              userId: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      if (existingConversation) {
        console.log('Found existing conversation');
        return NextResponse.json(
          { conversation: existingConversation },
          { status: 200 }
        );
      }
    }

    console.log('Creating new conversation with participants:', [userId, ...participantIds]);

    let finalParticipantIds = [...participantIds];

    // For organization conversations, add members based on filters
    if (type === 'organization' && organizationId) {
      // If specific participants/communities/classes are provided, use those
      if (participantIds.length > 0) {
        console.log('Using specified participants:', participantIds);
        finalParticipantIds = participantIds;
      } else if (communityIds.length > 0) {
        console.log('Fetching community members for communities:', communityIds);
        const communityMembers = await prisma.learningCommunityMember.findMany({
          where: { communityId: { in: communityIds } },
          select: { userId: true },
          distinct: ['userId'],
        });
        finalParticipantIds = communityMembers.map((m) => m.userId);
        console.log('Found', finalParticipantIds.length, 'community members');
      } else if (classIds.length > 0) {
        console.log('Fetching class members for classes:', classIds);
        const classEnrollments = await prisma.improvEnrollment.findMany({
          where: { classId: { in: classIds } },
          select: { studentId: true },
          distinct: ['studentId'],
        });
        const classInstructors = await prisma.improvClass.findMany({
          where: { id: { in: classIds } },
          select: { instructorId: true },
        });
        finalParticipantIds = [
          ...classEnrollments.map((e) => e.studentId),
          ...classInstructors.map((c) => c.instructorId),
        ];
        console.log('Found', finalParticipantIds.length, 'class members');
      } else if (departmentIds.length > 0) {
        console.log('Fetching department members for departments:', departmentIds);
        const departmentMembers = await prisma.organizationalUnitMember.findMany({
          where: {
            unit: {
              id: { in: departmentIds }
            }
          },
          select: { userId: true },
          distinct: ['userId'],
        });
        finalParticipantIds = departmentMembers.map((m) => m.userId);
        console.log('Found', finalParticipantIds.length, 'department members');
      } else {
        console.log('Fetching all organization members for org:', organizationId);
        const orgMembers = await prisma.organizationRole.findMany({
          where: { organizationId },
          select: { userId: true },
        });
        finalParticipantIds = orgMembers.map((m) => m.userId);
        console.log('Found', finalParticipantIds.length, 'organization members');
      }
    }

    // For event conversations, add all event attendees/RSVPs
    if (type === 'event' && eventId) {
      console.log('Fetching event attendees for event:', eventId);
      const eventRsvps = await prisma.eventRSVP.findMany({
        where: { eventId },
        select: { userId: true },
      });
      finalParticipantIds = eventRsvps.map((r) => r.userId);
      console.log('Found', finalParticipantIds.length, 'event attendees');
    }

    // For class conversations, add all enrolled students
    if (type === 'class' && classId) {
      console.log('Fetching class enrollments for class:', classId);
      const enrollments = await prisma.improvEnrollment.findMany({
        where: { classId },
        select: { studentId: true },
      });
      finalParticipantIds = enrollments.map((e) => e.studentId);
      // Also add instructor
      const classData = await prisma.improvClass.findUnique({
        where: { id: classId },
        select: { instructorId: true },
      });
      if (classData?.instructorId) {
        finalParticipantIds.push(classData.instructorId);
      }
      console.log('Found', finalParticipantIds.length, 'class participants');
    }

    // Ensure creator is included and no duplicates
    const uniqueParticipantIds = Array.from(new Set([userId, ...finalParticipantIds]));

    const conversation = await prisma.conversation.create({
      data: {
        type,
        classId,
        eventId,
        organizationId,
        title,
        isMail,
        allowReplies,
        createdById: userId,
        participants: {
          create: uniqueParticipantIds.map((id) => ({ userId: id })),
        },
      },
      include: {
        participants: {
          select: {
            userId: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    console.log('✅ Conversation created:', {
      id: conversation.id,
      type,
      isMail,
      organizationId,
      classId,
      eventId,
      title,
      participantCount: uniqueParticipantIds.length
    });
    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error('❌ Error in POST /api/conversations:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'Failed to create conversation',
        details: errorMessage,
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}
