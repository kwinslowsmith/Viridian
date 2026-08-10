'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { colors } from '@/app/design/colors';

export default function DiscoverOrganizationsPage() {
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    fetchOrganizations();
  }, [search, topic, offset]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(search && { search }),
        ...(topic && { topic }),
      });

      const res = await fetch(`/api/organizations/discover?${params}`);
      const data = await res.json();
      setOrganizations(data.organizations || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <div className="p-6" style={{ backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
        <h1 className="text-4xl font-bold mb-2" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
          Discover Organizations
        </h1>
        <p style={{ color: colors.text2 }}>Explore learning organizations and their communities</p>
      </div>

      {/* Filters & Search */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8 space-y-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOffset(0);
            }}
            className="w-full px-4 py-3 rounded-lg border"
            style={{ borderColor: colors.border, color: colors.text }}
          />

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
              <option value="automotive">Automotive</option>
              <option value="technology">Technology</option>
              <option value="business">Business</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p style={{ color: colors.text2 }}>
            Showing {offset + 1}-{Math.min(offset + limit, total)} of {total} organizations
          </p>
        </div>

        {/* Organizations Grid */}
        {loading ? (
          <div style={{ color: colors.text }}>Loading organizations...</div>
        ) : organizations.length === 0 ? (
          <div style={{ color: colors.text2 }}>No organizations found. Try adjusting your filters.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {organizations.map((org) => (
                <Link
                  key={org.id}
                  href={`/organization/${org.slug}`}
                  className="rounded-lg overflow-hidden border transition-all hover:shadow-lg"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border, textDecoration: 'none' }}
                >
                  {/* Logo/Cover */}
                  {org.logo && (
                    <div
                      className="w-full h-32 flex items-center justify-center text-4xl"
                      style={{ backgroundColor: colors.bg }}
                    >
                      {org.logo}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold mb-1" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
                        {org.name}
                      </h3>
                      <p style={{ color: colors.text2 }} className="text-sm">
                        {org.description || 'No description available'}
                      </p>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-2">
                      {org.topic && (
                        <span
                          className="px-2 py-1 rounded text-xs font-semibold"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {org.topic}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="text-xs" style={{ color: colors.text2 }}>
                      <div>{org._count?.communities || 0} communities</div>
                      <div>{org._count?.members || 0} members</div>
                    </div>

                    {/* View Button */}
                    <button
                      className="w-full px-3 py-2 rounded text-sm font-semibold text-white"
                      style={{ backgroundColor: colors.teal.accent }}
                    >
                      View Organization
                    </button>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="px-4 py-2 rounded font-semibold"
                style={{
                  backgroundColor: offset === 0 ? colors.bg : colors.teal.accent,
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
                  backgroundColor: offset + limit >= total ? colors.bg : colors.teal.accent,
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
