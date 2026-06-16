'use client';

import React from 'react';
import { colors } from '@/app/modules/improv/design/colors';

interface ResourceCardProps {
  resource: {
    id: string;
    title: string;
    description?: string;
    url?: string;
    fileKey?: string;
    fileName?: string;
    type: string;
    format?: string;
    tags?: string;
    visibility: string;
    createdBy: { id: string; name: string };
    skills: Array<{ skill: { id: string; name: string } }>;
  };
  currentUserId: string;
  currentUserRole?: string;
  onEdit?: (resource: any) => void;
  onDelete?: (resourceId: string) => void;
}

const TYPE_ICONS: Record<string, string> = {
  assessment: '📋',
  material: '📄',
  tool: '🛠️',
  template: '📝',
  link: '🔗',
  video: '🎬',
};

const VISIBILITY_LABELS: Record<string, { label: string; bg: string }> = {
  public: { label: 'Public', bg: '#10b981' },
  org: { label: 'Organization', bg: '#3b82f6' },
  class: { label: 'Class', bg: '#8b5cf6' },
};

export function ResourceCard({
  resource,
  currentUserId,
  currentUserRole,
  onEdit,
  onDelete,
}: ResourceCardProps) {
  const isCreator = resource.createdBy.id === currentUserId;
  const isAdmin = currentUserRole && ['SuperAdmin', 'SchoolAdmin', 'GradeLeadAdmin'].includes(currentUserRole);
  const canEdit = isCreator || isAdmin;

  const handleClick = () => {
    if (resource.url) {
      window.open(resource.url, '_blank');
    } else if (resource.fileKey) {
      // TODO: Generate signed URL and open file
    }
  };

  const visibilityStyle = VISIBILITY_LABELS[resource.visibility] || VISIBILITY_LABELS.org;

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '1.25rem',
        cursor: resource.url || resource.fileKey ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s',
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (resource.url || resource.fileKey) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 12px rgba(0,0,0,0.1)`;
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Header: Type icon, title, and actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
          <span style={{ fontSize: '20px', flexShrink: 0 }}>
            {TYPE_ICONS[resource.type] || '📦'}
          </span>
          <h3 style={{ color: colors.text, fontSize: '15px', fontWeight: '600', margin: 0 }}>
            {resource.title}
          </h3>
        </div>
        {canEdit && (
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(resource);
                }}
                style={{
                  padding: '6px 10px',
                  backgroundColor: colors.teal.accent,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                }}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(resource.id);
                }}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                }}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {resource.description && (
        <p
          style={{
            color: colors.text2,
            fontSize: '13px',
            margin: '0 0 0.75rem 0',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          } as any}
        >
          {resource.description}
        </p>
      )}

      {/* Skills */}
      {resource.skills.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {resource.skills.map((rs) => (
            <span
              key={rs.skill.id}
              style={{
                display: 'inline-block',
                backgroundColor: colors.teal.bg,
                color: colors.teal.accent,
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              {rs.skill.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Format, visibility, creator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', borderTop: `1px solid ${colors.border}`, paddingTop: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '12px' }}>
          {resource.format && (
            <span style={{ color: colors.text2, textTransform: 'uppercase', fontWeight: '500' }}>
              {resource.format}
            </span>
          )}
          {resource.url && (
            <span style={{ color: colors.teal.accent, fontSize: '11px' }}>🔗</span>
          )}
          {resource.fileKey && (
            <span style={{ color: colors.teal.accent, fontSize: '11px' }}>📥</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span
            style={{
              display: 'inline-block',
              backgroundColor: visibilityStyle.bg,
              color: 'white',
              padding: '3px 8px',
              borderRadius: '3px',
              fontSize: '11px',
              fontWeight: '600',
            }}
          >
            {visibilityStyle.label}
          </span>
          <span style={{ color: colors.text2, fontSize: '12px' }}>
            {resource.createdBy.name}
          </span>
        </div>
      </div>
    </div>
  );
}
