'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MeetingList, ScheduleMeetingForm, LoadingState } from '@/app/components/polymath';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  zoomUrl?: string;
  host: { name: string };
  attendeeCount: number;
  status: 'upcoming' | 'today' | 'past';
}

export default function MeetingsPage() {
  const searchParams = useSearchParams();
  const communitySlug = searchParams.get('community') || 'default-community';

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, [communitySlug]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/communities/${communitySlug}/meetings`);
      if (!response.ok) throw new Error('Failed to fetch meetings');

      const data = await response.json();

      // Transform API response to match component interface
      const transformedMeetings = data.meetings.map((m: any) => {
        const scheduledDate = new Date(m.scheduledAt);
        const now = new Date();
        let status: 'upcoming' | 'today' | 'past' = 'past';

        if (scheduledDate >= now) {
          if (scheduledDate.toDateString() === now.toDateString()) {
            status = 'today';
          } else {
            status = 'upcoming';
          }
        }

        return {
          id: m.id,
          title: m.title,
          date: scheduledDate.toISOString().split('T')[0],
          time: `${String(scheduledDate.getHours()).padStart(2, '0')}:${String(scheduledDate.getMinutes()).padStart(2, '0')}`,
          location: m.location,
          zoomUrl: m.zoomUrl,
          host: { name: m.host?.name || 'Unknown' },
          attendeeCount: m._count?.attendees || 0,
          status,
        };
      });

      setMeetings(transformedMeetings);
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (formData: any) => {
    try {
      const response = await fetch(`/api/communities/${communitySlug}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          scheduledAt: `${formData.date}T${formData.time}`,
          location: formData.location,
          zoomUrl: formData.zoomUrl,
        }),
      });

      if (!response.ok) throw new Error('Failed to create meeting');

      setShowCreateForm(false);
      await fetchMeetings();
    } catch (error) {
      console.error('Failed to create meeting:', error);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const response = await fetch(`/api/communities/${communitySlug}/meetings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete meeting');
      await fetchMeetings();
    } catch (error) {
      console.error('Failed to delete meeting:', error);
    }
  };

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] py-8 px-4">
        <ScheduleMeetingForm
          onSubmit={handleCreateMeeting}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  if (loading) {
    return <LoadingState message="Loading meetings..." />;
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] py-8 px-4">
      <MeetingList
        meetings={meetings}
        onCreateMeeting={() => setShowCreateForm(true)}
        onJoinMeeting={(id) => {
          const meeting = meetings.find(m => m.id === id);
          if (meeting?.zoomUrl) window.open(meeting.zoomUrl, '_blank');
        }}
        onEditMeeting={(id) => console.log('Edit meeting:', id)}
        onDeleteMeeting={handleDeleteMeeting}
      />
    </div>
  );
}
