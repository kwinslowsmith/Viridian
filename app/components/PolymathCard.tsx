'use client';

import React from 'react';
import { PolymathButton } from './PolymathButton';

type CardType = 'expertise' | 'tool' | 'resource' | 'spotlight';

interface PolymathCardProps {
  type: CardType;
  title: string;
  description?: string;
  author?: string;
  readTime?: string;
  emoji?: string;
  image?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  onClick?: () => void;
  isSaved?: boolean;
  metadata?: string;
}

export const PolymathCard: React.FC<PolymathCardProps> = ({
  type,
  title,
  description,
  author,
  readTime,
  emoji = '📚',
  ctaText = 'Read Article',
  onCtaClick,
  onClick,
  isSaved = false,
  metadata,
}) => {
  const badgeColors: Record<CardType, { bg: string; text: string }> = {
    expertise: { bg: 'bg-[#8B3A3A]/20', text: 'text-[#8B3A3A]' },
    tool: { bg: 'bg-[#9CAF88]/20', text: 'text-[#9CAF88]' },
    resource: { bg: 'bg-[#D4A574]/20', text: 'text-[#D4A574]' },
    spotlight: { bg: 'bg-[#D4A574]/20', text: 'text-[#D4A574]' },
  };

  const badgeLabel = type.toUpperCase();
  const colors = badgeColors[type];

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#B8A899]/20 rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer ${
        isSaved ? 'border-[#8B3A3A] border-2 bg-[#D4A574]/10' : ''
      }`}
    >
      {/* Image Area */}
      <div className="h-40 bg-gradient-to-br from-[#D4A574] to-[#8B3A3A]/20 flex items-center justify-center relative">
        <span className="text-5xl">{emoji}</span>
        {isSaved && (
          <div className="absolute top-3 right-3 bg-[#8B3A3A] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
            ✓
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Badge */}
        <div className={`inline-flex items-center gap-1 mb-3 w-fit`}>
          <span className={`text-xs font-semibold uppercase tracking-wider ${colors.bg} px-2 py-1 rounded ${colors.text}`}>
            {badgeLabel}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[#3C3C3C] mb-2 line-clamp-2">{title}</h3>

        {/* Description */}
        {description && (
          <p className="text-xs text-[#B8A899] line-clamp-2 mb-3">{description}</p>
        )}

        {/* Metadata */}
        {(author || readTime || metadata) && (
          <p className="text-xs text-[#B8A899]/70 mb-auto">
            {metadata || `${author || ''}${author && readTime ? ' | ' : ''}${readTime || ''}`}
          </p>
        )}

        {/* CTA Button */}
        <PolymathButton
          variant="primary"
          size="sm"
          isFullWidth
          onClick={(e) => {
            e.stopPropagation();
            onCtaClick?.();
          }}
          className="mt-4"
        >
          {ctaText}
        </PolymathButton>
      </div>
    </div>
  );
};
