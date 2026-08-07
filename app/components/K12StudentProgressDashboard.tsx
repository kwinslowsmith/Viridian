'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Objective {
  id: string;
  text: string;
  status: 'not-started' | 'in-progress' | 'mastered';
  isMandatory: boolean;
  submittedAt: string | null;
  grade: number | null;
}

interface Celebration {
  objectiveId: string;
  objectiveText: string;
  celebrationType: 'mastered' | 'first-submission' | 'high-score';
  message: string;
  timestamp: string;
}

interface Standard {
  id: string;
  name: string;
  code: string;
  masteryPercent: number;
  status: 'not-started' | 'in-progress' | 'mastered';
  trend: 'up' | 'stable' | 'down';
  objectives: Objective[];
  celebration: Celebration | null;
}

interface ProgressData {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  standards: Standard[];
  messageFromTeacher?: string;
}

const getProgressColor = (percent: number) => {
  if (percent >= 75) return '#10b981'; // green
  if (percent >= 50) return '#f59e0b'; // yellow
  return '#ef4444'; // red
};

const getProgressBackground = (percent: number) => {
  if (percent >= 75) return '#ecfdf5'; // light green
  if (percent >= 50) return '#fffbeb'; // light yellow
  return '#fef2f2'; // light red
};

const getStatusLabel = (percent: number) => {
  if (percent >= 75) return 'On track!';
  if (percent >= 50) return 'Almost there';
  return 'Just started';
};

const getTrendIcon = (trend: string) => {
  if (trend === 'up') return '↑';
  if (trend === 'down') return '↓';
  return '=';
};

export function K12StudentProgressDashboard({ classId }: { classId: string }) {
  const { data: session } = useSession();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStandard, setExpandedStandard] = useState<string | null>(null);
  const [dismissedCelebration, setDismissedCelebration] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        if (!session?.user?.id) {
          setLoading(false);
          return;
        }
        const res = await fetch(
          `/api/k12/classes/${classId}/student-progress?studentId=${session.user.id}`
        );
        if (res.ok) {
          const data = await res.json();
          setProgress(data);
        } else if (res.status === 404) {
          console.log('No progress data available yet');
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [classId, session?.user?.id]);

  // Auto-dismiss celebration after 3 seconds
  useEffect(() => {
    if (progress && dismissedCelebration === null) {
      const celebration = progress.standards.find(s => s.celebration)?.celebration;
      if (celebration) {
        const timer = setTimeout(() => {
          setDismissedCelebration(celebration.objectiveId);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [progress, dismissedCelebration]);

  if (loading) {
    return <div style={{ padding: '20px', color: '#666' }}>Loading your progress...</div>;
  }

  if (!progress) {
    return <div style={{ padding: '20px', color: '#666' }}>No progress data found</div>;
  }

  const { studentName, className, standards, messageFromTeacher } = progress;

  // Calculate overall mastery
  const allObjectives = standards.flatMap((s) => s.objectives);
  const masteredObjectives = allObjectives.filter((o) => o.status === 'mastered').length;
  const overallMastery = allObjectives.length > 0 ? Math.round((masteredObjectives / allObjectives.length) * 100) : 0;

  // Find celebration
  const activeCelebration = progress.standards.find(s => s.celebration && s.celebration.objectiveId !== dismissedCelebration)?.celebration;

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1c1917' }}>
          {studentName}
        </h1>
        <p style={{ fontSize: '14px', color: '#666', margin: '0 0 8px 0' }}>
          {className}
        </p>
        {messageFromTeacher && (
          <p style={{ fontSize: '13px', color: '#666', margin: '0', fontStyle: 'italic' }}>
            📝 {messageFromTeacher}
          </p>
        )}
      </div>

      {/* Celebration Banner */}
      {activeCelebration && (
        <div
          style={{
            backgroundColor: '#fef3c7',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            border: '2px solid #fcd34d',
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1c1917', marginBottom: '4px' }}>
            {activeCelebration.message}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            You've mastered: {activeCelebration.objectiveText}
          </div>
        </div>
      )}

      {/* Standards Grid */}
      <div>
        {standards.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              backgroundColor: '#fafaf7',
              borderRadius: '12px',
              color: '#999',
            }}
          >
            No standards in this class yet. Check back soon!
          </div>
        ) : (
          standards.map((standard) => {
            const masteredCount = standard.objectives.filter(o => o.status === 'mastered').length;
            const standardMastery = standard.masteryPercent;
            const statusLabel = getStatusLabel(standardMastery);

            return (
              <div
                key={standard.id}
                style={{
                  marginBottom: '12px',
                  borderRadius: '10px',
                  border: '1px solid #e5e0d8',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                }}
              >
                {/* Standard Header */}
                <div
                  onClick={() =>
                    setExpandedStandard(expandedStandard === standard.id ? null : standard.id)
                  }
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    backgroundColor: expandedStandard === standard.id ? '#f9f7f4' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#1c1917', fontSize: '14px' }}>
                      {standard.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                      {standard.code}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {masteredCount}/{standard.objectives.length} objectives mastered
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#999', marginLeft: '8px' }}>
                    {expandedStandard === standard.id ? '▼' : '▶'}
                  </div>
                </div>

                {/* Progress Bar and Status */}
                <div style={{ padding: '8px 16px', backgroundColor: getProgressBackground(standardMastery) }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: '8px',
                        backgroundColor: '#e5e0d8',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          backgroundColor: getProgressColor(standardMastery),
                          width: `${standardMastery}%`,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#1c1917',
                        minWidth: '35px',
                        textAlign: 'right',
                      }}
                    >
                      {standardMastery}%
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      {getTrendIcon(standard.trend)}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
                    {statusLabel}
                  </div>
                </div>

                {/* Objectives List */}
                {expandedStandard === standard.id && (
                  <div style={{ backgroundColor: '#fafaf7', borderTop: '1px solid #e5e0d8' }}>
                    {standard.objectives.map((objective, idx) => {
                      const statusDotColor =
                        objective.status === 'mastered'
                          ? '#10b981'
                          : objective.status === 'in-progress'
                            ? '#f59e0b'
                            : '#d1d5db';

                      return (
                        <div
                          key={objective.id}
                          style={{
                            padding: '12px 16px',
                            borderTop: idx > 0 ? '1px solid #e5e0d8' : 'none',
                            backgroundColor: objective.status === 'mastered' ? '#f0fdf4' : '#fafaf7',
                          }}
                        >
                          {/* Objective with Badge */}
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            {/* Status Dot */}
                            <div
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: statusDotColor,
                                flexShrink: 0,
                                marginTop: '2px',
                              }}
                            />

                            {/* Objective Text and Badge */}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', color: '#1c1917', marginBottom: '4px' }}>
                                {objective.text}
                              </div>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {objective.isMandatory && (
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
                                    Core Skill
                                  </span>
                                )}
                                {!objective.isMandatory && (
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
                                    Challenge
                                  </span>
                                )}
                                {objective.grade !== null && (
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      backgroundColor: '#e5e7eb',
                                      color: '#374151',
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      fontSize: '10px',
                                      fontWeight: '600',
                                    }}
                                  >
                                    Grade: {objective.grade}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
