'use client';

import React from 'react';
import {
  useRealtimeCommunityMembers,
  useRealtimeCommunityStats,
} from '@/hooks/useRealtimeSubscriptions';

interface RealtimeMemberCountProps {
  communitySlug: string;
  className?: string;
  onMemberJoined?: (member: any) => void;
  onMemberLeft?: (memberId: string) => void;
}

export function RealtimeMemberCount({
  communitySlug,
  className,
  onMemberJoined,
  onMemberLeft,
}: RealtimeMemberCountProps) {
  const { memberCount, loading, error } = useRealtimeCommunityMembers(
    communitySlug,
    onMemberJoined,
    onMemberLeft
  );

  if (loading) {
    return <div className={className}>Loading...</div>;
  }

  if (error) {
    return <div className={className} style={{ color: '#7f1d1d' }}>Error</div>;
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#3b82f6',
      }}
    >
      <span style={{ fontSize: '16px' }}>👥</span>
      <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
    </div>
  );
}

interface RealtimeStatsCardProps {
  communitySlug: string;
  className?: string;
}

export function RealtimeStatsCard({ communitySlug, className }: RealtimeStatsCardProps) {
  const { stats, loading, error } = useRealtimeCommunityStats(communitySlug);

  if (loading && !stats) {
    return (
      <div
        className={className}
        style={{
          padding: '16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          color: '#666',
        }}
      >
        Loading stats...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={className}
        style={{
          padding: '16px',
          backgroundColor: '#fee2e2',
          borderRadius: '8px',
          color: '#7f1d1d',
          fontSize: '14px',
        }}
      >
        Error loading stats
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statItems = [
    { icon: '👥', label: 'Members', value: stats.memberCount },
    { icon: '💬', label: 'Discussions', value: stats.discussionCount },
    { icon: '💭', label: 'Messages', value: stats.messageCount },
    { icon: '📅', label: 'Meetings', value: stats.meetingCount },
    { icon: '📚', label: 'Resources', value: stats.resourceCount },
  ];

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
      }}
    >
      {statItems.map((item) => (
        <div
          key={item.label}
          style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '4px',
            }}
          >
            {item.value}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}
