'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, Button, LoadingState } from '@/app/components/polymath';

interface Attendee {
  id: string;
  name: string;
  avatar?: string;
}

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  zoomUrl?: string;
  host: { name: string; avatar?: string };
  attendees: Attendee[];
  attendeeCount: number;
  status: 'upcoming' | 'today' | 'past';
}

const MOCK_MEETING: Meeting = {
  id: '1',
  title: 'Team Sync Meeting',
  description:
    'Quarterly sync to discuss standards alignment, curriculum updates, and community initiatives. Please come prepared with updates from your school.',
  date: '2026-10-10',
  time: '14:30',
  location: 'Conference Room A',
  zoomUrl: 'https://zoom.us/j/123456789',
  host: { name: 'Kyle Winslow Smith' },
  attendees: [
    { id: '1', name: 'Sarah Martinez' },
    { id: '2', name: 'John Davis' },
    { id: '3', name: 'Lisa Thompson' },
    { id: '4', name: 'Mike Brown' },
    { id: '5', name: 'Emma Johnson' },
    { id: '6', name: 'Alex Kim' },
    { id: '7', name: 'Jordan Lee' },
    { id: '8', name: 'Casey Wilson' },
    { id: '9', name: 'Morgan Clark' },
    { id: '10', name: 'Taylor Anderson' },
    { id: '11', name: 'Riley Martinez' },
    { id: '12', name: 'River Taylor' },
  ],
  attendeeCount: 12,
  status: 'upcoming',
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'upcoming':
      return 'bg-[#DBEAFE] text-[#1E40AF]';
    case 'today':
      return 'bg-[#FEF3C7] text-[#92400E]';
    case 'past':
      return 'bg-[#F3F4F6] text-[#4B5563]';
    default:
      return 'bg-[#F3F4F6] text-[#4B5563]';
  }
};

const getStatusLabel = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDateTime = (date: string, time: string) => {
  const dateObj = new Date(`${date}T${time}`);
  return dateObj.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;

  // Mock: would fetch from API
  const [meeting] = useState<Meeting>(MOCK_MEETING);
  const [loading] = useState(false);

  if (loading) {
    return <LoadingState message="Loading meeting details..." />;
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-sm font-medium text-[#20B2AA] hover:underline"
        >
          ← Back to Meetings
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-[#3C3C3C] mb-2">
                {meeting.title}
              </h1>
              <p className="text-lg text-[#666666]">
                {formatDateTime(meeting.date, meeting.time)}
              </p>
            </div>
            <span
              className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(meeting.status)}`}
            >
              {getStatusLabel(meeting.status)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {meeting.status !== 'past' && meeting.zoomUrl && (
              <a
                href={meeting.zoomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 text-sm font-medium text-white bg-[#20B2AA] rounded-lg hover:bg-[#1a9490] transition"
              >
                Join Meeting
              </a>
            )}
            {meeting.status !== 'past' && (
              <Button variant="secondary">Edit Meeting</Button>
            )}
            <button className="px-6 py-2.5 text-sm font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition">
              Delete
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardBody>
                <h2 className="text-lg font-bold text-[#3C3C3C] mb-4">
                  About this Meeting
                </h2>
                <p className="text-sm text-[#666666] leading-relaxed">
                  {meeting.description}
                </p>
              </CardBody>
            </Card>

            {/* Details */}
            <Card>
              <CardBody>
                <h2 className="text-lg font-bold text-[#3C3C3C] mb-4">
                  Meeting Details
                </h2>

                <div className="space-y-4">
                  {/* Location */}
                  <div>
                    <p className="text-xs text-[#999999] uppercase font-medium mb-1">
                      Location
                    </p>
                    <p className="text-sm text-[#3C3C3C]">
                      📍 {meeting.location || 'TBD'}
                    </p>
                  </div>

                  {/* Zoom Link */}
                  {meeting.zoomUrl && (
                    <div>
                      <p className="text-xs text-[#999999] uppercase font-medium mb-1">
                        Video Conference
                      </p>
                      <a
                        href={meeting.zoomUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#20B2AA] hover:underline"
                      >
                        🌐 {meeting.zoomUrl.replace('https://', '').substring(0, 50)}...
                      </a>
                    </div>
                  )}

                  {/* Host */}
                  <div>
                    <p className="text-xs text-[#999999] uppercase font-medium mb-2">
                      Hosted By
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#20B2AA] text-white flex items-center justify-center text-sm font-bold">
                        {getInitials(meeting.host.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#3C3C3C]">
                          {meeting.host.name}
                        </p>
                        <p className="text-xs text-[#999999]">Organizer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Attendees */}
            <Card>
              <CardBody>
                <h2 className="text-lg font-bold text-[#3C3C3C] mb-4">
                  Attendees ({meeting.attendeeCount})
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {meeting.attendees.map((attendee) => (
                    <div key={attendee.id} className="text-center">
                      <div className="w-12 h-12 rounded-full bg-[#20B2AA]/20 text-[#20B2AA] flex items-center justify-center text-sm font-bold mx-auto mb-2">
                        {getInitials(attendee.name)}
                      </div>
                      <p className="text-xs font-medium text-[#3C3C3C] text-center break-words">
                        {attendee.name}
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div>
            <Card>
              <CardBody>
                <h3 className="text-lg font-bold text-[#3C3C3C] mb-4">
                  Quick Info
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[#999999] uppercase font-medium mb-1">
                      Status
                    </p>
                    <p className="text-sm font-medium text-[#3C3C3C]">
                      {getStatusLabel(meeting.status)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#999999] uppercase font-medium mb-1">
                      Attendees
                    </p>
                    <p className="text-sm font-medium text-[#3C3C3C]">
                      {meeting.attendeeCount} people
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E5E5E5]">
                    <p className="text-xs text-[#999999] uppercase font-medium mb-3">
                      Meeting Type
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 py-1 text-xs font-medium bg-[#20B2AA]/10 text-[#20B2AA] rounded">
                        Community
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-[#20B2AA]/10 text-[#20B2AA] rounded">
                        Sync
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
