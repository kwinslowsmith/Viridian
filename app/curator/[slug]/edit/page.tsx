'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { colors } from '@/app/design/colors';

export default function EditCommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [slug, setSlug] = useState('');
  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topic: '',
    difficulty: '',
    estimatedHours: '',
    requiresApprovalToJoin: false,
    isPublic: true,
  });

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
        setFormData({
          name: data.name,
          description: data.description || '',
          topic: data.topic || '',
          difficulty: data.difficulty || '',
          estimatedHours: data.estimatedHours?.toString() || '',
          requiresApprovalToJoin: data.requiresApprovalToJoin || false,
          isPublic: data.isPublic !== false,
        });
      } else {
        alert('Community not found');
        router.push('/curator');
      }
    } catch (err) {
      console.error('Failed to fetch community:', err);
      router.push('/curator');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/communities/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        }),
      });

      if (res.ok) {
        alert('Community updated successfully!');
        router.push('/curator');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update community');
      }
    } catch (err) {
      alert('Failed to update community');
    }
  };

  if (status === 'loading' || loading) {
    return <div style={{ color: colors.text, padding: '2rem' }}>Loading...</div>;
  }

  if (!community) {
    return <div style={{ color: colors.text, padding: '2rem' }}>Community not found</div>;
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <div className="max-w-2xl mx-auto p-6">
        <button
          onClick={() => router.push('/curator')}
          className="mb-6 px-4 py-2 rounded font-semibold text-sm"
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
          }}
        >
          ← Back to Curator Panel
        </button>

        <h1 className="text-3xl font-bold mb-6" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
          Edit {community.name}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 p-6 rounded-lg" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
              Community Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border"
              style={{ borderColor: colors.border, color: colors.text }}
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
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isPublic" className="ml-2 text-sm font-semibold" style={{ color: colors.text }}>
                Public community
              </label>
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
                Require approval to join
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded font-semibold text-white"
              style={{ backgroundColor: colors.teal.accent }}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => router.push('/curator')}
              className="flex-1 px-6 py-3 rounded font-semibold border"
              style={{ borderColor: colors.border, color: colors.text }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
