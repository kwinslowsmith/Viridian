'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/app/modules/improv/design/colors';

interface Objective {
  id: string;
  label: string;
  text: string;
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

export function K12StandardsSelector({ classId, onComplete }: { classId: string; onComplete?: () => void }) {
  const [assignedStandards, setAssignedStandards] = useState<Standard[]>([]);
  const [availableStandards, setAvailableStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStandards, setExpandedStandards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchStandards = async () => {
      try {
        const res = await fetch(`/api/k12-classes/${classId}/standards-manager`);
        if (res.ok) {
          const data = await res.json();
          setAssignedStandards(data.assignedStandards || []);
          setAvailableStandards(data.availableStandards || []);
        }
      } catch (err) {
        console.error('Failed to fetch standards:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStandards();
  }, [classId]);

  const handleAddStandard = async (standardId: string) => {
    try {
      const res = await fetch(`/api/k12-classes/${classId}/standards-manager`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ standardId }),
      });

      if (res.ok) {
        const data = await res.json();
        setAssignedStandards([...assignedStandards, data.standard]);
        setAvailableStandards(availableStandards.filter((s) => s.standardId !== standardId));
      }
    } catch (err) {
      console.error('Failed to add standard:', err);
    }
  };

  const handleRemoveStandard = async (standardId: string) => {
    try {
      const res = await fetch(`/api/k12-classes/${classId}/standards-manager?standardId=${standardId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const standard = assignedStandards.find((s) => s.standardId === standardId);
        setAssignedStandards(assignedStandards.filter((s) => s.standardId !== standardId));
        if (standard) {
          setAvailableStandards([...availableStandards, standard]);
        }
      }
    } catch (err) {
      console.error('Failed to remove standard:', err);
    }
  };

  const toggleExpanded = (standardId: string) => {
    const newExpanded = new Set(expandedStandards);
    if (newExpanded.has(standardId)) {
      newExpanded.delete(standardId);
    } else {
      newExpanded.add(standardId);
    }
    setExpandedStandards(newExpanded);
  };

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading standards...</div>;
  }

  const assignedSkills = assignedStandards.filter((s) => s.standardType === 'skill');
  const assignedContent = assignedStandards.filter((s) => s.standardType === 'content');
  const availableSkills = availableStandards.filter((s) => s.standardType === 'skill');
  const availableContent = availableStandards.filter((s) => s.standardType === 'content');

  const renderStandardCard = (standard: Standard, isAssigned: boolean) => (
    <div
      key={standard.standardId}
      style={{
        backgroundColor: isAssigned ? colors.bg : colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <button
            onClick={() => toggleExpanded(standard.standardId)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '14px', color: colors.text2 }}>
                {expandedStandards.has(standard.standardId) ? '▼' : '▶'}
              </span>
              <div>
                <h4 style={{ color: colors.text, fontSize: '15px', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                  {standard.standardCode} - {standard.standardName}
                </h4>
                <p style={{ color: colors.text2, fontSize: '12px', margin: 0 }}>
                  {standard.standardType === 'skill' ? '🎯 Skill' : '📖 Content'} • {standard.objectives.length} objective{standard.objectives.length !== 1 ? 's' : ''}
                  {standard.unitName && ` • Unit: ${standard.unitName}`}
                </p>
              </div>
            </div>
          </button>

          {expandedStandards.has(standard.standardId) && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {standard.objectives.map((obj) => (
                  <div key={obj.id} style={{ fontSize: '13px', color: colors.text2 }}>
                    <span style={{ fontWeight: '600', color: colors.text }}>{obj.label}:</span> {obj.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {isAssigned ? (
          <button
            onClick={() => handleRemoveStandard(standard.standardId)}
            style={{
              padding: '8px 12px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '12px',
              whiteSpace: 'nowrap',
            }}
          >
            Remove
          </button>
        ) : (
          <button
            onClick={() => handleAddStandard(standard.standardId)}
            style={{
              padding: '8px 16px',
              backgroundColor: colors.teal.accent,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              whiteSpace: 'nowrap',
            }}
          >
            Add
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', marginBottom: '1.5rem' }}>
        Manage Class Standards
      </h2>

      {/* Assigned Skill Standards */}
      {assignedSkills.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: colors.teal.accent, fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>
            🎯 Assigned Skill Standards ({assignedSkills.length})
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {assignedSkills.map((standard) => renderStandardCard(standard, true))}
          </div>
        </div>
      )}

      {/* Assigned Content Standards */}
      {assignedContent.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: colors.amber.accent, fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>
            📖 Assigned Content Standards ({assignedContent.length})
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {assignedContent.map((standard) => renderStandardCard(standard, true))}
          </div>
        </div>
      )}

      {/* Available Standards */}
      {(availableSkills.length > 0 || availableContent.length > 0) && (
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: `2px solid ${colors.border}` }}>
          <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>
            Available Standards
          </h3>

          {availableSkills.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: colors.teal.accent, fontSize: '14px', fontWeight: '600', marginBottom: '1rem', opacity: '0.8' }}>
                🎯 Skill Standards ({availableSkills.length})
              </h4>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {availableSkills.map((standard) => renderStandardCard(standard, false))}
              </div>
            </div>
          )}

          {availableContent.length > 0 && (
            <div>
              <h4 style={{ color: colors.amber.accent, fontSize: '14px', fontWeight: '600', marginBottom: '1rem', opacity: '0.8' }}>
                📖 Content Standards ({availableContent.length})
              </h4>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {availableContent.map((standard) => renderStandardCard(standard, false))}
              </div>
            </div>
          )}
        </div>
      )}

      {assignedStandards.length === 0 && availableStandards.length === 0 && (
        <div style={{ color: colors.text2, padding: '2rem', textAlign: 'center' }}>
          No standards available for this organization.
        </div>
      )}
    </div>
  );
}
