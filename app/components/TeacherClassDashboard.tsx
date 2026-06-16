'use client';

import React, { useState, useEffect } from 'react';

interface ClassProgressData {
  class: { id: string; name: string };
  skills: Array<{ id: string; name: string; category: string }>;
  students: Array<{
    studentId: string;
    studentName: string;
    levels: Array<{ skillId: string; skillName: string; level: number | null; confirmed: boolean }>;
  }>;
  summary: { totalStudents: number; totalSkills: number; totalRatings: number; confirmedRatings: number };
}

const levelColors = {
  null: '#f5f5f4',
  1: '#fff7ed',
  2: '#fefce8',
  3: '#f0fdf4',
  4: '#e0f2fe',
};

const levelTextColors = {
  null: '#a8a29e',
  1: '#c2410c',
  2: '#a16207',
  3: '#166534',
  4: '#0369a1',
};

export function TeacherClassDashboard({ classId }: { classId: string }) {
  const [progress, setProgress] = useState<ClassProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/improv/classes/${classId}/progress-summary`);
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
    return <div style={{ padding: '20px', color: '#666' }}>Loading class progress...</div>;
  }

  if (!progress) {
    return <div style={{ padding: '20px', color: '#666' }}>No progress data found</div>;
  }

  const { class: cls, skills, students, summary } = progress;

  // Calculate stats per skill
  const skillStats = skills.map(skill => {
    const levels = students.flatMap(s => s.levels.filter(l => l.skillId === skill.id).map(l => l.level)).filter(Boolean);
    return {
      ...skill,
      proficiencyPercent: levels.length > 0 ? Math.round((levels.filter(l => l === 3 || l === 4).length / levels.length) * 100) : 0,
      ratedCount: levels.length,
    };
  });

  return (
    <div style={{ padding: '20px' }}>
      {/* Header Stats */}
      <div style={{
        backgroundColor: '#1c1917',
        borderRadius: '12px',
        padding: '20px',
        color: 'white',
        marginBottom: '20px',
      }}>
        <h3 style={{ margin: '0 0 12px 0' }}>{cls.name}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', fontSize: '13px' }}>
          <div>
            <div style={{ opacity: 0.7, marginBottom: '4px' }}>Students</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{summary.totalStudents}</div>
          </div>
          <div>
            <div style={{ opacity: 0.7, marginBottom: '4px' }}>Skills</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{summary.totalSkills}</div>
          </div>
          <div>
            <div style={{ opacity: 0.7, marginBottom: '4px' }}>Ratings</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{summary.totalRatings}</div>
          </div>
          <div>
            <div style={{ opacity: 0.7, marginBottom: '4px' }}>Confirmed</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{summary.confirmedRatings}</div>
          </div>
        </div>
      </div>

      {/* Skill Overview */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: '#000', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>Skill Proficiency Overview</h4>
        {skillStats.map(skill => (
          <div key={skill.id} style={{ marginBottom: '12px', backgroundColor: '#fff', borderRadius: '8px', padding: '12px', border: '1px solid #eae6de' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ fontWeight: '600', color: '#000', fontSize: '13px' }}>{skill.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {skill.proficiencyPercent}% proficient ({skill.ratedCount} rated)
              </div>
            </div>
            <div style={{ height: '6px', backgroundColor: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${skill.proficiencyPercent}%`,
                  backgroundColor: skill.proficiencyPercent >= 75 ? '#10b981' : skill.proficiencyPercent >= 50 ? '#f59e0b' : '#ef4444',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div style={{ marginBottom: '20px', overflowX: 'auto', backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #eae6de' }}>
        <h4 style={{ color: '#000', margin: '0 0 12px 16px', marginTop: '16px', fontSize: '14px', fontWeight: '600' }}>Class Heatmap</h4>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eae6de' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#000', fontSize: '12px', width: '150px' }}>Student</th>
              {skills.map(skill => (
                <th key={skill.id} style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600', color: '#666', fontSize: '11px', minWidth: '40px' }}>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={skill.name}>
                    {skill.name.substring(0, 3)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.studentId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td
                  onClick={() => setSelectedStudent(selectedStudent === student.studentId ? null : student.studentId)}
                  style={{
                    padding: '12px 16px',
                    color: '#000',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    backgroundColor: selectedStudent === student.studentId ? '#f9f9f9' : '#fff',
                  }}
                >
                  {student.studentName}
                </td>
                {student.levels.map((level, idx) => (
                  <td key={idx} style={{ padding: '8px', textAlign: 'center' }}>
                    <div
                      title={level.level ? `${['Approaching', 'Developing', 'Proficient', 'Advanced'][level.level - 1]}${level.confirmed ? ' (confirmed)' : ''}` : 'Not rated'}
                      style={{
                        width: '32px',
                        height: '32px',
                        margin: '0 auto',
                        backgroundColor: levelColors[level.level as keyof typeof levelColors],
                        border: level.confirmed ? '2px solid #7c3aed' : '1px solid #ddd',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '14px',
                        color: levelTextColors[level.level as keyof typeof levelTextColors],
                        cursor: 'pointer',
                      }}
                    >
                      {level.level || '—'}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ backgroundColor: '#fafaf7', borderRadius: '8px', padding: '12px 16px', fontSize: '12px', color: '#666' }}>
        <div style={{ marginBottom: '8px', fontWeight: '600', color: '#000' }}>Legend</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#fff7ed', border: '1px solid #ddd', borderRadius: '3px' }} />
            <span>1 - Approaching</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#fefce8', border: '1px solid #ddd', borderRadius: '3px' }} />
            <span>2 - Developing</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#f0fdf4', border: '1px solid #ddd', borderRadius: '3px' }} />
            <span>3 - Proficient</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#e0f2fe', border: '1px solid #ddd', borderRadius: '3px' }} />
            <span>4 - Advanced</span>
          </div>
        </div>
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#999' }}>
          <strong>Note:</strong> Purple border = teacher-confirmed. No border = self-rated only.
        </div>
      </div>
    </div>
  );
}
