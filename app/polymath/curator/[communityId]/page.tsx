'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardBody, LoadingState, Button } from '@/app/components/polymath';
import { Badge } from '@/app/components/polymath/Badge';

interface CuratorStats {
  memberCount: number;
  activeDiscussions: number;
  resourcesShared: number;
  meetingsThisMonth: number;
  pendingApprovals: number;
}

interface CommunityImpact {
  resourcesBuilt: number;
  facilitatedDiscussions: number;
  hostedMeetings: number;
  communityMembers: number;
}

export default function CuratorDashboardPage() {
  const params = useParams();
  const communityId = params.communityId as string;
  const [stats, setStats] = useState<CuratorStats | null>(null);
  const [impact, setImpact] = useState<CommunityImpact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (communityId) {
      fetchCuratorData();
    }
  }, [communityId]);

  const fetchCuratorData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/communities/${communityId}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setImpact(data.impact);
      }
    } catch (error) {
      console.error('Failed to fetch curator data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading curator dashboard..." />;
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-[#666666]">Failed to load curator dashboard</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-[#3C3C3C] mb-2">
          Curator Dashboard
        </h1>
        <p className="text-[#666666]">
          Monitor and manage your community
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-[#20B2AA] mb-2">
              {stats.memberCount}
            </div>
            <div className="text-sm text-[#666666]">Community Members</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-[#20B2AA] mb-2">
              {stats.resourcesShared}
            </div>
            <div className="text-sm text-[#666666]">Resources Shared</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-[#20B2AA] mb-2">
              {stats.activeDiscussions}
            </div>
            <div className="text-sm text-[#666666]">Active Discussions</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-[#20B2AA] mb-2">
              {stats.meetingsThisMonth}
            </div>
            <div className="text-sm text-[#666666]">Meetings This Month</div>
          </CardBody>
        </Card>
      </div>

      {/* Pending Actions */}
      {stats.pendingApprovals > 0 && (
        <div className="mb-12">
          <Card className="bg-yellow-50 border-2 border-yellow-200">
            <CardBody>
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">
                📋 Pending Actions
              </h2>
              <p className="text-yellow-800 mb-4">
                You have {stats.pendingApprovals} pending member approval(s)
              </p>
              <Button variant="secondary">Review Approvals</Button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Community Impact */}
      {impact && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#3C3C3C] mb-6">
            Community Impact
          </h2>
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-lg text-[#666666] mb-8">
                Your community has built{' '}
                <strong className="text-[#20B2AA]">{impact.resourcesBuilt}</strong> resources,
                facilitated{' '}
                <strong className="text-[#20B2AA]">{impact.facilitatedDiscussions}</strong> discussions,
                and hosted{' '}
                <strong className="text-[#20B2AA]">{impact.hostedMeetings}</strong> meetings with{' '}
                <strong className="text-[#20B2AA]">{impact.communityMembers}</strong> members.
              </p>
              <Button variant="secondary">Export Impact Report</Button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody className="text-center">
            <h3 className="text-lg font-semibold text-[#3C3C3C] mb-4">
              🛠️ Community Settings
            </h3>
            <Button variant="secondary" className="w-full">
              Configure
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <h3 className="text-lg font-semibold text-[#3C3C3C] mb-4">
              📊 View Analytics
            </h3>
            <Button variant="secondary" className="w-full">
              Analytics
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <h3 className="text-lg font-semibold text-[#3C3C3C] mb-4">
              📧 Send Announcement
            </h3>
            <Button variant="secondary" className="w-full">
              Announce
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
