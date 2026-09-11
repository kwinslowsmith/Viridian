'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardBody } from './Card';
import { Badge } from './Badge';

interface DiscussionThreadProps {
  id: string;
  communitySlug: string;
  title: string;
  startedBy?: string;
  replyCount?: number;
  isPinned?: boolean;
  lastActivityDate?: string;
}

export const DiscussionThread: React.FC<DiscussionThreadProps> = ({
  id,
  communitySlug,
  title,
  startedBy,
  replyCount = 0,
  isPinned = false,
  lastActivityDate,
}) => {
  return (
    <Link href={`/polymath/communities/${communitySlug}/discussions/${id}`}>
      <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
        <CardBody className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-[#3C3C3C] line-clamp-2 flex-1">
              {title}
            </h3>
            {isPinned && <Badge variant="warning">📌 Pinned</Badge>}
          </div>

          {/* Footer */}
          <div className="text-xs text-[#999999] pt-2 border-t border-[#E5E5E5] flex justify-between">
            <span>{startedBy && `Started by ${startedBy}`}</span>
            <span>💬 {replyCount} replies</span>
          </div>

          {lastActivityDate && (
            <p className="text-xs text-[#999999]">
              Last activity: {new Date(lastActivityDate).toLocaleDateString()}
            </p>
          )}
        </CardBody>
      </Card>
    </Link>
  );
};
