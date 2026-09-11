'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardBody, Button, LoadingState, EmptyState } from '@/app/components/polymath';
import { CommunityCard } from '@/app/components/polymath/CommunityCard';

interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string;
  memberCount?: number;
  role?: 'curator' | 'member';
}

interface Activity {
  id: string;
  type: 'resource' | 'discussion' | 'meeting';
  title: string;
  community: string;
  timestamp: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const communitiesRes = await fetch('/api/communities/my');
      if (communitiesRes.ok) {
        const data = await communitiesRes.json();
        setCommunities(data.communities || []);
      }
      setActivities([]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#3C3C3C] mb-2">
          Welcome, {session?.user?.name || 'Educator'}
        </h1>
        <p className="text-[#666666]">
          Collaborate with educators and build equitable curricula
        </p>
      </div>

      <div className="mb-8 flex gap-4 flex-wrap">
        <Link href="/polymath/communities/create">
          <Button>+ Create Community</Button>
        </Link>
        <Link href="/polymath/communities">
          <Button variant="secondary">Browse Communities</Button>
        </Link>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#3C3C3C]">My Communities</h2>
          {communities.length > 0 && (
            <Link href="/polymath/communities" className="text-[#20B2AA] hover:underline text-sm">
              View all
            </Link>
          )}
        </div>

        {communities.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No communities yet"
            description="Join a community to start collaborating with other educators"
            actionLabel="Browse Communities"
            onAction={() => (window.location.href = '/polymath/communities')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.slice(0, 6).map((community) => (
              <CommunityCard
                key={community.id}
                id={community.id}
                slug={community.slug}
                name={community.name}
                description={community.description}
                memberCount={community.memberCount}
                role={community.role}
              />
            ))}
          </div>
        )}
      </div>

      {activities.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#3C3C3C] mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card key={activity.id}>
                <CardBody className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-[#3C3C3C]">{activity.title}</h3>
                    <p className="text-sm text-[#666666]">
                      {activity.type} in {activity.community}
                    </p>
                  </div>
                  <p className="text-xs text-[#999999]">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {communities.length === 0 && activities.length === 0 && (
        <Card className="bg-gradient-to-r from-[#20B2AA]/10 to-[#0d9488]/10">
          <CardBody className="text-center py-12">
            <h3 className="text-xl font-bold text-[#3C3C3C] mb-2">
              Get Started with Polymath
            </h3>
            <p className="text-[#666666] mb-6 max-w-md mx-auto">
              Join a community of educators collaborating to build equitable curricula
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/polymath/communities">
                <Button>Explore Communities</Button>
              </Link>
              <Link href="/polymath/communities/create">
                <Button variant="secondary">Start a Community</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
