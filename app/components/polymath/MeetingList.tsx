'use client';

import React, { useState, useMemo } from 'react';
import { Button, TextInput, LoadingState, EmptyState } from './index';
import { MeetingCard } from './MeetingCard';

interface Host {
  name: string;
  avatar?: string;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  zoomUrl?: string;
  host: Host;
  attendeeCount: number;
  status: 'upcoming' | 'today' | 'past';
}

interface MeetingListProps {
  meetings?: Meeting[];
  loading?: boolean;
  onCreateMeeting?: () => void;
  onJoinMeeting?: (meetingId: string) => void;
  onEditMeeting?: (meetingId: string) => void;
  onDeleteMeeting?: (meetingId: string) => void;
}

const MOCK_MEETINGS: Meeting[] = [
  {
    id: '1',
    title: 'Team Sync',
    date: '2026-10-10',
    time: '14:30',
    location: 'Conference Room A',
    zoomUrl: 'https://zoom.us/j/123456789',
    host: { name: 'Kyle W' },
    attendeeCount: 12,
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'Curriculum Planning Session',
    date: '2026-10-08',
    time: '10:00',
    location: 'Virtual - Zoom',
    zoomUrl: 'https://zoom.us/j/987654321',
    host: { name: 'Sarah M' },
    attendeeCount: 8,
    status: 'upcoming',
  },
  {
    id: '3',
    title: 'Monthly Community Meeting',
    date: new Date().toISOString().split('T')[0],
    time: '16:00',
    location: 'Main Hall',
    host: { name: 'John D' },
    attendeeCount: 25,
    status: 'today',
  },
  {
    id: '4',
    title: 'Q3 Review',
    date: '2026-10-05',
    time: '13:00',
    location: 'Board Room',
    host: { name: 'Lisa T' },
    attendeeCount: 15,
    status: 'past',
  },
  {
    id: '5',
    title: 'Standards Workshop',
    date: '2026-10-12',
    time: '09:00',
    zoomUrl: 'https://zoom.us/j/555666777',
    host: { name: 'Mike B' },
    attendeeCount: 30,
    status: 'upcoming',
  },
  {
    id: '6',
    title: 'Resource Sharing Circle',
    date: '2026-10-15',
    time: '15:30',
    location: 'Library Conference Room',
    host: { name: 'Emma J' },
    attendeeCount: 10,
    status: 'upcoming',
  },
];

export function MeetingList({
  meetings,
  loading = false,
  onCreateMeeting,
  onJoinMeeting,
  onEditMeeting,
  onDeleteMeeting,
}: MeetingListProps) {
  const [filterTab, setFilterTab] = useState<'all' | 'upcoming' | 'today' | 'past'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const displayMeetings = meetings || MOCK_MEETINGS;

  const filteredMeetings = useMemo(() => {
    let filtered = displayMeetings;

    // Filter by tab
    if (filterTab !== 'all') {
      filtered = filtered.filter((m) => m.status === filterTab);
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.host.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date
    return filtered.sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time}`);
      const bDate = new Date(`${b.date}T${b.time}`);
      return aDate.getTime() - bDate.getTime();
    });
  }, [displayMeetings, filterTab, searchTerm]);

  if (loading) {
    return <LoadingState message="Loading meetings..." />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#3C3C3C] mb-2">
            📅 Meetings
          </h1>
          <p className="text-[#666666]">
            Schedule and manage community meetings
          </p>
        </div>
        <button
          onClick={onCreateMeeting}
          className="px-4 py-2.5 text-sm font-medium text-white bg-[#20B2AA] rounded-lg hover:bg-[#1a9490] transition"
        >
          + Schedule Meeting
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <TextInput
          type="text"
          placeholder="Search meetings by title or host..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 border-b border-[#E5E5E5]">
        {(['all', 'upcoming', 'today', 'past'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
              filterTab === tab
                ? 'border-[#20B2AA] text-[#20B2AA]'
                : 'border-transparent text-[#666666] hover:text-[#3C3C3C]'
            }`}
          >
            {tab === 'all'
              ? 'All'
              : tab === 'today'
              ? 'Today'
              : tab === 'upcoming'
              ? 'Upcoming'
              : 'Past'}
          </button>
        ))}
      </div>

      {/* Results count */}
      {filteredMeetings.length > 0 && (
        <p className="text-sm text-[#666666] mb-6">
          Showing {filteredMeetings.length} of {displayMeetings.length} meetings
        </p>
      )}

      {/* Meetings Grid */}
      {filteredMeetings.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No meetings found"
          description={
            searchTerm
              ? "Try adjusting your search terms"
              : "No meetings scheduled yet"
          }
          actionLabel="Schedule a Meeting"
          onAction={onCreateMeeting}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onJoin={onJoinMeeting}
              onEdit={onEditMeeting}
              onDelete={onDeleteMeeting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
