import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; eventId: string }> }
) {
  try {
    const { slug, eventId } = await params;
    const userId = request.headers.get('User-Id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body; // "attending", "maybe", "declined"

    if (!status || !['attending', 'maybe', 'declined'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status required (attending, maybe, or declined)' },
        { status: 400 }
      );
    }

    // Find organization
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Verify event exists and belongs to org or its communities
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        organizationId: true,
        communityId: true,
        maxAttendees: true,
        _count: { select: { rsvps: true } },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Verify user has access
    if (event.organizationId === org.id) {
      // Org event - user just needs to be in org (already checked by having userId)
    } else if (event.communityId) {
      // Community event - user must be member
      const isMember = await prisma.learningCommunityMember.findUnique({
        where: {
          communityId_userId: {
            communityId: event.communityId,
            userId: userId,
          },
        },
      });

      if (!isMember) {
        return NextResponse.json(
          { error: 'You are not a member of this community' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check max attendees if declining (we can allow declining even if full)
    if (status !== 'declined' && event.maxAttendees && event._count.rsvps >= event.maxAttendees) {
      // Check if user is already attending
      const existing = await prisma.eventRSVP.findUnique({
        where: {
          eventId_userId: {
            eventId: eventId,
            userId: userId,
          },
        },
      });

      if (!existing) {
        return NextResponse.json(
          { error: 'Event is at maximum capacity' },
          { status: 400 }
        );
      }
    }

    // Upsert RSVP
    const rsvp = await prisma.eventRSVP.upsert({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: userId,
        },
      },
      update: {
        status,
      },
      create: {
        eventId,
        userId,
        status,
      },
    });

    return NextResponse.json({ rsvp }, { status: 200 });
  } catch (error) {
    console.error('Failed to RSVP to event:', error);
    return NextResponse.json(
      { error: 'Failed to RSVP to event' },
      { status: 500 }
    );
  }
}
