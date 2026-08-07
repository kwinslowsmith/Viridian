'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { colors } from '@/app/design/colors';

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topic: '',
    logo: '',
    isPublic: false,
  });
  const [loading, setLoading] = useState(false);

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const org = await res.json();
        alert('Organization created successfully!');
        router.push('/dashboard');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create organization');
      }
    } catch (err) {
      alert('Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <div className="max-w-2xl mx-auto p-6 md:p-8">
        <button
          onClick={() => router.back()}
          className="mb-6 px-4 py-2 rounded font-semibold text-sm"
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
          }}
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold mb-6" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
          Create Organization
        </h1>

        <div className="p-6 rounded-lg" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                Organization Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: colors.border, color: colors.text }}
                placeholder="e.g., Subaru Education"
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
                placeholder="Describe your organization..."
                rows={4}
              />
            </div>

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
                <option value="automotive">Automotive</option>
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                Logo/Icon (emoji or symbol)
              </label>
              <input
                type="text"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: colors.border, color: colors.text }}
                placeholder="e.g., 🚗 or 🎓"
                maxLength={5}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isPublic" className="ml-2 text-sm font-semibold" style={{ color: colors.text }}>
                Make this a public organization (discoverable by others)
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 rounded font-semibold text-white"
                style={{
                  backgroundColor: loading ? colors.bg : colors.teal.bg,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Creating...' : 'Create Organization'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 rounded font-semibold border"
                style={{ borderColor: colors.border, color: colors.text }}
              >
                Cancel
              </button>
            </div>

            <p style={{ color: colors.text2, fontSize: '0.875rem' }}>
              You'll be set as the admin of this organization and can manage communities, members, and settings.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
