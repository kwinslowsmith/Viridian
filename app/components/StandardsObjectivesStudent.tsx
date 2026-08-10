'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface StudentProgress {
  masteryStatus: 'proficient' | 'developing' | 'approaching' | 'needs_support';
  masteryPercent: number;
  submittedAt: string | null;
  grade: string | null;
  submissions: Array<{
    id: string;
    score: number;
    feedback: string;
    submittedAt: string;
  }>;
}

interface Material {
  id: string;
  title: string;
  type: 'material' | 'assessment' | 'video' | 'link';
  url: string;
  uploadedAt: string;
}

interface Objective {
  objectiveId: string;
  label: string;
  text: string;
  description: string;
  sequenceNum: number;
  isMandatory: boolean;
  studentProgress: StudentProgress;
  materials: Material[];
  teacherNotes: string;
  masterySummary: string;
}

interface Standard {
  standardId: string;
  standardCode: string;
  standardName: string;
  unitId: string;
  unitName: string;
  description: string;
  requiredObjectiveCount: number;
  totalObjectiveCount: number;
  classPassPercentage: number;
  standardMasteryPercent: number;
  standardMasteryStatus: 'proficient' | 'developing' | 'approaching' | 'needs_support';
  objectives: Objective[];
}

interface StandardsObjectivesData {
  standards: Standard[];
}

const getMasteryColor = (status: string) => {
  switch (status) {
    case 'proficient':
      return '#10b981';
    case 'developing':
      return '#f59e0b';
    case 'approaching':
      return '#ef4444';
    case 'needs_support':
      return '#dc2626';
    default:
      return '#6b7280';
  }
};

const getMasteryLabel = (status: string) => {
  switch (status) {
    case 'proficient':
      return '✓ Proficient';
    case 'developing':
      return '⏳ Developing';
    case 'approaching':
      return '⚠️ Approaching';
    case 'needs_support':
      return '❌ Needs Support';
    default:
      return 'Unknown';
  }
};

