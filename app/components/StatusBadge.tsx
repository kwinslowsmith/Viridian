'use client';

import React from 'react';

type StatusType = 'published' | 'pending_approval' | 'rejected' | 'draft';
type AuthorType = 'individual' | 'organization' | 'community' | 'event';
type VisibilityType = 'public' | 'organization' | 'community' | 'class' | 'private';

interface StatusBadgeProps {
  status?: StatusType;
  visibility?: VisibilityType;
  authorType?: AuthorType;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  visibility,
  authorType,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const statusConfig: Record<StatusType, { bg: string; text: string; icon: string }> = {
    published: { bg: 'bg-green-100', text: 'text-green-700', icon: '✓' },
    pending_approval: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '⏳' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: '✗' },
    draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: '📝' },
  };

  const authorTypeConfig: Record<AuthorType, { bg: string; text: string; icon: string; label: string }> = {
    individual: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '👤', label: 'Personal' },
    organization: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🏢', label: 'Organization' },
    community: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: '📚', label: 'Community' },
    event: { bg: 'bg-pink-100', text: 'text-pink-700', icon: '📅', label: 'Event' },
  };

  const visibilityConfig: Record<VisibilityType, { bg: string; text: string; icon: string; label: string }> = {
    public: { bg: 'bg-cyan-100', text: 'text-cyan-700', icon: '🌍', label: 'Public' },
    organization: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🏢', label: 'Org Only' },
    community: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: '📚', label: 'Community' },
    class: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '🏫', label: 'Class' },
    private: { bg: 'bg-gray-100', text: 'text-gray-700', icon: '🔒', label: 'Private' },
  };

  return (
    <div className="flex flex-wrap gap-2">
      {status && (
        <div
          className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]} ${statusConfig[status].bg} ${statusConfig[status].text}`}
        >
          <span>{statusConfig[status].icon}</span>
          <span className="capitalize">{status.replace('_', ' ')}</span>
        </div>
      )}

      {authorType && (
        <div
          className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]} ${authorTypeConfig[authorType].bg} ${authorTypeConfig[authorType].text}`}
        >
          <span>{authorTypeConfig[authorType].icon}</span>
          <span>{authorTypeConfig[authorType].label}</span>
        </div>
      )}

      {visibility && (
        <div
          className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]} ${visibilityConfig[visibility].bg} ${visibilityConfig[visibility].text}`}
        >
          <span>{visibilityConfig[visibility].icon}</span>
          <span>{visibilityConfig[visibility].label}</span>
        </div>
      )}
    </div>
  );
};
