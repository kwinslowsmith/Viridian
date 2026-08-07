'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/app/design/colors';
import { ResourceCard } from './ResourceCard';
import { ResourceForm } from './ResourceForm';

interface CommunityResourceLibraryProps {
  communitySlug: string;
  isCurator: boolean;
  userId: string;
}

const RESOURCE_TYPES = ['assessment', 'material', 'tool', 'template', 'link', 'video'];

export function CommunityResourceLibrary({
  communitySlug,
  isCurator,
  userId,
}: CommunityResourceLibraryProps) {
  const [resources, setResources] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch(`/api/communities/${communitySlug}/resources`);
        if (res.ok) {
          const data = await res.json();
          setResources(data.resources || []);
        }
      } catch (err) {
        console.error('Failed to fetch community resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [communitySlug]);

  const handleCreateSuccess = (newResource: any) => {
    setResources([newResource, ...resources]);
    setShowForm(false);
    setEditingResource(null);
  };

  const handleEdit = (resource: any) => {
    setEditingResource(resource);
    setShowForm(true);
  };

  const handleDelete = async (resourceId: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      const res = await fetch(`/api/communities/${communitySlug}/resources/${resourceId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setResources(resources.filter((r) => r.id !== resourceId));
      } else {
        alert('Failed to delete resource');
      }
    } catch (err) {
      console.error('Failed to delete resource:', err);
      alert('Failed to delete resource');
    }
  };

  // Filter resources
  const filteredResources = resources.filter((resource) => {
    if (searchQuery && !resource.title.toLowerCase().includes(searchQuery.toLowerCase()) && !resource.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterType && resource.type !== filterType) {
      return false;
    }
    return true;
  });

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading resources...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', margin: 0 }}>
          Community Resources
        </h2>
        {isCurator && (
          <button
            onClick={() => {
              setEditingResource(null);
              setShowForm(true);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: colors.teal.accent,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
            }}
          >
            + Add Resource
          </button>
        )}
      </div>

      {/* Filters */}
      <div
        style={{
          backgroundColor: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div>
          <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
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
              backgroundColor: colors.surface,
              fontSize: '13px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
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
              backgroundColor: colors.surface,
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
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: colors.text2,
          }}
        >
          <p style={{ fontSize: '14px', margin: 0 }}>
            {resources.length === 0
              ? 'No resources yet. ' + (isCurator ? 'Create one to get started!' : '')
              : 'No resources match your filters.'}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}
        >
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              currentUserId={userId}
              currentUserRole={isCurator ? 'Curator' : 'Member'}
              onEdit={isCurator ? handleEdit : undefined}
              onDelete={isCurator ? handleDelete : undefined}
            />
          ))}
        </div>
      )}

      {/* Resource Form Modal */}
      {showForm && isCurator && (
        <ResourceForm
          orgSlug="" // Not using org context for community resources
          communitySlug={communitySlug}
          skills={skills}
          resource={editingResource}
          onSuccess={handleCreateSuccess}
          onClose={() => {
            setShowForm(false);
            setEditingResource(null);
          }}
        />
      )}
    </div>
  );
}
