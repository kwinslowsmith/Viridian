import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/communities/[slug]/meetings/[meetingId]
 * Get a specific meeting
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; meetingId: string }> }
) {
  try {
    const { slug, meetingId } = await params;

    // Verify community exists
    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
      select: { id: true },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Get meeting
    const meeting = await prisma.polymathMeeting.findUnique({
      where: { id: meetingId },
      include: {
        host: { select: { id: true, name: true, email: true } },
      },
    });

    if (!meeting || meeting.communityId !== community.id) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Failed to fetch meeting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meeting' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/communities/[slug]/meetings/[meetingId]
 * Update meeting (notes, recording, or details)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; meetingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug, meetingId } = await params;
    const { title, description, scheduledAt, zoomUrl, location, notes, recordingUrl } = await request.json();

    // Verify community exists
    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
      select: { id: true, curatorId: true },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Get meeting
    const meeting = await prisma.polymathMeeting.findUnique({
      where: { id: meetingId },
      select: { communityId: true, hostId: true },
    });

    if (!meeting || meeting.communityId !== community.id) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Only host or curator can update
    if (meeting.hostId !== session.user.id && community.curatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this meeting' },
        { status: 403 }
      );
    }

    // Update meeting
    const updated = await prisma.polymathMeeting.update({
      where: { id: meetingId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(zoomUrl !== undefined && { zoomUrl }),
        ...(location !== undefined && { location }),
        ...(notes !== undefined && { notes }),
        ...(recordingUrl !== undefined && { recordingUrl }),
      },
      include: {
        host: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update meeting:', error);
    return NextResponse.json(
      { error: 'Failed to update meeting' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/communities/[slug]/meetings/[meetingId]
 * Delete a meeting (host or curator only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; meetingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug, meetingId } = await params;

    // Verify community exists
    const community = await prisma.learningCommunity.findFirst({
      where: { slug },
      select: { id: true, curatorId: true },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Get meeting
    const meeting = await prisma.polymathMeeting.findUnique({
      where: { id: meetingId },
      select: { communityId: true, hostId: true },
    });

    if (!meeting || meeting.communityId !== community.id) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Only host or curator can delete
    if (meeting.hostId !== session.user.id && community.curatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this meeting' },
        { status: 403 }
      );
    }

    // Delete meeting
    await prisma.polymathMeeting.delete({
      where: { id: meetingId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete meeting:', error);
    return NextResponse.json(
      { error: 'Failed to delete meeting' },
      { status: 500 }
    );
  }
}
