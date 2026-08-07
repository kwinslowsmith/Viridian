'use client';

import React from 'react';
import { useTeacherClassDashboard } from '@/mocks/k12-api-responses';
import { colors } from '@/app/design/colors';

interface TeacherClassDashboardProps {
  classId: string;
}

export function TeacherClassDashboard({ classId }: TeacherClassDashboardProps) {
  const { data, loading } = useTeacherClassDashboard(classId);

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center', color: colors.text2 }}>Loading dashboard...</div>;
  }

  if (!data) {
    return <div style={{ padding: '24px', textAlign: 'center', color: colors.text2 }}>No data available</div>;
  }

  const getHealthColor = (score: number) => (score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#ef4444';
      case 'moderate':
        return '#f59e0b';
      default:
        return '#9ca3af';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'moderate':
        return '🟡';
      default:
        return '🟢';
    }
  };

  const getTrendArrow = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '=';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'assessment':
        return '#fb923c';
      case 'lesson':
        return '#3b82f6';
      case 'event':
        return '#8b5cf6';
      default:
        return '#9ca3af';
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const hasCriticalSkills = data.strugglingSkills.some((s) => s.severity === 'critical');
  const avgMastery = Math.round(data.classMasteryByStandard.reduce((sum, s) => sum + s.classMasteryPercent, 0) / data.classMasteryByStandard.length);

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* HEADER */}
        <div style={{ backgroundColor: colors.surface, borderRadius: '12px', padding: '24px', marginBottom: '24px', border: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
            <div>
              <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px' }}>{data.className}</h1>
              <p style={{ color: colors.text2, fontSize: '14px', margin: '0 0 16px' }}>Grade {data.gradeLevel} • {data.period} • {data.enrollmentCount} students</p>
              <p style={{ color: colors.text3, fontSize: '12px', margin: '0' }}>Last updated: {formatTime(data.lastUpdate)}</p>
            </div>
            <div style={{ backgroundColor: getHealthColor(data.classHealthScore), borderRadius: '16px', padding: '24px 32px', textAlign: 'center', color: 'white', minWidth: '150px' }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', lineHeight: '1' }}>{data.classHealthScore}</div>
              <div style={{ fontSize: '12px', marginTop: '8px', fontWeight: '600' }}>Class Health</div>
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: colors.surface, borderRadius: '12px', padding: '16px', border: `1px solid ${colors.border}` }}>
            <div style={{ color: colors.text3, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Pending Submissions</div>
            <div style={{ color: colors.text, fontSize: '32px', fontWeight: 'bold' }}>{data.pendingSubmissionsCount}</div>
          </div>
          <div style={{ backgroundColor: colors.surface, borderRadius: '12px', padding: '16px', border: `1px solid ${colors.border}` }}>
            <div style={{ color: colors.text3, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Class Mastery Average</div>
            <div style={{ color: colors.text, fontSize: '32px', fontWeight: 'bold' }}>{avgMastery}%</div>
          </div>
          <div style={{ backgroundColor: colors.surface, borderRadius: '12px', padding: '16px', border: `1px solid ${colors.border}` }}>
            <div style={{ color: colors.text3, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Students Needing Support</div>
            <div style={{ color: colors.text, fontSize: '32px', fontWeight: 'bold' }}>{data.strugglingSkills.reduce((sum, s) => sum + s.studentCount, 0)}</div>
          </div>
        </div>

        {/* CRITICAL ALERT */}
        {hasCriticalSkills && (
          <div style={{ backgroundColor: '#fee2e2', borderLeft: '4px solid #ef4444', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
            <div style={{ color: '#7f1d1d', fontSize: '14px', fontWeight: '600' }}>🚨 Critical Skills Need Attention</div>
            <div style={{ color: '#9f1239', fontSize: '13px', marginTop: '4px' }}>{data.strugglingSkills.filter((s) => s.severity === 'critical').length} skill(s) with &gt;60% students stuck</div>
          </div>
        )}

        {/* CLASS MASTERY BY STANDARD */}
        <div style={{ backgroundColor: colors.surface, borderRadius: '12px', padding: '24px', marginBottom: '24px', border: `1px solid ${colors.border}` }}>
          <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px' }}>Class Mastery by Standard</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {data.classMasteryByStandard.map((standard) => (
              <div key={standard.standardId} style={{ backgroundColor: colors.bg, borderRadius: '8px', padding: '16px', border: `1px solid ${colors.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '600', margin: '0' }}>{standard.standardName}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: colors.text, fontSize: '24px', fontWeight: 'bold' }}>{standard.classMasteryPercent}%</div>
                    <div style={{ fontSize: '18px', color: standard.trend === 'up' ? '#10b981' : standard.trend === 'down' ? '#ef4444' : '#9ca3af' }}>{getTrendArrow(standard.trend)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: colors.text2 }}>
                  <div><span style={{ color: '#10b981', fontWeight: '600' }}>{standard.studentsMasteredCount}</span> mastered</div>
                  <div><span style={{ color: '#f59e0b', fontWeight: '600' }}>{standard.studentsInProgressCount}</span> in progress</div>
                  <div><span style={{ color: '#ef4444', fontWeight: '600' }}>{standard.studentsNotStartedCount}</span> not started</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STRUGGLING SKILLS */}
        <div style={{ backgroundColor: colors.surface, borderRadius: '12px', padding: '24px', marginBottom: '24px', border: `1px solid ${colors.border}` }}>
          <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px' }}>Struggling Skills (Highest Priority)</h2>
          {data.strugglingSkills.length === 0 ? (
            <p style={{ color: colors.text2, fontSize: '14px', margin: '0' }}>No struggling skills!</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {data.strugglingSkills.map((skill) => (
                <div key={skill.objectiveId} style={{ backgroundColor: colors.bg, borderRadius: '8px', padding: '16px', border: `2px solid ${getSeverityColor(skill.severity)}`, borderLeft: `6px solid ${getSeverityColor(skill.severity)}` }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ fontSize: '24px' }}>{getSeverityIcon(skill.severity)}</div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: colors.text, fontSize: '15px', fontWeight: '600', margin: '0 0 4px' }}>{skill.objectiveText}</h3>
                        <p style={{ color: colors.text2, fontSize: '13px', margin: '0' }}>{skill.standardName}</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: colors.text, marginBottom: '12px' }}>
                    <span style={{ fontWeight: '600', color: getSeverityColor(skill.severity) }}>{skill.studentCount} students</span> ({skill.percentageStuck}%) stuck
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ flex: 1, padding: '8px 12px', backgroundColor: getSeverityColor(skill.severity), color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>View Students</button>
                    <button style={{ flex: 1, padding: '8px 12px', backgroundColor: colors.bg, color: getSeverityColor(skill.severity), border: `1px solid ${getSeverityColor(skill.severity)}`, borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Create Reteach</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INTERVENTION GROUPS */}
        <div style={{ backgroundColor: colors.surface, borderRadius: '12px', padding: '24px', marginBottom: '24px', border: `1px solid ${colors.border}` }}>
          <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px' }}>Active Intervention Groups</h2>
          {data.interventionGroups.length === 0 ? (
            <p style={{ color: colors.text2, fontSize: '14px', margin: '0' }}>No active groups.</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {data.interventionGroups.map((group) => (
                <div key={group.id} style={{ backgroundColor: colors.bg, borderRadius: '8px', padding: '16px', border: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ color: colors.text, fontSize: '15px', fontWeight: '600', margin: '0 0 8px' }}>{group.name}</h3>
                    <div style={{ fontSize: '13px', color: colors.text2 }}>📅 {group.meetingSchedule} • 👥 {group.studentCount} students</div>
                  </div>
                  <button style={{ padding: '8px 16px', backgroundColor: colors.v600, color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Manage</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MASTER CALENDAR */}
        <div style={{ backgroundColor: colors.surface, borderRadius: '12px', padding: '24px', border: `1px solid ${colors.border}` }}>
          <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px' }}>Master Calendar (Upcoming Events)</h2>
          {data.masterCalendar.length === 0 ? (
            <p style={{ color: colors.text2, fontSize: '14px', margin: '0' }}>No upcoming events.</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {data.masterCalendar.map((event) => (
                <div key={event.id} style={{ backgroundColor: colors.bg, borderRadius: '8px', padding: '16px', border: `1px solid ${colors.border}`, borderLeft: `6px solid ${getEventTypeColor(event.type)}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div>
                      <h3 style={{ color: colors.text, fontSize: '15px', fontWeight: '600', margin: '0 0 8px' }}>{event.name}</h3>
                      <div style={{ fontSize: '13px', color: colors.text2, marginBottom: '4px' }}>📅 {formatDate(event.date)}</div>
                      <div style={{ fontSize: '12px', color: 'white', backgroundColor: getEventTypeColor(event.type), padding: '4px 8px', borderRadius: '4px', display: 'inline-block', textTransform: 'capitalize' }}>{event.type}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '13px', color: colors.text2 }}>
                      {event.studentCount} students<br />
                      {event.standardsAssessed.length} standard{event.standardsAssessed.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
