'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Assessment {
  id: string;
  skillName: string;
  skillCategory: string;
  currentLevel: number | null;
  levelDefinitions: Record<string, string>;
  history: Array<{ date: string; studentSelfLevel: number; teacherLevel: number | null }>;
  teacherNote?: string;
}

interface ProgressData {
  student: { id: string; name: string };
  class: { id: string; name: string };
  assessments: Assessment[];
  summary: {
    masteryPercent: number;
    totalSkillsRated: number;
    proficient: number;
    advanced: number;
    developing: number;
    approaching: number;
  };
}

const levelColors = {
  1: '#fff7ed',
  2: '#fefce8',
  3: '#f0fdf4',
  4: '#e0f2fe',
};

const levelTextColors = {
  1: '#c2410c',
  2: '#a16207',
  3: '#166534',
  4: '#0369a1',
};

const levelLabels = ['', 'Approaching', 'Developing', 'Proficient', 'Advanced'];

export function StudentProgressDashboard({ classId, studentId }: { classId: string; studentId: string }) {
  const { data: session } = useSession();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/improv/classes/${classId}/students/${studentId}/progress`);
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
  }, [classId, studentId]);

  if (loading) {
    return <div style={{ padding: '20px', color: '#666' }}>Loading progress...</div>;
  }

  if (!progress) {
    return <div style={{ padding: '20px', color: '#666' }}>No progress data found</div>;
  }

  const { student, class: cls, assessments, summary } = progress;
  const circ = 2 * Math.PI * 30;
  const off = circ - (summary.masteryPercent / 100) * circ;

  return (
    <div style={{ padding: '20px' }}>
      {/* Header with Progress Circle */}
      <div style={{ backgroundColor: '#1c1917', borderRadius: '16px', padding: '24px', marginBottom: '20px', color: 'white' }}>
        <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>{cls.name}</div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>{student.name}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Circle */}
          <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#fde68a"
                strokeWidth="6"
                strokeDasharray={circ.toFixed(1)}
                strokeDashoffset={off.toFixed(1)}
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: 1 }}>{summary.masteryPercent}%</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {summary.advanced > 0 && (
              <span style={{ fontSize: '12px', background: 'rgba(224, 242, 254, 0.2)', color: '#e0f2fe', padding: '6px 10px', borderRadius: '4px', fontWeight: '500' }}>
                {summary.advanced} Advanced
              </span>
            )}
            {summary.proficient > 0 && (
              <span style={{ fontSize: '12px', background: 'rgba(240, 253, 244, 0.2)', color: '#86efac', padding: '6px 10px', borderRadius: '4px', fontWeight: '500' }}>
                {summary.proficient} Proficient
              </span>
            )}
            {summary.developing > 0 && (
              <span style={{ fontSize: '12px', background: 'rgba(254, 252, 232, 0.2)', color: '#fde047', padding: '6px 10px', borderRadius: '4px', fontWeight: '500' }}>
                {summary.developing} Developing
              </span>
            )}
            {summary.approaching > 0 && (
              <span style={{ fontSize: '12px', background: 'rgba(255, 247, 237, 0.2)', color: '#fb923c', padding: '6px 10px', borderRadius: '4px', fontWeight: '500' }}>
                {summary.approaching} Approaching
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Skills List */}
      <div>
        {assessments.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999', backgroundColor: '#fafaf7', borderRadius: '12px' }}>
            No assessments yet. Start by rating yourself on the skills below!
          </div>
        ) : (
          assessments.map((assessment, idx) => (
            <div
              key={assessment.id}
              onClick={() => setExpandedSkill(expandedSkill === assessment.id ? null : assessment.id)}
              style={{
                marginBottom: '12px',
                backgroundColor: '#fff',
                borderRadius: '10px',
                border: '1px solid #eae6de',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {/* Skill Header */}
              <div style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: expandedSkill === assessment.id ? '#f9f9f9' : '#fff',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#000', marginBottom: '4px' }}>{assessment.skillName}</div>
                  {assessment.currentLevel && (
                    <div style={{
                      display: 'inline-block',
                      backgroundColor: levelColors[assessment.currentLevel as keyof typeof levelColors],
                      color: levelTextColors[assessment.currentLevel as keyof typeof levelTextColors],
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      {levelLabels[assessment.currentLevel]}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '18px', color: '#999' }}>
                  {expandedSkill === assessment.id ? '▼' : '▶'}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedSkill === assessment.id && (
                <div style={{ padding: '12px 16px', borderTop: '1px solid #eae6de', backgroundColor: '#fafaf7' }}>
                  {/* Current Level Definition */}
                  {assessment.currentLevel && (
                    <div style={{ marginBottom: '12px', padding: '10px', backgroundColor: '#fff', borderRadius: '6px', borderLeft: `3px solid ${Object.values(levelTextColors)[assessment.currentLevel - 1]}` }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '4px' }}>
                        {levelLabels[assessment.currentLevel]} Definition:
                      </div>
                      <div style={{ fontSize: '13px', color: '#333', lineHeight: '1.5' }}>
                        {assessment.levelDefinitions[levelLabels[assessment.currentLevel].toLowerCase()]}
                      </div>
                    </div>
                  )}

                  {/* Teacher Note */}
                  {assessment.teacherNote && (
                    <div style={{ marginBottom: '12px', padding: '10px', backgroundColor: '#fff', borderRadius: '6px', borderLeft: '3px solid #7c3aed' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '4px' }}>📝 Teacher Feedback:</div>
                      <div style={{ fontSize: '13px', color: '#333' }}>{assessment.teacherNote}</div>
                    </div>
                  )}

                  {/* History Timeline */}
                  {assessment.history && assessment.history.length > 0 && (
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>📈 Progress History:</div>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {assessment.history.map((h, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <span style={{ color: '#ccc', fontSize: '10px' }}>→</span>}
                            <div
                              title={new Date(h.date).toLocaleDateString()}
                              style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: h.studentSelfLevel ? levelColors[h.studentSelfLevel as keyof typeof levelColors] : '#f0f0f0',
                                border: `2px solid ${h.teacherLevel ? '#7c3aed' : '#ddd'}`,
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '600',
                                fontSize: '12px',
                                color: h.studentSelfLevel ? levelTextColors[h.studentSelfLevel as keyof typeof levelTextColors] : '#999',
                              }}
                            >
                              {h.studentSelfLevel || '?'}
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
