'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/app/design/colors';

interface StandardsObjectivesTeacherProps {
  classId: string;
}

export function StandardsObjectivesTeacher({ classId }: StandardsObjectivesTeacherProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStandards, setExpandedStandards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/k12/classes/${classId}/standards-objectives-teacher`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch standards and objectives');
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  const toggleStandard = (standardId: string) => {
    const newExpanded = new Set(expandedStandards);
    if (newExpanded.has(standardId)) {
      newExpanded.delete(standardId);
    } else {
      newExpanded.add(standardId);
    }
    setExpandedStandards(newExpanded);
  };

  const getMasteryColor = (status: string) => {
    switch (status) {
      case 'proficient':
        return '#10b981';
      case 'developing':
        return '#f59e0b';
      case 'approaching':
        return '#f97316';
      default:
        return '#9ca3af';
    }
  };

  const getMasteryIcon = (status: string) => {
    switch (status) {
      case 'proficient':
        return '✓';
      case 'developing':
        return '⏳';
      case 'approaching':
        return '⚠️';
      default:
        return '○';
    }
  };

  if (loading) {
    return <div style={{ padding: '24px', color: colors.text2 }}>Loading standards and objectives...</div>;
  }

  if (error) {
    return <div style={{ padding: '24px', color: '#ef4444' }}>Error: {error}</div>;
  }

  if (!data || !data.standards) {
    return <div style={{ padding: '24px', color: colors.text2 }}>No standards available</div>;
  }

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>
          📚 Standards & Objectives
        </h1>

        {data.standards.map((standard: any) => (
          <div
            key={standard.standardId}
            style={{
              backgroundColor: colors.surface,
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px',
              border: `1px solid ${colors.border}`,
            }}
          >
            {/* Standard Header */}
            <button
              onClick={() => toggleStandard(standard.standardId)}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                padding: '0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '18px', color: colors.text2 }}>
                  {expandedStandards.has(standard.standardId) ? '▼' : '▶'}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px' }}>
                    {standard.standardCode}: {standard.standardName}
                  </h2>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: colors.text2 }}>
                    <span>📚 {standard.unitName || 'No unit'}</span>
                    <span>Required: {standard.requiredObjectiveCount} | Total: {standard.totalObjectiveCount}</span>
                    <span>Pass: {standard.classPassPercentage}%</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {expandedStandards.has(standard.standardId) && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${colors.border}` }}>
                {standard.description && (
                  <p style={{ color: colors.text2, fontSize: '13px', marginBottom: '16px', fontStyle: 'italic' }}>
                    {standard.description}
                  </p>
                )}

                {/* Objectives */}
                {standard.objectives.map((objective: any, idx: number) => (
                  <div
                    key={objective.objectiveId}
                    style={{
                      backgroundColor: colors.bg,
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: idx === standard.objectives.length - 1 ? '0' : '12px',
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    {/* Objective Header */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ color: colors.text, fontSize: '15px', fontWeight: '600', margin: 0 }}>
                          {objective.label} - {objective.text}
                        </h3>
                        <span
                          style={{
                            backgroundColor: objective.isMandatory ? '#ef4444' : '#9ca3af',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                          }}
                        >
                          {objective.isMandatory ? 'REQUIRED' : 'OPTIONAL'}
                        </span>
                      </div>
                      {objective.description && (
                        <p style={{ color: colors.text3, fontSize: '12px', margin: '4px 0 0' }}>
                          {objective.description}
                        </p>
                      )}
                    </div>

                    {/* Assessment Frequency Warning */}
                    {objective.needsAssessmentFrequency && (
                      <div
                        style={{
                          backgroundColor: '#fef3c7',
                          borderLeft: '4px solid #f59e0b',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          marginBottom: '12px',
                          fontSize: '12px',
                          color: '#92400e',
                        }}
                      >
                        ⚠️ Needs Assessment (last assessed {objective.assessmentFrequencyMetric?.lastAssessedDaysAgo} days ago)
                      </div>
                    )}

                    {/* Student Progress Grid */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: colors.text2, marginBottom: '8px' }}>
                        📊 Student Progress:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
                        {objective.studentProgress.map((student: any) => (
                          <div
                            key={student.studentId}
                            style={{
                              backgroundColor: colors.bg,
                              border: `1px solid ${colors.border}`,
                              borderRadius: '6px',
                              padding: '8px',
                              fontSize: '12px',
                            }}
                          >
                            <div style={{ fontWeight: '600', color: colors.text }}>{student.studentName}</div>
                            <div style={{ color: getMasteryColor(student.masteryStatus), fontWeight: 'bold' }}>
                              {getMasteryIcon(student.masteryStatus)} {student.masteryPercent}%
                            </div>
                            {student.grade && (
                              <div style={{ color: colors.text3, fontSize: '11px' }}>Grade: {student.grade}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Materials */}
                    {objective.materials && objective.materials.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: colors.text2, marginBottom: '6px' }}>
                          📎 Materials:
                        </div>
                        {objective.materials.map((material: any) => (
                          <div
                            key={material.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              backgroundColor: colors.bg,
                              border: `1px solid ${colors.border}`,
                              borderRadius: '4px',
                              padding: '8px',
                              marginBottom: '4px',
                              fontSize: '12px',
                            }}
                          >
                            <span>
                              {material.type === 'material' && '📄'}
                              {material.type === 'assessment' && '📝'}
                              {material.type === 'video' && '🎥'}
                              {material.type === 'link' && '🔗'} {material.title}
                            </span>
                            <button
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                            >
                              View
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Teacher Notes */}
                    {objective.teacherNotes && (
                      <div style={{ marginBottom: '0' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: colors.text2, marginBottom: '6px' }}>
                          📝 Teacher Notes:
                        </div>
                        <div
                          style={{
                            backgroundColor: colors.bg,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '4px',
                            padding: '8px',
                            fontSize: '12px',
                            color: colors.text2,
                            fontStyle: 'italic',
                          }}
                        >
                          {objective.teacherNotes}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
