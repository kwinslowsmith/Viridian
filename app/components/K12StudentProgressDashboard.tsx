'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Skill {
  id: string;
  label: string;
  text: string;
  masteryPercent: number;
  status: string;
  trend: string;
  lastActivityAt: string | null;
  nextDeadlineAt: string | null;
  isMandatory: boolean;
}

interface Standard {
  id: string;
  name: string;
  description: string;
  passPercentage: number;
  skills: Skill[];
}

interface ProgressData {
  student: { id: string; name: string };
  class: { id: string; name: string };
  standards: Standard[];
}

const getProgressColor = (percent: number) => {
  if (percent >= 75) return '#22c55e'; // green
  if (percent >= 50) return '#eab308'; // yellow
  return '#ef4444'; // red
};

const getProgressBackground = (percent: number) => {
  if (percent >= 75) return '#dcfce7'; // light green
  if (percent >= 50) return '#fef3c7'; // light yellow
  return '#fee2e2'; // light red
};

export function K12StudentProgressDashboard({ classId }: { classId: string }) {
  const { data: session } = useSession();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStandard, setExpandedStandard] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/k12-classes/${classId}/student-progress`);
        if (res.ok) {
          const data = await res.json();
          setProgress(data);
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [classId]);

  if (loading) {
    return <div style={{ padding: '20px', color: '#666' }}>Loading your progress...</div>;
  }

  if (!progress) {
    return <div style={{ padding: '20px', color: '#666' }}>No progress data found</div>;
  }

  const { student, class: cls, standards } = progress;

  // Calculate overall mastery
  const allSkills = standards.flatMap((s) => s.skills);
  const masteredSkills = allSkills.filter((s) => s.masteryPercent >= 80).length;
  const overallMastery = allSkills.length > 0 ? Math.round((masteredSkills / allSkills.length) * 100) : 0;

  // Find newly mastered skills (for celebration)
  const masteredSkillsList = allSkills.filter((s) => s.masteryPercent === 100);

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1c1917' }}>
          Your Progress
        </h1>
        <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>
          {cls.name}
        </p>
      </div>

      {/* Overall Progress Card */}
      <div
        style={{
          backgroundColor: '#f5f5f0',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid #e5e0d8',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
          OVERALL PROGRESS
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                height: '12px',
                backgroundColor: '#e5e0d8',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  backgroundColor: getProgressColor(overallMastery),
                  width: `${overallMastery}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1c1917', minWidth: '45px' }}>
            {overallMastery}%
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
          {masteredSkills} of {allSkills.length} skills mastered
        </div>
      </div>

      {/* Celebrations */}
      {masteredSkillsList.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          {masteredSkillsList.map((skill) => (
            <div
              key={skill.id}
              style={{
                backgroundColor: '#fef3c7',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                border: '2px solid #fcd34d',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1c1917' }}>
                You mastered: <strong>{skill.label}</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Excellent work! Keep it up!
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Standards List */}
      <div>
        {standards.map((standard) => (
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
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  {standard.skills.filter((s) => s.masteryPercent >= 80).length}/{standard.skills.length} mastered
                </div>
              </div>
              <div style={{ fontSize: '14px', color: '#999' }}>
                {expandedStandard === standard.id ? '▼' : '▶'}
              </div>
            </div>

            {/* Skills List */}
            {expandedStandard === standard.id && (
              <div style={{ backgroundColor: '#fafaf7', borderTop: '1px solid #e5e0d8' }}>
                {standard.skills.map((skill, idx) => (
                  <div
                    key={skill.id}
                    style={{
                      padding: '12px 16px',
                      borderTop: idx > 0 ? '1px solid #e5e0d8' : 'none',
                      backgroundColor: skill.masteryPercent >= 80 ? '#f0fdf4' : '#fafaf7',
                    }}
                  >
                    {/* Skill Label */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: skill.isMandatory ? '600' : '500',
                            color: '#1c1917',
                            fontSize: '13px',
                          }}
                        >
                          {skill.label}
                          {skill.isMandatory && (
                            <span style={{ marginLeft: '6px', color: '#3b82f6', fontSize: '10px' }}>
                              CORE
                            </span>
                          )}
                        </div>
                        {skill.lastActivityAt && (
                          <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                            Last activity: {new Date(skill.lastActivityAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '16px', color: '#999' }}>
                        {skill.trend}
                      </div>
                    </div>

                    {/* Progress Bar */}
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
                            backgroundColor: getProgressColor(skill.masteryPercent),
                            width: `${skill.masteryPercent}%`,
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#1c1917',
                          minWidth: '32px',
                          textAlign: 'right',
                        }}
                      >
                        {skill.masteryPercent}%
                      </div>
                    </div>

                    {/* Status Text */}
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#666',
                        marginTop: '6px',
                      }}
                    >
                      {skill.status === 'Mastered' && '✓ Mastered'}
                      {skill.status === 'In Progress' && 'In Progress'}
                      {skill.status === 'Not Started' && 'Not Started'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {standards.length === 0 && (
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
      )}
    </div>
  );
}
