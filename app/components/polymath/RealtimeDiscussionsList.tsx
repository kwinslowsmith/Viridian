'use client';

import React from 'react';
import Link from 'next/link';
import { useRealtimeDiscussions } from '@/hooks/useRealtimeSubscriptions';

interface RealtimeDiscussionsListProps {
  communitySlug: string;
  onDiscussionSelected?: (discussionId: string) => void;
  className?: string;
}

export function RealtimeDiscussionsList({
  communitySlug,
  onDiscussionSelected,
  className,
}: RealtimeDiscussionsListProps) {
  const { discussions, loading, error } = useRealtimeDiscussions(
    communitySlug,
    (discussion) => {
      console.log('New discussion created:', discussion);
    }
  );

  if (loading && discussions.length === 0) {
    return (
      <div className={className} style={{ padding: '16px', color: '#666' }}>
        Loading discussions...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={className}
        style={{
          padding: '12px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#7f1d1d',
          fontSize: '14px',
        }}
      >
        Error: {error}
      </div>
    );
  }

  if (discussions.length === 0) {
    return (
      <div className={className} style={{ padding: '16px', color: '#999', textAlign: 'center' }}>
        No discussions yet
      </div>
    );
  }

  return (
    <div className={className}>
      {discussions.map((discussion) => (
        <DiscussionItem
          key={discussion.id}
          discussion={discussion}
          communitySlug={communitySlug}
          onSelect={onDiscussionSelected}
        />
      ))}
    </div>
  );
}

// Individual discussion item
function DiscussionItem({
  discussion,
  communitySlug,
  onSelect,
}: {
  discussion: any;
  communitySlug: string;
  onSelect?: (id: string) => void;
}) {
  const href = `/polymath/communities/${communitySlug}/discussions/${discussion.id}`;

  const handleClick = () => {
    onSelect?.(discussion.id);
  };

  return (
    <Link href={href}>
      <div
        onClick={handleClick}
        style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
          }}
        >
          {discussion.title}
        </h3>

        {discussion.content && (
          <p
            style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              color: '#6b7280',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {discussion.content}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            gap: '16px',
            fontSize: '12px',
            color: '#9ca3af',
          }}
        >
          {discussion.author?.name && (
            <span>By {discussion.author.name}</span>
          )}
          {discussion.messageCount && (
            <span>💬 {discussion.messageCount} messages</span>
          )}
          {discussion.createdAt && (
            <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
