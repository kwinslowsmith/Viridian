'use client';

import React, { useState, useEffect } from 'react';

// Color system from Viridian design
const colors = {
  teal: {
    accent: '#0D9488',
    bg: '#F0FDFA',
    dark: '#134E4A',
  },
  grey: {
    bg: '#F3F4F6',
    border: '#E5E7EB',
    text: '#6B7280',
  },
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
  },
  white: '#FFFFFF',
};

interface SelectedState {
  unitId: string | null;
  standardId: string | null;
}

interface ViewMode {
  mode: 'teacher' | 'student';
}

interface Unit {
  id: string;
  name: string;
  standards: any[];
}

export function K12StandardsHierarchy({ classId, className }: { classId: string; className: string }) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedState>({ unitId: null, standardId: null });
  const [viewMode, setViewMode] = useState<ViewMode['mode']>('teacher');
  const [activeToggles, setActiveToggles] = useState<Set<string>>(new Set());
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchStandards = async () => {
      try {
        const res = await fetch(`/api/k12-classes/${classId}/standards-by-unit?view=${viewMode}`);
        if (!res.ok) throw new Error('Failed to fetch standards');
        const data = await res.json();
        setUnits(data.units || []);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };
    fetchStandards();
  }, [classId, viewMode]);

  const currentUnit = units.find(u => u.id === selected.unitId);
  const currentStandard = currentUnit?.standards.find(s => s.id === selected.standardId);

  const toggleObjective = (objId: string) => {
    const newToggles = new Set(activeToggles);
    if (newToggles.has(objId)) {
      newToggles.delete(objId);
    } else {
      newToggles.add(objId);
    }
    setActiveToggles(newToggles);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.grey.bg, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: colors.text.secondary }}>Loading standards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.grey.bg, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#EF4444' }}>Error loading standards: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.grey.bg, padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: colors.text.primary, margin: 0 }}>
            {className} — Customize Standards
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setViewMode('teacher')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'teacher' ? colors.teal.accent : colors.grey.border,
                color: colors.white,
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Teacher View
            </button>
            <button
              onClick={() => setViewMode('student')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'student' ? colors.teal.accent : colors.grey.border,
                color: colors.white,
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Student View
            </button>
          </div>
        </div>
        <p style={{ fontSize: '14px', color: colors.text.secondary, margin: 0 }}>
          {viewMode === 'teacher' ? 'Click units to expand, then EKs to see objectives' : 'View activated standards and objectives'}
        </p>
      </div>

      {/* Three-Panel Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 1fr', gap: '1.5rem', minHeight: '600px' }}>
        {/* LEFT PANEL: Units */}
        <div
          style={{
            backgroundColor: colors.white,
            borderRadius: '8px',
            border: `1px solid ${colors.grey.border}`,
            padding: '1rem',
            overflowY: 'auto',
          }}
        >
          <h3 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: colors.text.secondary, margin: '0 0 1rem 0' }}>
            Units ({units.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {units.length === 0 ? (
              <p style={{ fontSize: '12px', color: colors.text.secondary, margin: 0 }}>No standards assigned yet</p>
            ) : (
              units.map(unit => (
                <button
                  key={unit.id}
                  onClick={() => setSelected({ unitId: unit.id, standardId: null })}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: selected.unitId === unit.id ? colors.teal.accent : 'transparent',
                    color: selected.unitId === unit.id ? colors.white : colors.text.primary,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: selected.unitId === unit.id ? '600' : '500',
                    transition: 'all 0.2s',
                  }}
                >
                  {unit.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* MIDDLE PANEL: Standards/EKs */}
        <div
          style={{
            backgroundColor: colors.white,
            borderRadius: '8px',
            border: `1px solid ${colors.grey.border}`,
            padding: '1rem',
            overflowY: 'auto',
          }}
        >
          {!selected.unitId ? (
            <div style={{ color: colors.text.secondary, textAlign: 'center', paddingTop: '2rem' }}>
              <p>Select a unit to view standards</p>
            </div>
          ) : (
            <>
              <h3 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: colors.text.secondary, margin: '0 0 1rem 0' }}>
                Essential Knowledge
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {currentUnit?.standards.map(standard => (
                  <button
                    key={standard.id}
                    onClick={() => setSelected({ unitId: selected.unitId, standardId: standard.id })}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: selected.standardId === standard.id ? `2px solid ${colors.teal.accent}` : `1px solid ${colors.grey.border}`,
                      backgroundColor: selected.standardId === standard.id ? colors.teal.bg : colors.grey.bg,
                      color: colors.text.primary,
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <strong>{standard.code}</strong> — {standard.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* RIGHT PANEL: Objectives */}
        <div
          style={{
            backgroundColor: colors.white,
            borderRadius: '8px',
            border: `1px solid ${colors.grey.border}`,
            padding: '1rem',
            overflowY: 'auto',
          }}
        >
          {!selected.standardId ? (
            <div style={{ color: colors.text.secondary, textAlign: 'center', paddingTop: '2rem' }}>
              <p>Select a standard to view objectives</p>
            </div>
          ) : (
            <>
              <h3 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: colors.text.secondary, margin: '0 0 1rem 0' }}>
                Objectives
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {currentStandard?.objectives.map((obj: any) => {
                  const isActive = activeToggles.has(obj.id);
                  const isInactive = viewMode === 'student' && !isActive;

                  return (
                    <div
                      key={obj.id}
                      style={{
                        padding: '1rem',
                        borderRadius: '6px',
                        border: `1px solid ${colors.grey.border}`,
                        backgroundColor: isInactive ? '#f5f5f5' : colors.white,
                        opacity: isInactive ? 0.6 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        {/* Label Circle */}
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: colors.teal.bg,
                            color: colors.teal.accent,
                            fontWeight: 'bold',
                            fontSize: '14px',
                            flexShrink: 0,
                          }}
                        >
                          {obj.label}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: colors.text.secondary }}>
                              Objective {obj.label}
                              {obj.mandatory && <span style={{ color: colors.teal.accent, marginLeft: '0.5rem' }}>●</span>}
                            </label>
                            {viewMode === 'teacher' && (
                              <button
                                onClick={() => toggleObjective(obj.id)}
                                style={{
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '4px',
                                  border: 'none',
                                  backgroundColor: isActive ? colors.teal.accent : '#d1d5db',
                                  color: colors.white,
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                }}
                              >
                                {isActive ? 'Active' : 'Hidden'}
                              </button>
                            )}
                          </div>
                          <p style={{ fontSize: '13px', color: colors.text.primary, margin: '0 0 0.5rem 0' }}>
                            {obj.text}
                          </p>
                          {viewMode === 'teacher' && (
                            <>
                              <textarea
                                placeholder="Add teacher notes..."
                                value={descriptions[obj.id] || ''}
                                onChange={e => setDescriptions({ ...descriptions, [obj.id]: e.target.value })}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  borderRadius: '4px',
                                  border: `1px solid ${colors.grey.border}`,
                                  fontSize: '12px',
                                  fontFamily: 'inherit',
                                  marginBottom: '0.5rem',
                                  boxSizing: 'border-box',
                                }}
                                rows={2}
                              />
                              <button
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  borderRadius: '4px',
                                  border: `1px solid ${colors.grey.border}`,
                                  backgroundColor: colors.grey.bg,
                                  color: colors.text.primary,
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                }}
                              >
                                📎 Upload Google Doc
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {viewMode === 'teacher' && (
                  <button
                    style={{
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: `2px dashed ${colors.teal.accent}`,
                      backgroundColor: colors.teal.bg,
                      color: colors.teal.accent,
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginTop: '0.5rem',
                    }}
                  >
                    + Add Objective
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      {viewMode === 'teacher' && (
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: colors.teal.accent,
              color: colors.white,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
            }}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
