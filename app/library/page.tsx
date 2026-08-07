'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { colors } from '@/app/design/colors';
import { ResourceCard } from '@/app/components/ResourceCard';

const RESOURCE_TYPES = ['assessment', 'material', 'tool', 'template', 'link', 'video'];

export default function LibraryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [resources, setResources] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSkillId, setFilterSkillId] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Fetch resources
  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchResources = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (filterType) params.append('type', filterType);
        if (filterSkillId) params.append('skillId', filterSkillId);

        const res = await fetch(`/api/resources?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setResources(data.resources || []);
        }
      } catch (err) {
        console.error('Failed to fetch resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [status, searchQuery, filterType, filterSkillId]);

  // Fetch all skills for filter dropdown
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        // TODO: Need an endpoint to get all skills across the system
        // For now, leave it empty
        setSkills([]);
      } catch (err) {
        console.error('Failed to fetch skills:', err);
      }
    };

    fetchSkills();
  }, []);

  if (status === 'loading' || loading) {
    return (
      <main style={{ backgroundColor: colors.bg, minHeight: '100vh', padding: '2rem' }}>
        <div style={{ color: colors.text }}>Loading...</div>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <main style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <div style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1
              style={{
                fontFamily: "'DM Serif Display', serif",
                color: colors.text,
                fontSize: '32px',
                margin: '0 0 0.5rem 0',
              }}
            >
              Resource Library
            </h1>
            <p style={{ color: colors.text2, fontSize: '16px', margin: 0 }}>
              Public resources from across the Viridian community
            </p>
          </div>

          {/* Filters */}
          <div
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <label
                style={{
                  color: colors.text2,
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  color: colors.text,
                  backgroundColor: colors.bg,
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  color: colors.text2,
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  color: colors.text,
                  backgroundColor: colors.bg,
                  fontSize: '13px',
                }}
              >
                <option value="">All types</option>
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {skills.length > 0 && (
              <div>
                <label
                  style={{
                    color: colors.text2,
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '0.5rem',
                  }}
                >
                  Skill
                </label>
                <select
                  value={filterSkillId}
                  onChange={(e) => setFilterSkillId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px',
                    color: colors.text,
                    backgroundColor: colors.bg,
                    fontSize: '13px',
                  }}
                >
                  <option value="">All skills</option>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Resources Grid */}
          {resources.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: colors.text2,
              }}
            >
              <p style={{ fontSize: '14px', margin: 0 }}>
                No public resources available yet.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  currentUserId={session?.user?.id || ''}
                  currentUserRole="Student" // Library view is read-only
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
