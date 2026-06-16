'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/app/modules/improv/design/colors';

interface Objective {
  id: string;
  label: string;
  text: string;
  description?: string;
  customText: string | null;
  isActive: boolean;
  classObjectiveId: string | null;
}

interface Standard {
  standardId: string;
  standardName: string;
  standardCode: string;
  standardType: 'skill' | 'content';
  unitName?: string;
  objectives: Objective[];
}

interface ObjectivesGridProps {
  classId: string;
  className: string;
}

export function K12TeacherObjectivesGrid({ classId, className }: ObjectivesGridProps) {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Map<string, Objective>>(new Map());

  useEffect(() => {
    fetchObjectives();
  }, [classId]);

  const fetchObjectives = async () => {
    try {
      const res = await fetch(`/api/k12-classes/${classId}/objectives`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStandards(data.standards || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch objectives:', err);
      setLoading(false);
    }
  };

  const updateObjectiveText = (objectiveId: string, newText: string) => {
    const newChanges = new Map(changes);

    for (const standard of standards) {
      const obj = standard.objectives.find((o) => o.id === objectiveId);
      if (obj) {
        newChanges.set(objectiveId, {
          ...obj,
          customText: newText || null,
        });
        break;
      }
    }

    setChanges(newChanges);
  };

  const toggleObjectiveActive = (objectiveId: string) => {
    const newChanges = new Map(changes);

    for (const standard of standards) {
      const obj = standard.objectives.find((o) => o.id === objectiveId);
      if (obj) {
        newChanges.set(objectiveId, {
          ...obj,
          isActive: !obj.isActive,
        });
        break;
      }
    }

    setChanges(newChanges);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const updates = Array.from(changes.values()).map((obj) => ({
        exampleObjectiveId: obj.id,
        customText: obj.customText,
        isActive: obj.isActive,
      }));

      const res = await fetch(`/api/k12-classes/${classId}/objectives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objectiveUpdates: updates }),
      });

      if (res.ok) {
        setChanges(new Map());
        await fetchObjectives();
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: colors.text }}>Loading objectives...</div>;

  if (standards.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: colors.text2 }}>
        No standards assigned yet. Assign standards from the Standards tab.
      </div>
    );
  }

  // Separate skill and content standards
  const skillStandards = standards.filter((s) => s.standardType === 'skill');
  const contentStandards = standards.filter((s) => s.standardType === 'content');

  // Group content standards by unit
  const standardsByUnit = contentStandards.reduce(
    (acc, standard) => {
      const unitKey = standard.unitName || 'Ungrouped';
      if (!acc[unitKey]) {
        acc[unitKey] = [];
      }
      acc[unitKey].push(standard);
      return acc;
    },
    {} as Record<string, Standard[]>
  );

  const renderStandardSection = (standardList: Standard[], title: string, color: any) => (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ color: color.accent, fontSize: '16px', fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase' }}>
        {title}
      </h3>

      {standardList.map((standard) => (
        <div key={standard.standardId} style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
            }}
          >
            <h4 style={{ color: colors.text, fontSize: '15px', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
              {standard.standardCode}: {standard.standardName}
            </h4>
            <p style={{ color: colors.text2, fontSize: '13px', margin: '0' }}>
              {standard.objectives.length} objectives
              {standard.unitName && ` • Unit: ${standard.unitName}`}
            </p>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem', marginLeft: '1rem', marginTop: '0.75rem' }}>
            {standard.objectives.map((obj) => {
              const isEdited = changes.has(obj.id);
              const edited = changes.get(obj.id) || obj;

              return (
                <div
                  key={obj.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    border: `1px solid ${isEdited ? colors.teal.accent : colors.border}`,
                    backgroundColor: !edited.isActive ? '#f5f5f5' : colors.surface,
                    opacity: !edited.isActive ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ flexShrink: 0 }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          backgroundColor: colors.teal.bg,
                          color: colors.text,
                        }}
                      >
                        {obj.label}
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                        Objective {obj.label}
                      </label>
                      <textarea
                        value={edited.customText || obj.text}
                        onChange={(e) => updateObjectiveText(obj.id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '4px',
                          border: `1px solid ${colors.border}`,
                          fontSize: '13px',
                          color: colors.text,
                          backgroundColor: colors.surface,
                          fontFamily: 'inherit',
                          boxSizing: 'border-box',
                        }}
                        rows={2}
                        placeholder={obj.text}
                      />
                      {obj.description && (
                        <p style={{ fontSize: '11px', color: colors.text2, marginTop: '0.5rem', marginBottom: 0 }}>
                          Original: {obj.description}
                        </p>
                      )}
                    </div>

                    <div style={{ flexShrink: 0, width: '100px' }}>
                      <button
                        onClick={() => toggleObjectiveActive(obj.id)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          fontWeight: '600',
                          fontSize: '12px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: edited.isActive ? colors.teal.bg : '#ccc',
                          color: colors.text,
                        }}
                      >
                        {edited.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </div>
                  </div>

                  {isEdited && (
                    <div style={{ fontSize: '11px', color: colors.teal.accent, marginTop: '0.5rem' }}>
                      ✓ Modified
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', marginBottom: '0.5rem' }}>
          {className} — Customize Objectives
        </h2>
        <p style={{ color: colors.text2, fontSize: '14px' }}>
          Edit objective text or toggle to show/hide from students
        </p>
      </div>

      {/* Skill Standards */}
      {skillStandards.length > 0 && renderStandardSection(skillStandards, '🎯 Skill Standards', colors.teal)}

      {/* Content Standards by Unit */}
      {Object.entries(standardsByUnit).map(([unitName, unitStandards]) => (
        <div key={unitName} style={{ marginBottom: '2rem' }}>
          <h3
            style={{
              color: colors.text,
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '1rem',
              paddingLeft: '0.5rem',
              borderLeft: `3px solid ${colors.amber.accent}`,
            }}
          >
            {unitName}
          </h3>
          {unitStandards.map((standard) => (
            <div key={standard.standardId} style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <h4 style={{ color: colors.text, fontSize: '15px', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                  {standard.standardCode}: {standard.standardName}
                </h4>
                <p style={{ color: colors.text2, fontSize: '13px', margin: '0' }}>
                  {standard.objectives.length} objectives
                </p>
              </div>

              <div style={{ display: 'grid', gap: '0.75rem', marginLeft: '1rem', marginTop: '0.75rem' }}>
                {standard.objectives.map((obj) => {
                  const isEdited = changes.has(obj.id);
                  const edited = changes.get(obj.id) || obj;

                  return (
                    <div
                      key={obj.id}
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        border: `1px solid ${isEdited ? colors.teal.accent : colors.border}`,
                        backgroundColor: !edited.isActive ? '#f5f5f5' : colors.surface,
                        opacity: !edited.isActive ? 0.6 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ flexShrink: 0 }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '14px',
                              backgroundColor: colors.teal.bg,
                              color: colors.text,
                            }}
                          >
                            {obj.label}
                          </div>
                        </div>

                        <div style={{ flex: 1 }}>
                          <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                            Objective {obj.label}
                          </label>
                          <textarea
                            value={edited.customText || obj.text}
                            onChange={(e) => updateObjectiveText(obj.id, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              borderRadius: '4px',
                              border: `1px solid ${colors.border}`,
                              fontSize: '13px',
                              color: colors.text,
                              backgroundColor: colors.surface,
                              fontFamily: 'inherit',
                              boxSizing: 'border-box',
                            }}
                            rows={2}
                            placeholder={obj.text}
                          />
                          {obj.description && (
                            <p style={{ fontSize: '11px', color: colors.text2, marginTop: '0.5rem', marginBottom: 0 }}>
                              Original: {obj.description}
                            </p>
                          )}
                        </div>

                        <div style={{ flexShrink: 0, width: '100px' }}>
                          <button
                            onClick={() => toggleObjectiveActive(obj.id)}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              borderRadius: '4px',
                              fontWeight: '600',
                              fontSize: '12px',
                              border: 'none',
                              cursor: 'pointer',
                              backgroundColor: edited.isActive ? colors.teal.bg : '#ccc',
                              color: colors.text,
                            }}
                          >
                            {edited.isActive ? 'Active' : 'Hidden'}
                          </button>
                        </div>
                      </div>

                      {isEdited && (
                        <div style={{ fontSize: '11px', color: colors.teal.accent, marginTop: '0.5rem' }}>
                          ✓ Modified
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}

      {changes.size > 0 && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            display: 'flex',
            gap: '1rem',
          }}
        >
          <button
            onClick={saveChanges}
            disabled={saving}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '4px',
              fontWeight: '600',
              fontSize: '14px',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              backgroundColor: colors.teal.bg,
              color: colors.text,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving...' : `Save ${changes.size} Change${changes.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
}
