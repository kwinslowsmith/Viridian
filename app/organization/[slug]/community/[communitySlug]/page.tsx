'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { colors } from '@/app/modules/improv/design/colors';

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const orgSlug = params?.slug as string;
  const communitySlug = params?.communitySlug as string;

  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCurator, setIsCurator] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'members'>('overview');

  useEffect(() => {
    if (!orgSlug || !communitySlug || !session?.user?.id) return;

    const fetchCommunity = async () => {
      try {
        const res = await fetch(`/api/communities/${communitySlug}`);
        if (!res.ok) {
          router.push(`/organization/${orgSlug}`);
          return;
        }

        const data = await res.json();
        setCommunity(data);

        setIsCurator(data.curatorId === session.user?.id);
        const isMemberOfCommunity = data.members.some((m: any) => m.userId === session.user?.id);
        setIsMember(isMemberOfCommunity);
      } catch (err) {
        console.error('Failed to fetch community:', err);
        router.push(`/organization/${orgSlug}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [orgSlug, communitySlug, session?.user?.id, router]);

  if (loading) {
    return (
      <main style={{ backgroundColor: colors.bg, minHeight: '100vh', padding: '2rem' }}>
        <div style={{ color: colors.text }}>Loading...</div>
      </main>
    );
  }

  if (!community) {
    return (
      <main style={{ backgroundColor: colors.bg, minHeight: '100vh', padding: '2rem' }}>
        <div style={{ color: colors.text }}>Community not found</div>
      </main>
    );
  }

  const difficultyColors: { [key: string]: string } = {
    beginner: '#10b981',
    intermediate: '#f59e0b',
    advanced: '#ef4444',
  };

  return (
    <main style={{ backgroundColor: colors.bg, minHeight: '100vh', padding: '2rem' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/organization/${orgSlug}`}
            style={{ color: colors.teal.accent, textDecoration: 'none', fontSize: '14px' }}
          >
            ← Back to Organization
          </Link>
        </div>

        <div style={{ backgroundColor: colors.surface, borderRadius: '12px', padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ color: colors.text, fontSize: '32px', fontWeight: '700', marginBottom: '0.5rem' }}>
                {community.name}
              </h1>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {community.difficulty && (
                  <span
                    style={{
                      backgroundColor: difficultyColors[community.difficulty.toLowerCase()] || colors.text2,
                      color: 'white',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    }}
                  >
                    {community.difficulty}
                  </span>
                )}
                <span style={{ color: colors.text2, fontSize: '14px' }}>
                  {community._count?.members || 0} members
                </span>
              </div>
            </div>

            {isCurator && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link
                  href={`/curator/polymath`}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: colors.teal.bg,
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  📰 Publish to Polymath
                </Link>
              </div>
            )}
          </div>

          {community.description && (
            <p style={{ color: colors.text2, marginBottom: '1.5rem', lineHeight: '1.6' }}>
              {community.description}
            </p>
          )}

          {!isMember && (
            <button
              onClick={async () => {
                try {
                  const res = await fetch(`/api/communities/${community.slug}/join`, {
                    method: 'POST',
                  });
                  if (res.ok) {
                    alert('Joined community!');
                    window.location.reload();
                  }
                } catch (err) {
                  alert('Failed to join community');
                }
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: colors.teal.bg,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Join Community
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '2rem', borderBottom: `1px solid ${colors.border}`, marginBottom: '2rem' }}>
          {(['overview', 'modules', 'members'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '1rem 0',
                color: activeTab === tab ? colors.teal.accent : colors.text2,
                backgroundColor: 'transparent',
                borderTop: 'none',
                borderRight: 'none',
                borderLeft: 'none',
                borderBottom: activeTab === tab ? `3px solid ${colors.teal.accent}` : 'none',
                fontSize: '14px',
                fontWeight: activeTab === tab ? '600' : '500',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div>
            <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>
              About
            </h2>
            <div style={{ color: colors.text2, lineHeight: '1.8' }}>
              {community.description ? (
                <p>{community.description}</p>
              ) : (
                <p>No description provided.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'modules' && (
          <div>
            <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>
              Learning Modules
            </h2>
            {community.modules && community.modules.length > 0 ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {community.modules.map((module: any) => (
                  <div
                    key={module.id}
                    style={{
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      padding: '1.5rem',
                    }}
                  >
                    <h3 style={{ color: colors.text, fontWeight: '600', marginBottom: '0.5rem' }}>
                      {module.title}
                    </h3>
                    {module.description && (
                      <p style={{ color: colors.text2, fontSize: '14px', marginBottom: '0.75rem' }}>
                        {module.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: colors.text2 }}>No modules yet.</p>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>
              Members ({community._count?.members || 0})
            </h2>
            {community.members && community.members.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {community.members.slice(0, 10).map((member: any) => (
                  <div
                    key={member.id}
                    style={{
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      padding: '1rem',
                    }}
                  >
                    <p style={{ color: colors.text, fontWeight: '500' }}>Member ID: {member.userId}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: colors.text2 }}>No members yet.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
