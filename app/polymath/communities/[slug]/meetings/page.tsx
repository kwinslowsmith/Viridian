'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, LoadingState, EmptyState, Tabs, Card, CardBody } from '@/app/components/polymath';
import { useCommunityMeetings, useCreateMeeting } from '@/hooks/usePolymath';
import { ScheduleMeetingModal } from '@/app/components/polymath/ScheduleMeetingModal';

export default function MeetingsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { meetings, loading, error, refetch } = useCommunityMeetings(slug);
  const { create: createMeeting, loading: creatingMeeting, error: createError } = useCreateMeeting(slug);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const handleScheduleMeeting = async (data: any) => {
    try {
      await createMeeting({
        title: data.title,
        description: data.description,
        scheduledAt: data.scheduledAt,
        duration: data.duration,
        zoomUrl: data.zoomUrl,
        location: data.location,
      });
      setIsScheduleModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
    }
  };

  if (loading) {
    return <LoadingState message="Loading meetings..." />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-800 font-medium">Error loading meetings</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
        <Link href={`/polymath/communities/${slug}`}>
          <Button>Back to Community</Button>
        </Link>
      </div>
    );
  }

  // Separate meetings by date (upcoming vs past)
  const now = new Date();
  const upcomingMeetings = meetings.filter((m) => new Date(m.scheduledAt) > now);
  const pastMeetings = meetings.filter((m) => new Date(m.scheduledAt) <= now);

  const tabs = [
    {
      id: 'upcoming',
      label: `Upcoming (${upcomingMeetings.length})`,
      content:
        upcomingMeetings.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No upcoming meetings"
            description="Schedule a meeting to bring your community together"
            actionLabel="Schedule Meeting"
            onAction={() => setIsScheduleModalOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {upcomingMeetings.map((meeting) => (
              <Card key={meeting.id}>
                <CardBody>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#3C3C3C] text-lg">{meeting.title}</h3>
                      {meeting.description && (
                        <p className="text-sm text-[#666666] mt-1">{meeting.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <span className="text-sm font-medium text-[#3C3C3C]">
                          📅 {new Date(meeting.scheduledAt).toLocaleDateString()} {new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {meeting.location && (
                          <span className="text-sm text-[#666666]">📍 {meeting.location}</span>
                        )}
                        {meeting.duration && (
                          <span className="text-sm text-[#666666]">⏱️ {meeting.duration} min</span>
                        )}
                      </div>
                      <p className="text-xs text-[#999999] mt-2">
                        Hosted by {meeting.createdBy?.name || 'Unknown'}
                      </p>
                    </div>
                    {meeting.zoomUrl && (
                      <a href={meeting.zoomUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm">Join on Zoom</Button>
                      </a>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ),
    },
    {
      id: 'past',
      label: `Past (${pastMeetings.length})`,
      content:
        pastMeetings.length === 0 ? (
          <p className="text-[#666666]">No past meetings yet</p>
        ) : (
          <div className="space-y-3">
            {pastMeetings.map((meeting) => (
              <Card key={meeting.id} className="opacity-75">
                <CardBody>
                  <div>
                    <h3 className="font-semibold text-[#3C3C3C]">{meeting.title}</h3>
                    {meeting.description && (
                      <p className="text-sm text-[#666666] mt-1">{meeting.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className="text-sm text-[#666666]">
                        📅 {new Date(meeting.scheduledAt).toLocaleDateString()}
                      </span>
                      {meeting.location && (
                        <span className="text-sm text-[#666666]">📍 {meeting.location}</span>
                      )}
                    </div>
                    <p className="text-xs text-[#999999] mt-2">
                      Hosted by {meeting.createdBy?.name || 'Unknown'}
                    </p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#3C3C3C] mb-2">Meetings</h1>
          <p className="text-[#666666]">{meetings.length} total meetings</p>
        </div>
        <Button onClick={() => setIsScheduleModalOpen(true)}>+ Schedule Meeting</Button>
      </div>

      {createError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {createError}
        </div>
      )}

      {/* Tabs */}
      {meetings.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No meetings yet"
          description="Schedule a meeting to bring your community together"
          actionLabel="Schedule Meeting"
          onAction={() => setIsScheduleModalOpen(true)}
        />
      ) : (
        <Tabs tabs={tabs} defaultTabId="upcoming" />
      )}

      <ScheduleMeetingModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSubmit={handleScheduleMeeting}
        communitySlug={slug}
      />
    </div>
  );
}
