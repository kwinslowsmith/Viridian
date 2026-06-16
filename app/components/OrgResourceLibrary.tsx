'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/app/modules/improv/design/colors';
import { ResourceCard } from './ResourceCard';
import { ResourceForm } from './ResourceForm';

interface OrgResourceLibraryProps {
  org: { id: string; slug: string; name: string };
  userRole: string;
  userId: string;
}

const RESOURCE_TYPES = ['assessment', 'material', 'tool', 'template', 'link', 'video'];

export function OrgResourceLibrary({ org, userRole, userId }: OrgResourceLibraryProps) {
  const [resources, setResources] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSkillId, setFilterSkillId] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);

  const canCreate = ['Teacher', 'SuperAdmin', 'SchoolAdmin', 'GradeLeadAdmin', 'SchedulerAdmin'].includes(userRole);

  // Fetch resources and skills
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resourcesRes, skillsRes, objectivesRes] = await Promise.all([
          fetch(`/api/organizations/${org.slug}/resources`),
          fetch(`/api/improv/classes?orgSlug=${org.slug}`), // TODO: Get org-level skills endpoint
          fetch(`/api/improv/classes?orgSlug=${org.slug}`), // TODO: Get org-level objectives endpoint
        ]);

        if (resourcesRes.ok) {
          const data = await resourcesRes.json();
          setResources(data.resources || []);
        }

        // For now, skills will be empty - would need an endpoint to fetch org skills
        // This is placeholder until we have an org-level skills endpoint
        setSkills([]);
        setObjectives([]);
      } catch (err) {
        console.error('Failed to fetch library data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [org.slug]);

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
      const res = await fetch(`/api/organizations/${org.slug}/resources/${resourceId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setResources(resources.filter((r) => r.id !== resourceId));
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
    if (filterSkillId && !resource.skills.some((s: any) => s.skill.id === filterSkillId)) {
      return false;
    }
    if (filterVisibility && resource.visibility !== filterVisibility) {
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
          Resource Library
        </h2>
        {canCreate && (
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

        <div>
          <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
            Visibility
          </label>
          <select
            value={filterVisibility}
            onChange={(e) => setFilterVisibility(e.target.value)}
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
            <option value="">All visibility</option>
            <option value="public">Public</option>
            <option value="org">Organization</option>
            <option value="class">Class</option>
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
              ? 'No resources yet. Create one to get started!'
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
              currentUserRole={userRole}
              onEdit={canCreate ? handleEdit : undefined}
              onDelete={canCreate ? handleDelete : undefined}
            />
          ))}
        </div>
      )}

      {/* Resource Form Modal */}
      {showForm && (
        <ResourceForm
          orgSlug={org.slug}
          skills={skills}
          objectives={objectives}
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
