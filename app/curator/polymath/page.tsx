'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CommunityOption {
  id: string;
  slug: string;
  name: string;
}

interface PublishedContent {
  id: string;
  type: 'article' | 'tool' | 'module' | 'collection';
  title?: string;
  name?: string;
  status: string;
  publishedAt: string;
  community: { name: string };
}

export default function PolymathCuratorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [communities, setCommunities] = useState<CommunityOption[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'articles' | 'tools' | 'modules' | 'collections'>('articles');
  const [publishedContent, setPublishedContent] = useState<PublishedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    fetchCurations();
  }, []);

  const fetchCurations = async () => {
    try {
      setLoading(true);
      // Fetch communities where user is curator
      const res = await fetch('/api/communities/my');
      const data = await res.json();
      setCommunities(data.communities || []);
      if (data.communities?.length > 0) {
        setSelectedCommunity(data.communities[0].slug);
      }
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityContent = async (slug: string, type: string) => {
    try {
      const res = await fetch(`/api/communities/${slug}/polymath/${type}?published=true`);
      const data = await res.json();
      setPublishedContent(
        data.map((item: any) => ({
          id: item.id,
          type: type as any,
          title: item.title || item.name,
          status: item.status,
          publishedAt: item.publishedAt,
          community: item.community,
        }))
      );
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
    }
  };

  useEffect(() => {
    if (selectedCommunity) {
      fetchCommunityContent(selectedCommunity, activeTab);
    }
  }, [selectedCommunity, activeTab]);

  const handlePublish = async (contentId: string, type: string) => {
    try {
      const res = await fetch(
        `/api/communities/${selectedCommunity}/polymath/${type}/${contentId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'published' }),
        }
      );
      if (res.ok) {
        fetchCommunityContent(selectedCommunity, activeTab);
      }
    } catch (error) {
      console.error('Failed to publish:', error);
    }
  };

  const handleDelete = async (contentId: string, type: string) => {
    if (!window.confirm('Delete this content?')) return;
    try {
      const res = await fetch(
        `/api/communities/${selectedCommunity}/polymath/${type}/${contentId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        fetchCommunityContent(selectedCommunity, activeTab);
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (communities.length === 0) {
    return (
      <div className="p-8 max-w-2xl">
        <h1 className="text-3xl font-serif mb-4">No Communities</h1>
        <p className="text-stone-600 mb-4">You're not a curator of any communities yet.</p>
        <Link href="/discover" className="text-amber-700 hover:text-amber-800">
          ← Back to Communities
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-amber-950 mb-2">Polymath Publisher</h1>
          <p className="text-stone-600">Manage content published to Polymath Magazine</p>
        </div>

        {/* Community Selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Select Community
          </label>
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            className="px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
          >
            {communities.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-stone-200">
          {(['articles', 'tools', 'modules', 'collections'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-amber-700 text-amber-700'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Create Button */}
        <div className="mb-8">
          <button
            onClick={() => {
              setShowForm(true);
              setFormData({ community: selectedCommunity, type: activeTab });
            }}
            className="px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 font-medium"
          >
            + Create {activeTab.slice(0, -1)}
          </button>
        </div>

        {/* Content List */}
        <div className="space-y-4">
          {publishedContent.length === 0 ? (
            <div className="text-center py-12 text-stone-600">
              No {activeTab} published yet.
            </div>
          ) : (
            publishedContent.map((item) => (
              <div
                key={item.id}
                className="p-6 bg-white rounded-lg border border-stone-200 flex items-start justify-between"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-amber-950 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-stone-600">
                    Status: <span className="font-medium capitalize">{item.status}</span>
                  </p>
                  {item.publishedAt && (
                    <p className="text-sm text-stone-600">
                      Published: {new Date(item.publishedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/polymath/${activeTab}/${item.id}`}
                    className="px-4 py-2 text-sm bg-stone-200 text-stone-700 rounded hover:bg-stone-300"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handlePublish(item.id, activeTab)}
                    className="px-4 py-2 text-sm bg-amber-100 text-amber-700 rounded hover:bg-amber-200"
                  >
                    {item.status === 'published' ? 'Republish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, activeTab)}
                    className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Form Modal */}
        {showForm && (
          <CreateContentModal
            type={activeTab}
            community={selectedCommunity}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              fetchCommunityContent(selectedCommunity, activeTab);
            }}
          />
        )}
      </div>
    </div>
  );
}

function CreateContentModal({
  type,
  community,
  onClose,
  onSuccess,
}: {
  type: 'articles' | 'tools' | 'modules' | 'collections';
  community: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [data, setData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch(`/api/communities/${community}/polymath/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        onSuccess();
      } else {
        alert('Failed to create content');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating content');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-serif text-amber-950 mb-4 capitalize">
            Create {type.slice(0, -1)}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'articles' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={data.title || ''}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Abstract</label>
                  <textarea
                    value={data.abstract || ''}
                    onChange={(e) => setData({ ...data, abstract: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-600 h-20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
                  <textarea
                    required
                    value={data.content || ''}
                    onChange={(e) => setData({ ...data, content: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-600 h-32"
                  />
                </div>
              </>
            )}

            {type === 'tools' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={data.name || ''}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={data.description || ''}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-600 h-20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tool URL</label>
                  <input
                    type="url"
                    value={data.toolUrl || ''}
                    onChange={(e) => setData({ ...data, toolUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </>
            )}

            {type === 'modules' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={data.title || ''}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={data.description || ''}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-600 h-20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    value={data.estimatedHours || ''}
                    onChange={(e) => setData({ ...data, estimatedHours: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </>
            )}

            {type === 'collections' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={data.name || ''}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={data.description || ''}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-600 h-20"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
