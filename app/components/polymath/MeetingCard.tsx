'use client';

import React from 'react';
import { Card, CardBody } from './index';

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

interface MeetingCardProps {
  meeting: Meeting;
  onJoin?: (meetingId: string) => void;
  onEdit?: (meetingId: string) => void;
  onDelete?: (meetingId: string) => void;
}

export function MeetingCard({
  meeting,
  onJoin,
  onEdit,
  onDelete,
}: MeetingCardProps) {
  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short',
    });
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

  const getHostInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  const location = meeting.location || (meeting.zoomUrl ? 'Zoom' : 'TBD');
  const locationDisplay = meeting.zoomUrl
    ? meeting.zoomUrl.replace('https://', '').substring(0, 30) + '...'
    : meeting.location;

  return (
    <Card className="hover:shadow-md transition">
      <CardBody>
        {/* Header with date and status */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-[#666666]">
            {formatDateTime(meeting.date, meeting.time)}
          </div>
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}
          >
            {getStatusLabel(meeting.status)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[#3C3C3C] mb-2">
          {meeting.title}
        </h3>

        {/* Location */}
        <p className="text-sm text-[#666666] mb-4">
          {location && (
            <>
              {location === 'Zoom' ? '🌐' : '📍'} {locationDisplay}
            </>
          )}
        </p>

        {/* Host and attendees */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#20B2AA] text-white flex items-center justify-center text-xs font-bold">
              {getHostInitials(meeting.host.name)}
            </div>
            <div className="text-sm">
              <div className="text-[#3C3C3C] font-medium">
                {meeting.host.name}
              </div>
              <div className="text-xs text-[#999999]">Host</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium text-[#3C3C3C]">
              {meeting.attendeeCount}
            </div>
            <div className="text-xs text-[#999999]">attending</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-4 border-t border-[#E5E5E5]">
          {meeting.status !== 'past' && (
            <button
              onClick={() => onJoin?.(meeting.id)}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-[#20B2AA] rounded hover:bg-[#1a9490] transition"
            >
              Join Meeting
            </button>
          )}

          {meeting.status !== 'past' && (
            <button
              onClick={() => onEdit?.(meeting.id)}
              className="px-3 py-2 text-sm font-medium text-[#20B2AA] border border-[#20B2AA] rounded hover:bg-[#20B2AA]/10 transition"
            >
              Edit
            </button>
          )}

          <button
            onClick={() => onDelete?.(meeting.id)}
            className="px-3 py-2 text-sm font-medium text-red-500 border border-red-200 rounded hover:bg-red-50 transition"
          >
            Delete
          </button>
        </div>
      </CardBody>
    </Card>
  );
}
