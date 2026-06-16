'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/app/modules/improv/design/colors';
import { ResourceCard } from './ResourceCard';
import { ResourceForm } from './ResourceForm';

interface ClassResourcesPanelProps {
  classId: string;
  orgSlug: string;
  userRole: string;
  userId: string;
}

export function ClassResourcesPanel({
  classId,
  orgSlug,
  userRole,
  userId,
}: ClassResourcesPanelProps) {
  const [resources, setResources] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);

  const isTeacher = userRole === 'Teacher';

  // Fetch resources and skills for this class
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resourcesRes, skillsRes, objectivesRes] = await Promise.all([
          fetch(`/api/improv/classes/${classId}/resources`),
          fetch(`/api/improv/classes/${classId}/skills`),
          fetch(`/api/improv/classes/${classId}/objectives`),
        ]);

        if (resourcesRes.ok) {
          const data = await resourcesRes.json();
          setResources(data.resources || []);
        }

        if (skillsRes.ok) {
          const data = await skillsRes.json();
          setSkills(data.classSkills?.map((cs: any) => cs.skill) || []);
        }

        if (objectivesRes.ok) {
          const data = await objectivesRes.json();
          setObjectives(data.objectives || []);
        }
      } catch (err) {
        console.error('Failed to fetch class resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

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
      const res = await fetch(`/api/organizations/${orgSlug}/resources/${resourceId}`, {
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

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading resources...</div>;
  }

  // Separate resources by scope
  const classResources = resources.filter((r) => r.visibility === 'class');
  const orgResources = resources.filter((r) => r.visibility === 'org');

  return (
    <div style={{ maxWidth: '1000px' }}>
      {/* Class Resources Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', margin: 0 }}>
            Class Resources
          </h3>
          {isTeacher && (
            <button
              onClick={() => {
                setEditingResource(null);
                setShowForm(true);
              }}
              style={{
                padding: '6px 12px',
                backgroundColor: colors.teal.accent,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '12px',
              }}
            >
              + Add to Class
            </button>
          )}
        </div>

        {classResources.length === 0 ? (
          <p style={{ color: colors.text2, fontSize: '13px', margin: 0 }}>
            No class-specific resources yet.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem',
            }}
          >
            {classResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                currentUserId={userId}
                currentUserRole={userRole}
                onEdit={isTeacher ? handleEdit : undefined}
                onDelete={isTeacher ? handleDelete : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Organization Resources Section */}
      {orgResources.length > 0 && (
        <div>
          <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', margin: '0 0 1rem 0' }}>
            Organization Resources
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem',
            }}
          >
            {orgResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                currentUserId={userId}
                currentUserRole={userRole}
              />
            ))}
          </div>
        </div>
      )}

      {/* Resource Form Modal */}
      {showForm && isTeacher && (
        <ResourceForm
          orgSlug={orgSlug}
          classId={classId}
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