export function StandardsObjectivesStudent({ classId }: { classId: string }) {
  const { data: session } = useSession();
  const [data, setData] = useState<StandardsObjectivesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStandards, setExpandedStandards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!session?.user?.id) {
          setLoading(false);
          return;
        }

        // TODO: Replace with actual API call when T1 provides endpoint
        // const res = await fetch(
        //   `/api/k12/classes/${classId}/standards-objectives-student?studentId=${session.user.id}`
        // );
        // if (res.ok) {
        //   const result = await res.json();
        //   setData(result);
        // } else {
        //   setError('Failed to load standards and objectives');
        // }

        // For now, use mock data
        const { mockStudentStandardsObjectives } = await import('@/mocks/k12-api-responses');
        setData(mockStudentStandardsObjectives);
      } catch (err) {
        console.error('Failed to fetch standards and objectives:', err);
        setError('Failed to load standards and objectives');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId, session?.user?.id]);

  const toggleStandard = (standardId: string) => {
    const newExpanded = new Set(expandedStandards);
    if (newExpanded.has(standardId)) {
      newExpanded.delete(standardId);
    } else {
      newExpanded.add(standardId);
    }
    setExpandedStandards(newExpanded);
  };

  if (loading) {
    return <div style={{ padding: '20px', color: '#666' }}>Loading standards and objectives...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: '#dc2626' }}>Error: {error}</div>;
  }

  if (!data || data.standards.length === 0) {
    return <div style={{ padding: '20px', color: '#666' }}>No standards available yet.</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#1c1917' }}>
        Standards & Objectives
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {data.standards.map((standard) => {
          const isExpanded = expandedStandards.has(standard.standardId);
          const statusColor = getMasteryColor(standard.standardMasteryStatus);

          return (
            <div
              key={standard.standardId}
              style={{
                backgroundColor: '#fff',
                borderRadius: '10px',
                border: '1px solid #e5e0d8',
                overflow: 'hidden',
              }}
            >
              {/* Standard Header */}
              <div
                onClick={() => toggleStandard(standard.standardId)}
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  backgroundColor: isExpanded ? '#f9f7f4' : '#fff',
                  borderBottom: isExpanded ? '1px solid #e5e0d8' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ fontSize: '18px', marginTop: '4px' }}>
                    {isExpanded ? '▼' : '▶'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1c1917', margin: '0' }}>
                          {standard.standardCode}: {standard.standardName}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>
                          📚 {standard.unitName}
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#666', margin: '8px 0' }}>
                      {standard.description}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          backgroundColor: '#f0fdf4',
                          borderRadius: '6px',
                          border: `2px solid ${statusColor}`,
                        }}
                      >
                        <div
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: statusColor,
                          }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#1c1917' }}>
                          Your Mastery: {standard.standardMasteryPercent}% {getMasteryLabel(standard.standardMasteryStatus)}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        Required: {standard.requiredObjectiveCount} | Available: {standard.totalObjectiveCount}
                      </span>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        Pass: {standard.classPassPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Objectives */}
              {isExpanded && (
                <div style={{ backgroundColor: '#fafaf7', paddingTop: '0' }}>
                  {standard.objectives.map((objective, idx) => {
                    const statusColor = getMasteryColor(objective.studentProgress.masteryStatus);

                    return (
                      <div
                        key={objective.objectiveId}
                        style={{
                          padding: '16px',
                          borderTop: idx > 0 ? '1px solid #e5e0d8' : 'none',
                          backgroundColor: idx % 2 === 0 ? '#fafaf7' : '#fff',
                        }}
                      >
                        {/* Objective Header */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                            <div
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: statusColor,
                                flexShrink: 0,
                              }}
                            />
                            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1c1917', margin: '0', flex: 1 }}>
                              {objective.label} - {objective.text}
                            </h4>
                            {objective.isMandatory ? (
                              <span
                                style={{
                                  display: 'inline-block',
                                  backgroundColor: '#3b82f6',
                                  color: '#fff',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: '600',
                                }}
                              >
                                REQUIRED
                              </span>
                            ) : (
                              <span
                                style={{
                                  display: 'inline-block',
                                  backgroundColor: '#8b5cf6',
                                  color: '#fff',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: '600',
                                }}
                              >
                                OPTIONAL
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>
                            {objective.description}
                          </p>
                        </div>

                        {/* Student Status */}
                        <div
                          style={{
                            backgroundColor: '#f0fdf4',
                            borderRadius: '6px',
                            padding: '12px',
                            marginBottom: '12px',
                            border: `1px solid ${statusColor}`,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#1c1917' }}>
                              Your Status: {getMasteryLabel(objective.studentProgress.masteryStatus)}
                            </span>
                            <span style={{ fontSize: '13px', color: '#666' }}>
                              ({objective.studentProgress.masteryPercent}%)
                            </span>
                          </div>
                          {objective.studentProgress.grade && (
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                              Grade: <span style={{ fontWeight: '600' }}>{objective.studentProgress.grade}</span>
                            </div>
                          )}
                          {objective.studentProgress.submittedAt && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              Last Submitted: {new Date(objective.studentProgress.submittedAt).toLocaleDateString()}
                            </div>
                          )}
                          {objective.studentProgress.submissions.length > 0 && (
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
                              💬 {objective.studentProgress.submissions[0].feedback}
                            </div>
                          )}
                        </div>

                        {/* Mastery Summary */}
                        {objective.masterySummary && (
                          <div
                            style={{
                              backgroundColor: '#fef3c7',
                              borderRadius: '6px',
                              padding: '12px',
                              marginBottom: '12px',
                              borderLeft: `4px solid #fcd34d`,
                              fontSize: '12px',
                              color: '#666',
                            }}
                          >
                            {objective.masterySummary}
                          </div>
                        )}

                        {/* Materials */}
                        {objective.materials.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#1c1917', marginBottom: '8px' }}>
                              📎 Materials:
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {objective.materials.map((material) => (
                                <a
                                  key={material.id}
                                  href={material.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    color: '#2563eb',
                                    textDecoration: 'none',
                                    border: '1px solid #e5e7eb',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  {material.title} ↗
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Teacher Notes */}
                        {objective.teacherNotes && (
                          <div
                            style={{
                              backgroundColor: '#f0f9ff',
                              borderRadius: '6px',
                              padding: '12px',
                              borderLeft: `4px solid #0284c7`,
                              fontSize: '12px',
                              color: '#666',
                            }}
                          >
                            <div style={{ fontWeight: '600', color: '#1c1917', marginBottom: '4px' }}>
                              📝 Teacher Notes:
                            </div>
                            {objective.teacherNotes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
