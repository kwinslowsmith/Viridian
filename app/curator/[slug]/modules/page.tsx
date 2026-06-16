'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { colors } from '@/app/modules/improv/design/colors';

export default function ModulesPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [slug, setSlug] = useState('');
  const [community, setCommunity] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimatedHours: '',
  });

  useEffect(() => {
    (async () => {
      const { slug: resolvedSlug } = await params;
      setSlug(resolvedSlug);
      fetchData(resolvedSlug);
    })();
  }, [params]);

  const fetchData = async (communitySlug: string) => {
    try {
      const res = await fetch(`/api/communities/${communitySlug}`);
      if (res.ok) {
        const data = await res.json();
        setCommunity(data);
        setModules(data.modules || []);
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

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/communities/${slug}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        }),
      });

      if (res.ok) {
        const newModule = await res.json();
        setModules([...modules, newModule]);
        setFormData({ title: '', description: '', estimatedHours: '' });
        setShowCreateForm(false);
        alert('Module created!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create module');
      }
    } catch (err) {
      alert('Failed to create module');
    }
  };

  const handleUpdateModule = async (e: React.FormEvent, moduleId: string) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/communities/${slug}/modules/${moduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setModules(modules.map((m) => (m.id === moduleId ? updated : m)));
        setEditingId(null);
        setFormData({ title: '', description: '', estimatedHours: '' });
        alert('Module updated!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update module');
      }
    } catch (err) {
      alert('Failed to update module');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (confirm('Are you sure you want to delete this module?')) {
      try {
        const res = await fetch(`/api/communities/${slug}/modules/${moduleId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setModules(modules.filter((m) => m.id !== moduleId));
          alert('Module deleted');
        } else {
          alert('Failed to delete module');
        }
      } catch (err) {
        alert('Failed to delete module');
      }
    }
  };

  const startEdit = (module: any) => {
    setEditingId(module.id);
    setFormData({
      title: module.title,
      description: module.description || '',
      estimatedHours: module.estimatedHours?.toString() || '',
    });
  };

  if (status === 'loading' || loading) {
    return <div style={{ color: colors.text, padding: '2rem' }}>Loading...</div>;
  }

  if (!community) {
    return <div style={{ color: colors.text, padding: '2rem' }}>Community not found</div>;
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <div className="max-w-4xl mx-auto p-6">
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

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
            Manage Modules
          </h1>
          <p style={{ color: colors.text2 }}>{community.name}</p>
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingId) && (
          <div className="mb-8 p-6 rounded-lg border" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
              {editingId ? 'Edit Module' : 'Create New Module'}
            </h2>
            <form
              onSubmit={(e) => {
                if (editingId) {
                  handleUpdateModule(e, editingId);
                } else {
                  handleCreateModule(e);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                  Module Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ borderColor: colors.border, color: colors.text }}
                  placeholder="e.g., Introduction to Improv"
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
                  placeholder="Describe what this module covers..."
                  rows={4}
                />
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
                  placeholder="e.g., 5"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded font-semibold text-white"
                  style={{ backgroundColor: colors.teal.bg }}
                >
                  {editingId ? 'Update Module' : 'Create Module'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingId(null);
                    setFormData({ title: '', description: '', estimatedHours: '' });
                  }}
                  className="flex-1 px-6 py-3 rounded font-semibold border"
                  style={{ borderColor: colors.border, color: colors.text }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Create Button */}
        {!showCreateForm && !editingId && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="mb-6 px-6 py-3 rounded font-semibold text-white"
            style={{ backgroundColor: colors.teal.bg }}
          >
            + Add Module
          </button>
        )}

        {/* Modules List */}
        <div className="space-y-4">
          {modules.length > 0 ? (
            modules.map((module, idx) => (
              <div
                key={module.id}
                className="p-6 rounded-lg border"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
                      {idx + 1}. {module.title}
                    </h3>
                    {module.description && (
                      <p style={{ color: colors.text2 }} className="mb-2">
                        {module.description}
                      </p>
                    )}
                    {module.estimatedHours && (
                      <p style={{ color: colors.text2 }} className="text-sm">
                        ~{module.estimatedHours} hours
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(module)}
                    className="px-4 py-2 rounded font-semibold text-sm border"
                    style={{ borderColor: colors.border, color: colors.text }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteModule(module.id)}
                    className="px-4 py-2 rounded font-semibold text-sm"
                    style={{ backgroundColor: '#ef4444', color: 'white' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div
              className="p-6 rounded-lg text-center"
              style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
            >
              <p style={{ color: colors.text2 }}>No modules yet. Create one to get started!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
