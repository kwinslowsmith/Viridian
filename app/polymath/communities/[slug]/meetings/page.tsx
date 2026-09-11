'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button, LoadingState, EmptyState, Tabs } from '@/app/components/polymath';
import { MeetingCard } from '@/app/components/polymath/MeetingCard';
import { ScheduleMeetingModal } from '@/app/components/polymath/ScheduleMeetingModal';

interface Meeting {
  id: string;
  title: string;
  dateTime: string;
  host?: string;
  status?: 'upcoming' | 'past' | 'ongoing';
  zoomUrl?: string;
}

export default function MeetingsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchMeetings();
    }
  }, [slug]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/communities/${slug}/meetings`);
      if (res.ok) {
        const data = await res.json();
        setMeetings(data.meetings || []);
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMeeting = async (meeting: any) => {
    try {
      const res = await fetch(`/api/communities/${slug}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meeting),
      });

      if (!res.ok) {
        throw new Error('Failed to schedule meeting');
      }

      const data = await res.json();
      setMeetings((prev) => [data.meeting, ...prev]);
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
      throw error;
    }
  };

  if (loading) {
    return <LoadingState message="Loading meetings..." />;
  }

  // Separate meetings by status
  const upcomingMeetings = meetings.filter((m) => m.status === 'upcoming');
  const pastMeetings = meetings.filter((m) => m.status === 'past');

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
            onAction={() => (window.location.href = '#')}
          />
        ) : (
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                id={meeting.id}
                communitySlug={slug}
                title={meeting.title}
                dateTime={meeting.dateTime}
                host={meeting.host}
                status={meeting.status}
                zoomUrl={meeting.zoomUrl}
              />
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
          <div className="space-y-4">
            {pastMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                id={meeting.id}
                communitySlug={slug}
                title={meeting.title}
                dateTime={meeting.dateTime}
                host={meeting.host}
                status={meeting.status}
                zoomUrl={meeting.zoomUrl}
              />
            ))}
          </div>
        ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-[#3C3C3C]">Meetings</h1>
        <Button onClick={() => setIsScheduleModalOpen(true)}>+ Schedule Meeting</Button>
      </div>

      {/* Tabs */}
      {meetings.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No meetings yet"
          description="Schedule a meeting to bring your community together"
          actionLabel="Schedule Meeting"
          onAction={() => (window.location.href = '#')}
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
