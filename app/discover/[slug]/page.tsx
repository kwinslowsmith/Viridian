'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { colors } from '@/app/design/colors';
import { CommunityResourceLibrary } from '@/app/components/CommunityResourceLibrary';

export default function CommunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [slug, setSlug] = useState('');
  const [community, setCommunity] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'modules' | 'members' | 'resources'>('overview');

  useEffect(() => {
    (async () => {
      const { slug: resolvedSlug } = await params;
      setSlug(resolvedSlug);
      fetchCommunity(resolvedSlug);
    })();
  }, [params]);

  const fetchCommunity = async (communitySlug: string) => {
    try {
      const res = await fetch(`/api/communities/${communitySlug}`);
      if (res.ok) {
        const data = await res.json();
        setCommunity(data);
        checkMembership(data.id);
      } else {
        router.push('/discover');
      }
    } catch (err) {
      console.error('Failed to fetch community:', err);
      router.push('/discover');
    } finally {
      setLoading(false);
    }
  };

  const checkMembership = async (communityId: string) => {
    if (!session?.user?.id) return;

    try {
      const res = await fetch(`/api/communities/${slug}/members`);
      if (!res.ok) return;
      const data = await res.json();
      const members = Array.isArray(data) ? data : data.members || [];
      const isMemberOfCommunity = members.some((m: any) => m.userId === session.user?.id);
      setIsMember(isMemberOfCommunity);
    } catch (err) {
      console.error('Failed to check membership:', err);
    }
  };

  const handleJoin = async () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    try {
      const res = await fetch(`/api/communities/${slug}/join`, {
        method: 'POST',
      });

      if (res.ok) {
        alert(community.requiresApprovalToJoin ? 'Join request sent!' : 'Joined community!');
        setIsMember(true);
        fetchCommunity(slug);
      } else {
        try {
          const data = await res.json();
          console.error('Join failed:', res.status, data);
          alert(data.error || `Failed to join community (${res.status})`);
        } catch {
          console.error('Join failed with status:', res.status);
          alert(`Failed to join community (${res.status})`);
        }
      }
    } catch (err) {
      console.error('Join error:', err);
      alert('Failed to join community');
    }
  };

  const handleLeave = async () => {
    if (confirm('Are you sure you want to leave this community?')) {
      try {
        const res = await fetch(`/api/communities/${slug}/join`, {
          method: 'DELETE',
        });

        if (res.ok) {
          alert('Left community');
          setIsMember(false);
          fetchCommunity(slug);
        } else {
          alert('Failed to leave community');
        }
      } catch (err) {
        alert('Failed to leave community');
      }
    }
  };

  if (loading) {
    return <div style={{ color: colors.text }}>Loading...</div>;
  }

  if (!community) {
    return <div style={{ color: colors.text }}>Community not found</div>;
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      {/* Hero Section */}
      <div style={{ backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
        {community.coverImage && (
          <img src={community.coverImage} alt={community.name} className="w-full h-64 object-cover" />
        )}

        <div className="p-8 max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-3" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
            {community.name}
          </h1>

          <p className="text-lg mb-6" style={{ color: colors.text2 }}>
            {community.description || 'No description available'}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 mb-6">
            {community.topic && (
              <div style={{ color: colors.text2 }}>
                <span className="font-semibold">Topic:</span> {community.topic}
              </div>
            )}
            {community.difficulty && (
              <div style={{ color: colors.text2 }}>
                <span className="font-semibold">Difficulty:</span> {community.difficulty}
              </div>
            )}
            <div style={{ color: colors.text2 }}>
              <span className="font-semibold">{community._count?.members || 0}</span> members
            </div>
            <div style={{ color: colors.text2 }}>
              <span className="font-semibold">{community._count?.modules || 0}</span> modules
            </div>
          </div>

          {/* Curator Info */}
          <div className="mb-6 p-4 rounded" style={{ backgroundColor: colors.bg }}>
            <p style={{ color: colors.text2 }} className="text-sm">
              Curated by{' '}
              <span className="font-semibold" style={{ color: colors.text }}>
                {community.organization ? community.organization.name : community.curator?.name}
              </span>
            </p>
          </div>

          {/* Action Button */}
          {isMember ? (
            <button
              onClick={handleLeave}
              className="px-6 py-3 rounded font-semibold"
              style={{ backgroundColor: '#ef4444', color: 'white' }}
            >
              Leave Community
            </button>
          ) : (
            <button
              onClick={handleJoin}
              className="px-6 py-3 rounded font-semibold text-white"
              style={{ backgroundColor: colors.teal.accent }}
            >
              {community.requiresApprovalToJoin ? 'Request to Join' : 'Join Community'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto">
        <div className="flex border-b gap-8 p-6" style={{ borderColor: colors.border }}>
          <button
            onClick={() => setTab('overview')}
            className="font-semibold text-lg border-b-2 pb-2"
            style={{
              color: tab === 'overview' ? colors.teal.accent : colors.text2,
              borderColor: tab === 'overview' ? colors.teal.accent : 'transparent',
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setTab('modules')}
            className="font-semibold text-lg border-b-2 pb-2"
            style={{
              color: tab === 'modules' ? colors.teal.accent : colors.text2,
              borderColor: tab === 'modules' ? colors.teal.accent : 'transparent',
            }}
          >
            Modules ({community.modules?.length || 0})
          </button>
          <button
            onClick={() => setTab('members')}
            className="font-semibold text-lg border-b-2 pb-2"
            style={{
              color: tab === 'members' ? colors.teal.accent : colors.text2,
              borderColor: tab === 'members' ? colors.teal.accent : 'transparent',
            }}
          >
            Members ({community._count?.members || 0})
          </button>
          <button
            onClick={() => setTab('resources')}
            className="font-semibold text-lg border-b-2 pb-2"
            style={{
              color: tab === 'resources' ? colors.teal.accent : colors.text2,
              borderColor: tab === 'resources' ? colors.teal.accent : 'transparent',
            }}
          >
            Resources
          </button>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-3" style={{ color: colors.text }}>
                  About This Community
                </h2>
                <p style={{ color: colors.text2 }}>
                  {community.description || 'No detailed description available.'}
                </p>
                {community.estimatedHours && (
                  <p className="mt-4" style={{ color: colors.text2 }}>
                    <span className="font-semibold">Estimated Duration:</span> {community.estimatedHours} hours
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Modules Tab */}
          {tab === 'modules' && (
            <div className="space-y-3">
              {community.modules && community.modules.length > 0 ? (
                community.modules.map((module: any) => (
                  <div
                    key={module.id}
                    className="p-4 rounded border"
                    style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  >
                    <h3 className="font-bold text-lg" style={{ color: colors.text }}>
                      {module.sequenceNum}. {module.title}
                    </h3>
                    {module.description && (
                      <p style={{ color: colors.text2 }} className="mt-1">
                        {module.description}
                      </p>
                    )}
                    {module.estimatedHours && (
                      <p style={{ color: colors.text2 }} className="text-sm mt-2">
                        ~{module.estimatedHours} hours
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: colors.text2 }}>No modules yet.</p>
              )}
            </div>
          )}

          {/* Members Tab */}
          {tab === 'members' && (
            <div className="space-y-3">
              {community.members && community.members.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {community.members.slice(0, 20).map((member: any) => (
                    <div
                      key={member.id}
                      className="p-3 rounded border"
                      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                    >
                      <div className="font-semibold" style={{ color: colors.text }}>
                        {member.user?.name || 'Unknown'}
                      </div>
                      <div style={{ color: colors.text2 }} className="text-sm">
                        {member.role === 'member' ? 'Member' : member.role}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: colors.text2 }}>No members yet.</p>
              )}
            </div>
          )}

          {/* Resources Tab */}
          {tab === 'resources' && (
            <CommunityResourceLibrary
              communitySlug={slug}
              isCurator={community.curator?.id === session?.user?.id}
              userId={session?.user?.id || ''}
            />
          )}
        </div>
      </div>
    </main>
  );
}
