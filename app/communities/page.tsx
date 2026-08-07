'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { colors } from '@/app/design/colors';

export default function MyCommunitiesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'joined' | 'pending'>('joined');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    if (status === 'authenticated') {
      fetchMyCommunities();
    }
  }, [status]);

  const fetchMyCommunities = async () => {
    try {
      const res = await fetch('/api/me/communities');
      const data = await res.json();
      setCommunities(data.communities);
    } catch (err) {
      console.error('Failed to fetch communities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async (communityId: string, communitySlug: string) => {
    if (confirm('Are you sure you want to leave this community?')) {
      try {
        const res = await fetch(`/api/communities/${communitySlug}/join`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setCommunities(communities.filter((c) => c.id !== communityId));
          alert('Left community');
        } else {
          alert('Failed to leave community');
        }
      } catch (err) {
        alert('Failed to leave community');
      }
    }
  };

  if (status === 'loading' || loading) {
    return <div style={{ color: colors.text, padding: '2rem' }}>Loading...</div>;
  }

  const joinedCommunities = communities.filter((c) => c.status === 'active');
  const pendingCommunities = communities.filter((c) => c.status === 'pending');

  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <div className="p-6" style={{ backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
        <h1 className="text-4xl font-bold mb-2" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
          My Communities
        </h1>
        <p style={{ color: colors.text2 }}>Communities you're learning in</p>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex border-b gap-8 mb-6" style={{ borderColor: colors.border }}>
          <button
            onClick={() => setTab('joined')}
            className="font-semibold text-lg border-b-2 pb-2"
            style={{
              color: tab === 'joined' ? colors.teal.accent : colors.text2,
              borderColor: tab === 'joined' ? colors.teal.accent : 'transparent',
            }}
          >
            Joined ({joinedCommunities.length})
          </button>
          <button
            onClick={() => setTab('pending')}
            className="font-semibold text-lg border-b-2 pb-2"
            style={{
              color: tab === 'pending' ? colors.teal.accent : colors.text2,
              borderColor: tab === 'pending' ? colors.teal.accent : 'transparent',
            }}
          >
            Pending ({pendingCommunities.length})
          </button>
        </div>

        {/* Joined Tab */}
        {tab === 'joined' && (
          <div className="space-y-4">
            {joinedCommunities.length > 0 ? (
              joinedCommunities.map((community) => (
                <div
                  key={community.id}
                  className="p-6 rounded-lg border"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3
                        className="text-xl font-bold mb-2"
                        style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}
                      >
                        {community.name}
                      </h3>
                      <p style={{ color: colors.text2 }} className="mb-3">
                        {community.description || 'No description available'}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm" style={{ color: colors.text2 }}>
                        {community.topic && <div>Topic: {community.topic}</div>}
                        <div>{community._count?.modules || 0} modules</div>
                        <div>{community._count?.members || 0} members</div>
                        {community.estimatedHours && <div>~{community.estimatedHours} hours</div>}
                      </div>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <Link
                        href={`/discover/${community.slug}`}
                        className="px-4 py-2 rounded font-semibold text-white"
                        style={{ backgroundColor: colors.teal.bg }}
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleLeave(community.id, community.slug)}
                        className="px-4 py-2 rounded font-semibold"
                        style={{ backgroundColor: '#ef4444', color: 'white' }}
                      >
                        Leave
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: colors.text2 }}>
                <p>You haven't joined any communities yet.</p>
                <Link
                  href="/discover"
                  className="mt-4 inline-block px-6 py-3 rounded font-semibold text-white"
                  style={{ backgroundColor: colors.teal.bg }}
                >
                  Explore Communities
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Pending Tab */}
        {tab === 'pending' && (
          <div className="space-y-4">
            {pendingCommunities.length > 0 ? (
              pendingCommunities.map((community) => (
                <div
                  key={community.id}
                  className="p-6 rounded-lg border opacity-75"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3
                        className="text-xl font-bold mb-2"
                        style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}
                      >
                        {community.name}
                      </h3>
                      <p style={{ color: colors.text2 }} className="mb-3">
                        {community.description || 'No description available'}
                      </p>
                      <div className="text-sm" style={{ color: colors.text2 }}>
                        Your request to join is pending approval
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: colors.text2 }}>No pending requests</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
