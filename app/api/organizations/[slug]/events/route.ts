import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const userId = request.headers.get('User-Id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Find organization
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get user's communities in this org
    const communityMemberships = await prisma.learningCommunityMember.findMany({
      where: {
        userId: userId,
        community: {
          organizationId: org.id,
        },
      },
      select: {
        communityId: true,
      },
    });

    const communityIds = communityMemberships.map((m) => m.communityId);

    // Get organization events + community events
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { organizationId: org.id },
          { communityId: { in: communityIds } },
        ],
        status: { not: 'cancelled' },
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
        rsvps: {
          where: { userId: userId },
          select: { status: true },
        },
        _count: {
          select: { rsvps: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const userId = request.headers.get('User-Id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Find organization
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      maxAttendees,
      recurrenceType,
      recurrenceEndDate,
      communityId,
      eventContext = 'organization',
      classId,
      attendeeUserIds = [],
      attendeeClassIds = [],
      attendeeCommunityIds = [],
    } = body;

    if (!title || !startDate) {
      return NextResponse.json(
        { error: 'Title and start date are required' },
        { status: 400 }
      );
    }

    // Determine event scope based on context
    let eventOrgId: string | null = org.id;
    let eventClassId: string | null = null;
    let eventCommunityId: string | null = null;

    if (eventContext === 'class') {
      if (!classId) {
        return NextResponse.json(
          { error: 'Class ID is required for class events' },
          { status: 400 }
        );
      }

      // Verify class exists in this org
      const cls = await prisma.improvClass.findUnique({
        where: { id: classId },
        select: { organizationId: true, instructorId: true },
      });

      if (!cls || cls.organizationId !== org.id) {
        return NextResponse.json(
          { error: 'Class not found in this organization' },
          { status: 404 }
        );
      }

      // Only instructor of the class can create class events
      if (cls.instructorId !== userId) {
        return NextResponse.json(
          { error: 'Only the class instructor can create class events' },
          { status: 403 }
        );
      }

      eventClassId = classId;
      eventOrgId = org.id;
    } else if (eventContext === 'communities') {
      // Community-scoped event - verify all selected communities exist
      if (attendeeCommunityIds.length > 0) {
        const communities = await prisma.learningCommunity.findMany({
          where: {
            id: { in: attendeeCommunityIds },
            organizationId: org.id,
          },
          select: { id: true, curatorId: true },
        });

        if (communities.length !== attendeeCommunityIds.length) {
          return NextResponse.json(
            { error: 'Some communities not found in this organization' },
            { status: 404 }
          );
        }

        // User must be curator of at least one selected community
        const isValidCurator = communities.some((c) => c.curatorId === userId);
        if (!isValidCurator) {
          return NextResponse.json(
            { error: 'You must be a curator of at least one selected community' },
            { status: 403 }
          );
        }
      }
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
        recurrenceType: recurrenceType || 'none',
        recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
        organizationId: eventOrgId,
        classId: eventClassId,
        communityId: eventCommunityId,
        createdById: userId,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { rsvps: true } },
      },
    });

    // Creator automatically attends
    await prisma.eventRSVP.create({
      data: {
        eventId: event.id,
        userId: userId,
        status: 'attending',
      },
    });

    // Add attendees based on event context
    const rsvpUserIds = new Set([userId, ...attendeeUserIds]);

    // If class event, auto-add all enrolled students
    if (eventContext === 'class' && eventClassId) {
      const classEnrollments = await prisma.improvEnrollment.findMany({
        where: {
          classId: eventClassId,
          status: 'active',
        },
        select: { studentId: true },
      });

      classEnrollments.forEach((enrollment) => {
        rsvpUserIds.add(enrollment.studentId);
      });
    }

    // If community context, add community members from selected communities
    if (eventContext === 'communities' && attendeeCommunityIds.length > 0) {
      const communityMembers = await prisma.learningCommunityMember.findMany({
        where: {
          communityId: { in: attendeeCommunityIds },
          status: 'active',
        },
        select: { userId: true },
      });

      communityMembers.forEach((member) => {
        rsvpUserIds.add(member.userId);
      });
    }

    // Add students from attendee classes
    if (attendeeClassIds.length > 0) {
      const classEnrollments = await prisma.improvEnrollment.findMany({
        where: {
          classId: { in: attendeeClassIds },
          status: 'active',
        },
        select: { studentId: true },
      });

      classEnrollments.forEach((enrollment) => {
        rsvpUserIds.add(enrollment.studentId);
      });
    }

    // Create RSVPs for all attendees
    const rsvpPromises = Array.from(rsvpUserIds)
      .filter((id) => id !== userId) // Skip creator, already added above
      .map((id) =>
        prisma.eventRSVP.create({
          data: {
            eventId: event.id,
            userId: id,
            status: 'attending',
          },
        }).catch(() => {
          // Ignore duplicate RSVPs
        })
      );

    await Promise.all(rsvpPromises);

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
