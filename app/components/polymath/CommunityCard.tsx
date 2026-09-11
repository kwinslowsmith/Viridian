'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardBody } from './Card';
import { Badge } from './Badge';
import { colors } from '@/app/design/colors';

interface CommunityCardProps {
  id: string;
  slug: string;
  name: string;
  description?: string;
  memberCount?: number;
  role?: 'curator' | 'member';
  recentActivityCount?: number;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({
  id,
  slug,
  name,
  description,
  memberCount = 0,
  role = 'member',
  recentActivityCount = 0,
}) => {
  return (
    <Link href={`/polymath/communities/${slug}`}>
      <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
        <CardBody className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-[#3C3C3C] line-clamp-2">
              {name}
            </h3>
            {role === 'curator' && (
              <Badge variant="primary">Curator</Badge>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-[#666666] line-clamp-3">
              {description}
            </p>
          )}

          {/* Stats */}
          <div className="flex gap-4 text-xs text-[#999999] pt-2 border-t border-[#E5E5E5]">
            <span>👥 {memberCount} members</span>
            {recentActivityCount > 0 && (
              <span>📌 {recentActivityCount} recent</span>
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
};
