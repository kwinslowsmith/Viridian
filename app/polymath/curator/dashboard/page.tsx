'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CuratorDashboard, LoadingState } from '@/app/components/polymath';

function CuratorDashboardContent() {
  const searchParams = useSearchParams();
  const communitySlug = searchParams.get('community') || 'default-community';

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [communitySlug]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/communities/${communitySlug}/stats`);

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();

      // Transform API response to match component interface
      const statsData = {
        members: data.stats.memberCount,
        membersTrend: Math.floor(Math.random() * 10) - 5, // Mock trend
        discussions: data.stats.discussionCount,
        discussionsTrend: Math.floor(Math.random() * 15) - 5, // Mock trend
        messages: data.stats.messageCount,
        messagesTrend: data.engagement.thisMonthMessages - data.engagement.lastMonthMessages,
        upcomingMeetings: data.stats.upcomingMeetingCount,
        nextMeeting: undefined,
      };

      const topContributors = data.topContributors.slice(0, 5).map((tc: any, idx: number) => ({
        rank: idx + 1,
        name: tc.user?.name || 'Unknown',
        messages: tc.messageCount,
      }));

      const recentActivity = [
        ...data.recentMembers.map((m: any) => ({
          type: 'member_joined' as const,
          description: `New member joined: ${m.user?.name}`,
          timestamp: new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        })),
        ...data.recentDiscussions.map((d: any) => ({
          type: 'discussion_created' as const,
          description: `New discussion: ${d.title}`,
          timestamp: new Date(d.lastMessageAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        })),
      ].slice(0, 10);

      setStats({
        stats: statsData,
        topContributors,
        recentActivity,
        communityName: data.community.name,
      });
    } catch (error) {
      console.error('Failed to fetch curator stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading curator dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] py-8 px-4">
      <CuratorDashboard
        communityName={stats?.communityName || 'Community Dashboard'}
        stats={stats?.stats}
        topContributors={stats?.topContributors}
        recentActivity={stats?.recentActivity}
      />
    </div>
  );
}

export default function CuratorDashboardPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading curator dashboard..." />}>
      <CuratorDashboardContent />
    </Suspense>
  );
}
