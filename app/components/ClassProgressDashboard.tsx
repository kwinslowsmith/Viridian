'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { colors } from '@/app/design/colors';
import { terminology } from '@/app/config/terminology';

interface DashboardData {
  classId: string;
  className: string;
  classOverallMastery: number;
  skills: Array<{
    id: string;
    name: string;
    category: string;
    classAverage: number;
  }>;
  objectives: Array<{
    id: string;
    skillId: string;
    skillName: string;
    text: string;
    description?: string;
    examples?: string;
    assessmentGuidance?: string;
    isMandatory: boolean;
    masteredCount: number;
    totalAttempts: number;
    masteryPercent: number;
  }>;
  studentMasteryGrid: Array<{
    studentId: string;
    skillMastery: Record<string, number>;
  }>;
  students: Array<{ id: string }>;
}

export function ClassProgressDashboard({ classId }: { classId: string }) {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedObjective, setExpandedObjective] = useState<string | null>(null);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/improv/classes/${classId}/progress-dashboard`);
        if (res.ok) {
          const dashData = await res.json();
          setData(dashData);

          // Fetch student names
          const names: Record<string, string> = {};
          for (const student of dashData.students || []) {
            try {
              const nameRes = await fetch(`/api/users/${student.id}`);
              if (nameRes.ok) {
                const nameData = await nameRes.json();
                names[student.id] = nameData.name || 'Unknown';
              }
            } catch (err) {
              console.error('Failed to fetch student name:', err);
            }
          }
          setStudentNames(names);
        }
      } catch (err) {
        console.error('Failed to fetch progress dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading class progress...</div>;
  }

  if (!data) {
    return <div style={{ color: colors.text2 }}>Failed to load class progress</div>;
  }

  const getMasteryColor = (percentage: number) => {
    if (percentage >= 75) return '#10b981'; // Green
    if (percentage >= 50) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const strugglingObjectives = data.objectives
    .filter(obj => obj.totalAttempts > 0 && obj.masteryPercent < 75)
    .sort((a, b) => a.masteryPercent - b.masteryPercent);

  return (
    <div style={{ maxWidth: '1200px' }}>
      <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', marginBottom: '1.5rem' }}>
        Class Progress Dashboard
      </h2>

      {/* Class Overview */}
      <div
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', margin: 0 }}>
            Class Mastery
          </h3>
          <span style={{ color: colors.text, fontSize: '24px', fontWeight: '700' }}>
            {data.classOverallMastery}%
          </span>
        </div>
        <div style={{ backgroundColor: colors.border, borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
          <div
            style={{
              backgroundColor: getMasteryColor(data.classOverallMastery),
              height: '100%',
              width: `${data.classOverallMastery}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <p style={{ color: colors.text2, fontSize: '12px', margin: '0.75rem 0 0 0' }}>
          {data.classOverallMastery >= 75
            ? '🎉 Excellent progress! Class is on track for mastery.'
            : data.classOverallMastery >= 50
              ? '📈 Good progress. Keep pushing toward mastery.'
              : '⚠️ Class needs support. Consider interventions for struggling skills.'}
        </p>
      </div>

      {/* Skills Overview Grid */}
      <div
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', margin: '0 0 1rem 0' }}>
          Mastery by Skill
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {data.skills.map(skill => (
            <div
              key={skill.id}
              style={{
                padding: '1rem',
                backgroundColor: colors.bg,
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
              }}
            >
              <p style={{ color: colors.text, fontSize: '13px', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                {skill.name}
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color: colors.text, fontSize: '18px', fontWeight: '700' }}>
                  {skill.classAverage}%
                </span>
                <span style={{ color: colors.text2, fontSize: '12px' }}>mastered</span>
              </div>
              <div style={{ backgroundColor: colors.border, borderRadius: '2px', height: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    backgroundColor: getMasteryColor(skill.classAverage),
                    height: '100%',
                    width: `${skill.classAverage}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Struggling Objectives - Need Reteaching */}
      {strugglingObjectives.length > 0 && (
        <div
          style={{
            backgroundColor: colors.surface,
            border: `2px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', margin: '0 0 1rem 0' }}>
            ⚠️ Objectives Needing Reteaching
          </h3>
          <p style={{ color: colors.text2, fontSize: '13px', margin: '0 0 1rem 0' }}>
            These objectives have &lt;75% mastery. Consider additional instruction or practice.
          </p>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {strugglingObjectives.map(obj => (
              <div
                key={obj.id}
                style={{
                  backgroundColor: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setExpandedObjective(expandedObjective === obj.id ? null : obj.id)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ color: colors.text, fontSize: '13px', fontWeight: '500', margin: 0 }}>
                      {obj.skillName} → {obj.text}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '12px' }}>
                      <span style={{ color: colors.text2 }}>
                        {obj.masteredCount} of {obj.totalAttempts} mastered
                      </span>
                      <span style={{ color: getMasteryColor(obj.masteryPercent), fontWeight: '600' }}>
                        {obj.masteryPercent}%
                      </span>
                    </div>
                  </div>
                  <span style={{ color: colors.text2, marginLeft: '1rem' }}>
                    {expandedObjective === obj.id ? '▼' : '▶'}
                  </span>
                </button>

                {expandedObjective === obj.id && (
                  <div style={{ padding: '1rem', borderTop: `1px solid ${colors.border}`, backgroundColor: colors.surface }}>
                    {obj.description && (
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>
                          What You're Working Toward
                        </p>
                        <p style={{ color: colors.text, fontSize: '13px', margin: '0.5rem 0 0 0' }}>
                          {obj.description}
                        </p>
                      </div>
                    )}

                    {obj.assessmentGuidance && (
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>
                          Success Criteria & Guidance
                        </p>
                        <p style={{ color: colors.text, fontSize: '13px', margin: '0.5rem 0 0 0' }}>
                          {obj.assessmentGuidance.startsWith('http') ? (
                            <a
                              href={obj.assessmentGuidance}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: colors.teal.accent, textDecoration: 'underline' }}
                            >
                              View rubric →
                            </a>
                          ) : (
                            obj.assessmentGuidance
                          )}
                        </p>
                      </div>
                    )}

                    {obj.isMandatory && (
                      <div
                        style={{
                          padding: '0.75rem',
                          backgroundColor: colors.teal.accent + '20',
                          borderLeft: `3px solid ${colors.teal.accent}`,
                          borderRadius: '4px',
                        }}
                      >
                        <p style={{ color: colors.text, fontSize: '12px', margin: 0, fontWeight: '500' }}>
                          💡 This is a core skill. Prioritize reteaching.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Objectives Reference */}
      <div
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          padding: '1.5rem',
        }}
      >
        <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', margin: '0 0 1rem 0' }}>
          All Objectives Reference
        </h3>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {data.objectives.map(obj => (
            <div key={obj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: colors.bg, borderRadius: '4px' }}>
              <div>
                <p style={{ color: colors.text, fontSize: '13px', fontWeight: '500', margin: 0 }}>
                  {obj.skillName} → {obj.text}
                </p>
              </div>
              <span style={{ color: colors.text, fontSize: '12px', fontWeight: '600', minWidth: '60px', textAlign: 'right' }}>
                {obj.totalAttempts > 0 ? `${obj.masteryPercent}%` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
