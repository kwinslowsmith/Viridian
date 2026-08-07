'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { colors } from '@/app/design/colors';

export default function CuratorPanelPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topic: '',
    difficulty: '',
    estimatedHours: '',
    requiresApprovalToJoin: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    if (status === 'authenticated') {
      fetchCuratorCommunities();
    }
  }, [status, refreshKey]);

  // Refetch data when page becomes visible (tab focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCuratorCommunities();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchCuratorCommunities = async () => {
    try {
      const res = await fetch('/api/curator/communities');
      const data = await res.json();
      setCommunities(data.communities);
    } catch (err) {
      console.error('Failed to fetch communities:', err);
      alert('You do not have permission to access this page');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
          scope: 'global',
          isPublic: true,
        }),
      });

      if (res.ok) {
        const newCommunity = await res.json();
        setCommunities([newCommunity, ...communities]);
        setFormData({
          name: '',
          description: '',
          topic: '',
          difficulty: '',
          estimatedHours: '',
          requiresApprovalToJoin: false,
        });
        setShowCreateForm(false);
        alert('Community created successfully!');
        setRefreshKey(prev => prev + 1);
      } else {
        try {
          const data = await res.json();
          console.error('Create community failed:', res.status, data);
          alert(data.error || `Failed to create community (${res.status})`);
        } catch {
          console.error('Create community failed with status:', res.status);
          alert(`Failed to create community (${res.status})`);
        }
      }
    } catch (err) {
      console.error('Create community error:', err);
      alert('Failed to create community');
    }
  };

  const handleDeleteCommunity = async (communityId: string, communitySlug: string) => {
    if (confirm('Are you sure you want to archive this community? This cannot be undone.')) {
      try {
        const res = await fetch(`/api/communities/${communitySlug}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setCommunities(communities.filter((c) => c.id !== communityId));
          alert('Community archived');
          setRefreshKey(prev => prev + 1);
        } else {
          alert('Failed to archive community');
        }
      } catch (err) {
        alert('Failed to archive community');
      }
    }
  };

  if (status === 'loading' || loading) {
    return <div style={{ color: colors.text, padding: '2rem' }}>Loading...</div>;
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <div className="p-6" style={{ backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
        <h1 className="text-4xl font-bold mb-2" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
          Curator Panel
        </h1>
        <p style={{ color: colors.text2 }}>Create and manage your learning communities</p>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 rounded font-semibold text-white"
            style={{ backgroundColor: colors.teal.bg }}
          >
            {showCreateForm ? 'Cancel' : '+ Create Community'}
          </button>
          <Link
            href="/curator/polymath"
            className="px-6 py-3 rounded font-semibold text-white"
            style={{ backgroundColor: colors.amber.bg }}
          >
            📰 Polymath Publisher
          </Link>
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="px-6 py-3 rounded font-semibold border"
            style={{ borderColor: colors.border, color: colors.text }}
            title="Refresh to see latest join requests"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-8 p-6 rounded-lg border" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
              Create New Community
            </h2>
            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                  Community Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ borderColor: colors.border, color: colors.text }}
                  placeholder="e.g., Introduction to Web Development"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ borderColor: colors.border, color: colors.text }}
                  placeholder="Describe your learning community..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    Topic
                  </label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ borderColor: colors.border, color: colors.text }}
                  >
                    <option value="">Select a topic</option>
                    <option value="education">Education</option>
                    <option value="career">Career</option>
                    <option value="life-skills">Life Skills</option>
                    <option value="technology">Technology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ borderColor: colors.border, color: colors.text }}
                  >
                    <option value="">Select difficulty</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                  Estimated Hours
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ borderColor: colors.border, color: colors.text }}
                  placeholder="e.g., 20"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requiresApproval"
                  checked={formData.requiresApprovalToJoin}
                  onChange={(e) => setFormData({ ...formData, requiresApprovalToJoin: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="requiresApproval" className="ml-2 text-sm font-semibold" style={{ color: colors.text }}>
                  Require approval to join this community
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded font-semibold text-white"
                  style={{ backgroundColor: colors.teal.bg }}
                >
                  Create Community
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-6 py-3 rounded font-semibold border"
                  style={{ borderColor: colors.border, color: colors.text }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Communities List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
            Your Communities
          </h2>

          {communities.length > 0 ? (
            communities.map((community) => (
              <div
                key={community.id}
                className="p-6 rounded-lg border"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3
                      className="text-xl font-bold"
                      style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}
                    >
                      {community.name}
                    </h3>
                    <p style={{ color: colors.text2 }} className="text-sm mt-1">
                      {community.description || 'No description'}
                    </p>
                  </div>
                  <div
                    className="px-3 py-1 rounded text-sm font-semibold"
                    style={{
                      backgroundColor: community.status === 'active' ? '#10b981' : '#f59e0b',
                      color: 'white',
                    }}
                  >
                    {community.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm" style={{ color: colors.text2 }}>
                  {community.topic && <div>Topic: {community.topic}</div>}
                  {community.difficulty && <div>Difficulty: {community.difficulty}</div>}
                  <div>{community._count?.members || 0} members</div>
                  <div>{community._count?.modules || 0} modules</div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Link
                    href={`/discover/${community.slug}`}
                    className="px-4 py-2 rounded font-semibold text-white text-sm"
                    style={{ backgroundColor: colors.teal.bg }}
                  >
                    View Community
                  </Link>
                  <Link
                    href={`/curator/${community.slug}/edit`}
                    className="px-4 py-2 rounded font-semibold text-sm border"
                    style={{ borderColor: colors.border, color: colors.text }}
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/curator/${community.slug}/modules`}
                    className="px-4 py-2 rounded font-semibold text-sm border"
                    style={{ borderColor: colors.border, color: colors.text }}
                  >
                    Modules ({community._count?.modules || 0})
                  </Link>
                  <Link
                    href={`/curator/${community.slug}/join-requests`}
                    className="px-4 py-2 rounded font-semibold text-sm border"
                    style={{ borderColor: colors.border, color: colors.text }}
                  >
                    Join Requests ({community._count?.joinRequests || 0})
                  </Link>
                  <button
                    onClick={() => handleDeleteCommunity(community.id, community.slug)}
                    className="px-4 py-2 rounded font-semibold text-sm"
                    style={{ backgroundColor: '#ef4444', color: 'white' }}
                  >
                    Archive
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: colors.text2 }}>
              <p>You haven't created any communities yet.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 px-6 py-3 rounded font-semibold text-white"
                style={{ backgroundColor: colors.teal.bg }}
              >
                Create Your First Community
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
