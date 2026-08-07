'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { colors } from '@/app/modules/improv/design/colors';

interface DashboardData {
  className: string;
  classSize: number;
  classOverallMastery: number;
  classTrendPercent: number;
  standards: Array<{
    standardId: string;
    standardName: string;
    standardCode: string;
    classMasteryPercent: number;
    masteredStudents: number;
    totalStudents: number;
    strugglingStudents: number;
    strugglingPercent: number;
    isStrugglingSkill: boolean;
  }>;
  strugglingSkills: Array<{
    skillLabel: string;
    studentCount: number;
    mastery: number;
  }>;
  studentsNeedingSupportCount: number;
  studentsNeedingSupportPercent: number;
}

export function TeacherClassDashboard({ classId }: { classId: string }) {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`/api/k12-classes/${classId}/class-dashboard`);
        if (res.ok) {
          const dashData = await res.json();
          setData(dashData);
        }
      } catch (err) {
        console.error('Failed to fetch class dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [classId]);

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading class dashboard...</div>;
  }

  if (!data) {
    return <div style={{ color: colors.text2 }}>Failed to load class dashboard</div>;
  }

  const getMasteryColor = (percentage: number) => {
    if (percentage >= 75) return '#10b981'; // Green
    if (percentage >= 50) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getTrendIcon = (trendPercent: number) => {
    if (trendPercent > 0) return '↑';
    if (trendPercent < 0) return '↓';
    return '=';
  };

  const getTrendLabel = (trendPercent: number) => {
    if (trendPercent > 0) return `Improving (+${trendPercent}%)`;
    if (trendPercent < 0) return `Declining (${trendPercent}%)`;
    return 'Stable';
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <h1 style={{ color: colors.text, fontSize: '24px', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
        {data.className}
      </h1>
      <p style={{ color: colors.text2, fontSize: '14px', margin: '0 0 2rem 0' }}>
        {data.classSize} students enrolled
      </p>

      {/* Main Metric: Class Mastery */}
      <div
        style={{
          backgroundColor: colors.surface,
          border: `2px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
          <div>
            <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>
              Class Mastery
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ color: colors.text, fontSize: '48px', fontWeight: '700' }}>
                {data.classOverallMastery}%
              </span>
              <span
                style={{
                  color: getMasteryColor(data.classOverallMastery),
                  fontSize: '24px',
                  fontWeight: '700',
                }}
              >
                {getTrendIcon(data.classTrendPercent)}
              </span>
            </div>
            <p style={{ color: colors.text2, fontSize: '13px', margin: '0.5rem 0 0 0' }}>
              {getTrendLabel(data.classTrendPercent)} this week
            </p>
          </div>

          {/* Progress Bar */}
          <div>
            <div
              style={{
                backgroundColor: colors.border,
                borderRadius: '8px',
                height: '12px',
                overflow: 'hidden',
                marginBottom: '0.5rem',
              }}
            >
              <div
                style={{
                  backgroundColor: getMasteryColor(data.classOverallMastery),
                  height: '100%',
                  width: `${data.classOverallMastery}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <p style={{ color: colors.text2, fontSize: '12px', margin: 0 }}>
              {data.classOverallMastery >= 75
                ? '✨ Class is mastering standards'
                : data.classOverallMastery >= 50
                  ? '📚 Class making progress'
                  : '⚠️ Class needs support'}
            </p>
          </div>
        </div>
      </div>

      {/* Struggling Skills Section */}
      {data.strugglingSkills.length > 0 && (
        <div
          style={{
            backgroundColor: colors.surface,
            border: `2px solid #ef4444`,
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ color: '#ef4444', fontSize: '16px', fontWeight: '700', margin: '0 0 1rem 0' }}>
            🚨 Struggling Skills (Where Students Need Help)
          </h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {data.strugglingSkills.map((skill, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  backgroundColor: colors.bg,
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ color: colors.text, fontSize: '14px', fontWeight: '600', margin: 0 }}>
                    {skill.skillLabel}
                  </p>
                  <p style={{ color: colors.text2, fontSize: '12px', margin: '0.25rem 0 0 0' }}>
                    {skill.studentCount} of {data.classSize} students struggling
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      backgroundColor: getMasteryColor(skill.mastery) + '20',
                      color: getMasteryColor(skill.mastery),
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: '600',
                    }}
                  >
                    {skill.mastery}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students Needing Support */}
      <div
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', margin: '0 0 1rem 0' }}>
          Students Needing Support
        </h2>
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: colors.bg,
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <p style={{ color: colors.text2, fontSize: '12px', textTransform: 'uppercase', margin: 0 }}>
              Below 60% mastery on any standard
            </p>
            <p style={{ color: colors.text, fontSize: '24px', fontWeight: '700', margin: '0.5rem 0 0 0' }}>
              {data.studentsNeedingSupportCount} of {data.classSize} students
            </p>
            <p style={{ color: colors.text2, fontSize: '12px', margin: '0.25rem 0 0 0' }}>
              {data.studentsNeedingSupportPercent}% of class
            </p>
          </div>
          <button
            style={{
              padding: '10px 16px',
              backgroundColor: colors.teal.accent,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
            }}
          >
            View Details →
          </button>
        </div>
      </div>

      {/* All Standards Summary */}
      <div
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        <h2 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', margin: '0 0 1rem 0' }}>
          All Standards
        </h2>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {data.standards.map(standard => (
            <div
              key={standard.standardId}
              style={{
                padding: '0.75rem',
                backgroundColor: colors.bg,
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    color: colors.text,
                    fontSize: '13px',
                    fontWeight: '500',
                    margin: 0,
                  }}
                >
                  {standard.standardName}
                </p>
                <p style={{ color: colors.text2, fontSize: '11px', margin: '0.25rem 0 0 0' }}>
                  {standard.masteredStudents} of {standard.totalStudents} mastered
                </p>
              </div>
              <span
                style={{
                  padding: '4px 12px',
                  backgroundColor: getMasteryColor(standard.classMasteryPercent) + '20',
                  color: getMasteryColor(standard.classMasteryPercent),
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  minWidth: '60px',
                  textAlign: 'right',
                }}
              >
                {standard.classMasteryPercent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
