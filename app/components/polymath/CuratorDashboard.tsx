'use client';

import React, { useState } from 'react';
import { Card, CardBody } from './index';

interface CuratorDashboardProps {
  communityName?: string;
  stats?: {
    members: number;
    membersTrend: number;
    discussions: number;
    discussionsTrend: number;
    messages: number;
    messagesTrend: number;
    upcomingMeetings: number;
    nextMeeting?: { title: string; date: string; time: string };
  };
  topContributors?: Array<{
    rank: number;
    name: string;
    messages: number;
  }>;
  recentActivity?: Array<{
    type: 'member_joined' | 'discussion_created' | 'meeting_scheduled' | 'milestone';
    description: string;
    timestamp: string;
  }>;
}

const MOCK_STATS = {
  members: 127,
  membersTrend: 5,
  discussions: 45,
  discussionsTrend: 12,
  messages: 1247,
  messagesTrend: 200,
  upcomingMeetings: 8,
  nextMeeting: { title: 'Team Sync', date: '2026-10-10', time: '14:30' },
};

const MOCK_TOP_CONTRIBUTORS = [
  { rank: 1, name: 'Sarah M', messages: 247 },
  { rank: 2, name: 'John D', messages: 189 },
  { rank: 3, name: 'Lisa T', messages: 156 },
  { rank: 4, name: 'Mike B', messages: 134 },
  { rank: 5, name: 'Emma J', messages: 112 },
];

const MOCK_RECENT_ACTIVITY = [
  {
    type: 'member_joined' as const,
    description: 'New member joined: Alex K',
    timestamp: '2h ago',
  },
  {
    type: 'discussion_created' as const,
    description: 'New discussion: Q4 Planning',
    timestamp: '4h ago',
  },
  {
    type: 'meeting_scheduled' as const,
    description: 'New meeting: Team Sync',
    timestamp: '1d ago',
  },
  {
    type: 'member_joined' as const,
    description: 'New member joined: Jordan S',
    timestamp: '2d ago',
  },
  {
    type: 'discussion_created' as const,
    description: 'New discussion: Best Practices',
    timestamp: '3d ago',
  },
  {
    type: 'meeting_scheduled' as const,
    description: 'New meeting: Resource Sharing',
    timestamp: '5d ago',
  },
  {
    type: 'milestone' as const,
    description: 'Community reached 100 members!',
    timestamp: '1w ago',
  },
  {
    type: 'discussion_created' as const,
    description: 'New discussion: Standards Alignment',
    timestamp: '1w ago',
  },
  {
    type: 'member_joined' as const,
    description: 'New member joined: Casey T',
    timestamp: '1w ago',
  },
  {
    type: 'meeting_scheduled' as const,
    description: 'New meeting: Curriculum Review',
    timestamp: '2w ago',
  },
];

export function CuratorDashboard({
  communityName = 'Community Dashboard',
  stats = MOCK_STATS,
  topContributors = MOCK_TOP_CONTRIBUTORS,
  recentActivity = MOCK_RECENT_ACTIVITY,
}: CuratorDashboardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-[#999999]';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'member_joined':
        return '✨';
      case 'discussion_created':
        return '💬';
      case 'meeting_scheduled':
        return '📅';
      case 'milestone':
        return '🎉';
      default:
        return '📌';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#3C3C3C] mb-2">
          {communityName}
        </h1>
        <p className="text-[#666666]">
          Community engagement and impact overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Members */}
        <Card>
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-2">Total Members</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#20B2AA]">
                    {stats.members}
                  </span>
                  <span className={`text-sm font-medium ${getTrendColor(stats.membersTrend)}`}>
                    {stats.membersTrend > 0 ? '↑' : '↓'} {Math.abs(stats.membersTrend)} this month
                  </span>
                </div>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </CardBody>
        </Card>

        {/* Discussions */}
        <Card>
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-2">Total Discussions</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#20B2AA]">
                    {stats.discussions}
                  </span>
                  <span className={`text-sm font-medium ${getTrendColor(stats.discussionsTrend)}`}>
                    {stats.discussionsTrend > 0 ? '↑' : '↓'} {Math.abs(stats.discussionsTrend)} this month
                  </span>
                </div>
              </div>
              <div className="text-3xl">💬</div>
            </div>
          </CardBody>
        </Card>

        {/* Messages */}
        <Card>
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-2">Total Messages</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#20B2AA]">
                    {formatNumber(stats.messages)}
                  </span>
                  <span className={`text-sm font-medium ${getTrendColor(stats.messagesTrend)}`}>
                    {stats.messagesTrend > 0 ? '↑' : '↓'} {Math.abs(stats.messagesTrend)} this month
                  </span>
                </div>
              </div>
              <div className="text-3xl">✉️</div>
            </div>
          </CardBody>
        </Card>

        {/* Meetings */}
        <Card>
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-2">Upcoming Meetings</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#20B2AA]">
                    {stats.upcomingMeetings}
                  </span>
                  {stats.nextMeeting && (
                    <span className="text-xs text-[#999999]">
                      Next: {stats.nextMeeting.date}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Top Contributors */}
      <Card className="mb-8">
        <CardBody>
          <h2 className="text-lg font-bold text-[#3C3C3C] mb-6">
            Top Contributors
          </h2>

          <div className="space-y-3">
            {topContributors.map((contributor) => (
              <div
                key={contributor.rank}
                className="flex items-center justify-between p-3 bg-[#F9F9F9] rounded hover:bg-[#F5F5F5] transition cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-8 h-8 rounded-full bg-[#20B2AA] text-white flex items-center justify-center text-sm font-bold">
                    {contributor.rank}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#3C3C3C]">
                      {contributor.name}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-[#20B2AA]">
                    {contributor.messages}
                  </p>
                  <p className="text-xs text-[#999999]">messages</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardBody>
          <h2 className="text-lg font-bold text-[#3C3C3C] mb-6">
            Recent Activity
          </h2>

          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 border-l-2 border-[#20B2AA]"
              >
                <span className="text-xl">{getActivityIcon(activity.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#3C3C3C]">
                    {activity.description}
                  </p>
                  <p className="text-xs text-[#999999] mt-1">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
