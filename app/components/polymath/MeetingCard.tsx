'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardBody } from './Card';
import { Badge } from './Badge';

interface MeetingCardProps {
  id: string;
  communitySlug: string;
  title: string;
  dateTime: string;
  host?: string;
  status?: 'upcoming' | 'past' | 'ongoing';
  zoomUrl?: string;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  id,
  communitySlug,
  title,
  dateTime,
  host,
  status = 'upcoming',
  zoomUrl,
}) => {
  const statusColors: Record<string, 'info' | 'success' | 'warning'> = {
    upcoming: 'info',
    past: 'warning',
    ongoing: 'success',
  };

  const date = new Date(dateTime);
  const formattedDate = date.toLocaleDateString();
  const formattedTime = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link href={`/polymath/communities/${communitySlug}/meetings/${id}`}>
      <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
        <CardBody className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-[#3C3C3C] line-clamp-2">
              {title}
            </h3>
            <Badge variant={statusColors[status]}>
              {status === 'upcoming' && '📅 Upcoming'}
              {status === 'past' && '✓ Past'}
              {status === 'ongoing' && '🔴 Live'}
            </Badge>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-2 text-sm text-[#666666]">
            <span>🕐</span>
            <span>
              {formattedDate} at {formattedTime}
            </span>
          </div>

          {/* Host & Zoom Link */}
          <div className="text-xs text-[#999999] pt-2 border-t border-[#E5E5E5]">
            {host && <p>Hosted by {host}</p>}
            {zoomUrl && (
              <p className="text-[#20B2AA] hover:underline">
                Join via Zoom
              </p>
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
};
