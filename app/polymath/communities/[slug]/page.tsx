'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardBody, Button, LoadingState, Tabs } from '@/app/components/polymath';

interface Community {
  id: string;
  slug: string;
  name: string;
  description?: string;
  memberCount?: number;
  role?: 'curator' | 'member';
}

interface TabContent {
  resources: number;
  discussions: number;
  meetings: number;
  members: Array<{ id: string; name: string; role: string }>;
}

export default function CommunityPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchCommunity();
    }
  }, [slug]);

  const fetchCommunity = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/communities/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setCommunity(data.community);
      }
    } catch (error) {
      console.error('Failed to fetch community:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading community..." />;
  }

  if (!community) {
    return (
      <div className="text-center py-12">
        <p className="text-[#666666]">Community not found</p>
      </div>
    );
  }

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div>
          <h2 className="text-2xl font-bold text-[#3C3C3C] mb-4">Overview</h2>
          <Card>
            <CardBody>
              <p className="text-[#666666]">{community.description}</p>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#20B2AA]">
                    {community.memberCount || 0}
                  </div>
                  <div className="text-sm text-[#666666]">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#20B2AA]">0</div>
                  <div className="text-sm text-[#666666]">Resources</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#20B2AA]">0</div>
                  <div className="text-sm text-[#666666]">Discussions</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      ),
    },
    {
      id: 'resources',
      label: 'Resources',
      content: (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#3C3C3C]">Resources</h2>
            {community.role === 'curator' && (
              <Button>+ Upload Resource</Button>
            )}
          </div>
          <p className="text-[#666666]">No resources yet</p>
        </div>
      ),
    },
    {
      id: 'discussions',
      label: 'Discussions',
      content: (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#3C3C3C]">Discussions</h2>
            <Button>+ Start Discussion</Button>
          </div>
          <p className="text-[#666666]">No discussions yet</p>
        </div>
      ),
    },
    {
      id: 'meetings',
      label: 'Meetings',
      content: (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#3C3C3C]">Meetings</h2>
            {community.role === 'curator' && (
              <Button>+ Schedule Meeting</Button>
            )}
          </div>
          <p className="text-[#666666]">No meetings scheduled</p>
        </div>
      ),
    },
    {
      id: 'members',
      label: 'Members',
      content: (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#3C3C3C]">Members</h2>
            {community.role === 'curator' && (
              <Button>+ Invite Member</Button>
            )}
          </div>
          <p className="text-[#666666]">Loading members...</p>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Community Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#3C3C3C] mb-2">
          {community.name}
        </h1>
        {community.role === 'curator' && (
          <span className="inline-block px-3 py-1 bg-[#20B2AA]/20 text-[#20B2AA] text-sm font-medium rounded-full">
            Curator
          </span>
        )}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTabId="overview" />
    </div>
  );
}
