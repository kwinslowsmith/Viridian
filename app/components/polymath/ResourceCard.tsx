'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardBody } from './Card';
import { Badge } from './Badge';

type ResourceType = 'lesson' | 'material' | 'article' | 'video' | 'rubric';

interface ResourceCardProps {
  id: string;
  communitySlug: string;
  title: string;
  type: ResourceType;
  description?: string;
  uploaderName?: string;
  uploadDate?: string;
}

const typeIcons: Record<ResourceType, string> = {
  lesson: '📖',
  material: '📄',
  article: '📝',
  video: '🎥',
  rubric: '✅',
};

export const ResourceCard: React.FC<ResourceCardProps> = ({
  id,
  communitySlug,
  title,
  type,
  description,
  uploaderName,
  uploadDate,
}) => {
  return (
    <Link href={`/polymath/communities/${communitySlug}/resources/${id}`}>
      <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
        <CardBody className="flex flex-col gap-3">
          {/* Icon & Badge */}
          <div className="flex items-center justify-between">
            <span className="text-2xl">{typeIcons[type]}</span>
            <Badge variant="info">{type}</Badge>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-[#3C3C3C] line-clamp-2">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-sm text-[#666666] line-clamp-2">
              {description}
            </p>
          )}

          {/* Footer */}
          <div className="text-xs text-[#999999] pt-2 border-t border-[#E5E5E5]">
            {uploaderName && <p>By {uploaderName}</p>}
            {uploadDate && <p>{new Date(uploadDate).toLocaleDateString()}</p>}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
};
