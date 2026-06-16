'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { colors } from '@/app/modules/improv/design/colors';

export default function DiscoverPage() {
  const { data: session } = useSession();
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState('all');
  const [topic, setTopic] = useState('');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    fetchCommunities();
  }, [search, scope, topic, offset]);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(search && { search }),
        ...(scope !== 'all' && { scope }),
        ...(topic && { topic }),
      });

      const res = await fetch(`/api/communities?${params}`);
      const data = await res.json();
      setCommunities(data.communities);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch communities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (community: any) => {
    if (!session) {
      // Redirect to login
      window.location.href = '/auth/login';
      return;
    }

    try {
      const res = await fetch(`/api/communities/${community.slug}/join`, {
        method: 'POST',
      });

      if (res.ok) {
        alert(community.requiresApprovalToJoin ? 'Join request sent!' : 'Joined community!');
        fetchCommunities();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to join community');
      }
    } catch (err) {
      alert('Failed to join community');
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <div className="p-6" style={{ backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
        <h1 className="text-4xl font-bold mb-2" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
          Discover Communities
        </h1>
        <p style={{ color: colors.text2 }}>Explore learning communities curated by educators worldwide</p>
      </div>

      {/* Filters & Search */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8 space-y-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search communities..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOffset(0);
            }}
            className="w-full px-4 py-3 rounded-lg border"
            style={{ borderColor: colors.border, color: colors.text }}
          />

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scope Filter */}
            <div>
              <label style={{ color: colors.text }} className="block text-sm font-semibold mb-2">
                Scope
              </label>
              <select
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value);
                  setOffset(0);
                }}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: colors.border, color: colors.text }}
              >
                <option value="all">All Communities</option>
                <option value="global">Global Communities</option>
                <option value="organization">Organization Communities</option>
              </select>
            </div>

            {/* Topic Filter */}
            <div>
              <label style={{ color: colors.text }} className="block text-sm font-semibold mb-2">
                Topic
              </label>
              <select
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setOffset(0);
                }}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: colors.border, color: colors.text }}
              >
                <option value="">All Topics</option>
                <option value="education">Education</option>
                <option value="career">Career</option>
                <option value="life-skills">Life Skills</option>
                <option value="technology">Technology</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p style={{ color: colors.text2 }}>
            Showing {offset + 1}-{Math.min(offset + limit, total)} of {total} communities
          </p>
        </div>

        {/* Communities Grid */}
        {loading ? (
          <div style={{ color: colors.text }}>Loading communities...</div>
        ) : communities.length === 0 ? (
          <div style={{ color: colors.text2 }}>No communities found. Try adjusting your filters.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {communities.map((community) => (
                <div
                  key={community.id}
                  className="rounded-lg overflow-hidden border transition-all hover:shadow-lg"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                >
                  {/* Cover Image */}
                  {community.coverImage && (
                    <img
                      src={community.coverImage}
                      alt={community.name}
                      className="w-full h-40 object-cover"
                    />
                  )}

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3
                        className="text-lg font-bold mb-1"
                        style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}
                      >
                        {community.name}
                      </h3>
                      <p style={{ color: colors.text2 }} className="text-sm">
                        {community.description || 'No description available'}
                      </p>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-2">
                      {community.topic && (
                        <span
                          className="px-2 py-1 rounded text-xs font-semibold"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {community.topic}
                        </span>
                      )}
                      {community.difficulty && (
                        <span
                          className="px-2 py-1 rounded text-xs font-semibold"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {community.difficulty}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="text-xs" style={{ color: colors.text2 }}>
                      <div>{community._count?.members || 0} members</div>
                      <div>{community._count?.modules || 0} modules</div>
                    </div>

                    {/* Curator Info */}
                    <div className="text-xs" style={{ color: colors.text2 }}>
                      {community.organization ? (
                        <div>By {community.organization.name}</div>
                      ) : (
                        <div>By {community.curator?.name || 'Unknown'}</div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Link
                        href={`/discover/${community.slug}`}
                        className="flex-1 px-3 py-2 rounded text-center text-sm font-semibold border"
                        style={{ borderColor: colors.border, color: colors.text }}
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleJoin(community)}
                        className="flex-1 px-3 py-2 rounded text-sm font-semibold text-white"
                        style={{ backgroundColor: colors.teal.bg }}
                      >
                        {community.requiresApprovalToJoin ? 'Request' : 'Join'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="px-4 py-2 rounded font-semibold"
                style={{
                  backgroundColor: offset === 0 ? colors.bg : colors.teal.bg,
                  color: colors.text,
                  opacity: offset === 0 ? 0.5 : 1,
                }}
              >
                Previous
              </button>

              <span style={{ color: colors.text2 }}>
                Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
              </span>

              <button
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className="px-4 py-2 rounded font-semibold"
                style={{
                  backgroundColor: offset + limit >= total ? colors.bg : colors.teal.bg,
                  color: colors.text,
                  opacity: offset + limit >= total ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
