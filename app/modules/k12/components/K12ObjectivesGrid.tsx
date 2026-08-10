'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { colors } from '@/app/design/colors';

interface Objective {
  id: string;
  label: string;
  text: string;
  description: string;
  sequenceNum: number;
}

interface Standard {
  standardId: string;
  standardCode: string;
  standardName: string;
  standardType: 'skill' | 'content';
  unitId?: string;
  unitName?: string;
  objectives: Objective[];
}

interface K12ObjectivesGridProps {
  classId: string;
  className: string;
}

export function K12ObjectivesGrid({ classId, className }: K12ObjectivesGridProps) {
  const { data: session } = useSession();
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStandard, setExpandedStandard] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchObjectives();
    }
  }, [classId, session?.user?.id]);

  const fetchObjectives = async () => {
    try {
      const res = await fetch(`/api/k12-classes/${classId}/objectives`, {
        headers: { 'User-Id': session?.user?.id || '' },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('API error:', res.status, errorData);
        throw new Error('Failed to fetch');
      }
      const data = await res.json();
      setStandards(data.standards || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch objectives:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading standards and objectives...</div>;
  }

  if (standards.length === 0) {
    return <div style={{ color: colors.text2 }}>No standards assigned to this class yet.</div>;
  }

  // Separate skill and content standards
  const skillStandards = standards.filter(s => s.standardType === 'skill');
  const contentStandards = standards.filter(s => s.standardType === 'content');

  // Group content standards by unit
  const standardsByUnit = contentStandards.reduce((acc, standard) => {
    const unitKey = standard.unitId || 'no-unit';
    if (!acc[unitKey]) {
      acc[unitKey] = { unitName: standard.unitName || 'Ungrouped', standards: [] };
    }
    acc[unitKey].standards.push(standard);
    return acc;
  }, {} as Record<string, { unitName: string; standards: Standard[] }>);

  const renderStandardCard = (standard: Standard) => (
    <div
      key={standard.standardId}
      style={{
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: colors.surface,
      }}
    >
      {/* Standard Header */}
      <button
        onClick={() =>
          setExpandedStandard(expandedStandard === standard.standardId ? null : standard.standardId)
        }
        style={{
          width: '100%',
          padding: '1rem',
          backgroundColor: standard.standardType === 'skill' ? colors.teal.accent : colors.amber.bg,
          color: colors.text,
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = '1';
        }}
      >
        <div>
          <div style={{ fontWeight: '700', fontSize: '14px', color: colors.text }}>
            {standard.standardCode} - {standard.standardName}
          </div>
          <div style={{ fontSize: '12px', color: colors.text, marginTop: '0.25rem' }}>
            {standard.standardType === 'skill' ? '🎯 Skill Standard' : '📖 Content Standard'} • {standard.objectives.length} objective{standard.objectives.length !== 1 ? 's' : ''}
          </div>
        </div>
        <span style={{ fontSize: '18px' }}>
          {expandedStandard === standard.standardId ? '▼' : '▶'}
        </span>
      </button>

      {/* Objectives List */}
      {expandedStandard === standard.standardId && (
        <div style={{ padding: '1rem', backgroundColor: colors.bg, borderTop: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {standard.objectives.map(objective => (
              <div
                key={objective.id}
                style={{
                  padding: '0.75rem',
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      minWidth: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.teal.accent,
                      color: 'white',
                      borderRadius: '50%',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    {objective.label}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: colors.text, fontWeight: '700', fontSize: '13px' }}>
                      {objective.text}
                    </div>
                    {objective.description && (
                      <div style={{ color: colors.text2, fontSize: '11px', marginTop: '0.5rem' }}>
                        {objective.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', marginBottom: '1.5rem' }}>
        📚 Standards & Objectives for {className}
      </h3>

      {/* Skill Standards Section */}
      {skillStandards.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: colors.teal.accent, fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            🎯 Skill Standards
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {skillStandards.map(standard => renderStandardCard(standard))}
          </div>
        </div>
      )}

      {/* Content Standards Section (grouped by Unit) */}
      {contentStandards.length > 0 && (
        <div>
          <h4 style={{ color: colors.amber.accent, fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            📖 Content Standards
          </h4>

          {Object.entries(standardsByUnit)
            .sort((a, b) => {
              // Extract unit numbers for proper sorting
              const getUnitNum = (unitName: string) => {
                const match = unitName.match(/\d+/);
                return match ? parseInt(match[0], 10) : Infinity;
              };
              return getUnitNum(a[1].unitName) - getUnitNum(b[1].unitName);
            })
            .map(([unitKey, { unitName, standards: unitStandardList }]) => (
            <div key={unitKey} style={{ marginBottom: '2rem' }}>
              <h5 style={{ color: colors.text, fontSize: '13px', fontWeight: '600', marginBottom: '0.75rem', paddingLeft: '0.5rem', borderLeft: `3px solid ${colors.amber.accent}` }}>
                {unitName}
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {unitStandardList.map(standard => renderStandardCard(standard))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
