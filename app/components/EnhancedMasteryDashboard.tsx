'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/app/design/colors';

interface Skill {
  objectiveId: string;
  objectiveText: string;
  standardName: string;
  studentCount: number;
  percentageStuck: number;
  severity: 'critical' | 'moderate';
  classAveragePercent: number;
}

interface SkillGroup {
  group: 'critical' | 'atRisk' | 'readyToMaster' | 'proficient';
  label: string;
  description: string;
  color: string;
  textColor: string;
  skills: Skill[];
  icon: string;
}

interface EnhancedMasteryDashboardProps {
  classId: string;
  onCreateIntervention?: (objectiveId: string, objectiveText: string) => void;
}

export function EnhancedMasteryDashboard({ classId, onCreateIntervention }: EnhancedMasteryDashboardProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSkills();
  }, [classId]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/k12-classes/${classId}/class-dashboard`);
      if (!response.ok) throw new Error('Failed to fetch skills');
      const data = await response.json();
      setSkills(data.strugglingSkills || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const groupSkills = (): SkillGroup[] => {
    const groups: { [key: string]: Skill[] } = {
      critical: [],
      atRisk: [],
      readyToMaster: [],
      proficient: [],
    };

    skills.forEach((skill) => {
      const percent = skill.classAveragePercent;
      if (percent < 50) {
        groups.critical.push(skill);
      } else if (percent < 70) {
        groups.atRisk.push(skill);
      } else if (percent < 80) {
        groups.readyToMaster.push(skill);
      } else {
        groups.proficient.push(skill);
      }
    });

    return [
      {
        group: 'critical' as const,
        label: 'Critical Support',
        description: 'Less than 50% mastery - immediate action needed',
        color: '#fee2e2',
        textColor: '#7f1d1d',
        skills: groups.critical,
        icon: '🔴',
      },
      {
        group: 'atRisk' as const,
        label: 'At Risk',
        description: '50-70% mastery - intervention recommended',
        color: '#fef3c7',
        textColor: '#78350f',
        skills: groups.atRisk,
        icon: '🟡',
      },
      {
        group: 'readyToMaster' as const,
        label: 'Ready to Master',
        description: '70-80% mastery - additional practice recommended',
        color: '#dbeafe',
        textColor: '#0c2340',
        skills: groups.readyToMaster,
        icon: '🟦',
      },
      {
        group: 'proficient' as const,
        label: 'Proficient',
        description: '80%+ mastery - students have achieved mastery',
        color: '#dcfce7',
        textColor: '#15803d',
        skills: groups.proficient,
        icon: '✓',
      },
    ].filter((g) => g.skills.length > 0);
  };

  const skillGroups = groupSkills();

  if (loading) {
    return <div style={{ padding: '24px', color: colors.text2 }}>Loading mastery data...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '24px', color: '#ef4444' }}>
        Error: {error}
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          border: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
        <p style={{ color: colors.text, fontSize: '18px', fontWeight: '600', margin: '0 0 8px' }}>
          All students proficient!
        </p>
        <p style={{ color: colors.text2, fontSize: '14px', margin: '0' }}>
          No students need intervention at this time
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {skillGroups.map((group) => (
        <div key={group.group} style={{ backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
          {/* Group Header */}
          <div
            style={{
              backgroundColor: group.color,
              borderBottom: `2px solid ${colors.border}`,
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ fontSize: '24px' }}>{group.icon}</div>
              <div>
                <h3 style={{ color: group.textColor, fontSize: '16px', fontWeight: 'bold', margin: '0' }}>
                  {group.label}
                </h3>
                <p style={{ color: group.textColor, fontSize: '12px', opacity: 0.8, margin: '0' }}>
                  {group.description}
                </p>
              </div>
            </div>
            <div style={{ color: group.textColor, fontSize: '13px', fontWeight: '600' }}>
              {group.skills.length} skill{group.skills.length !== 1 ? 's' : ''} • {Math.round(group.skills.reduce((sum, s) => sum + s.studentCount, 0) / group.skills.length)} avg students
            </div>
          </div>

          {/* Skills List */}
          <div style={{ padding: '16px', display: 'grid', gap: '12px' }}>
            {group.skills.map((skill) => (
              <div
                key={skill.objectiveId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: colors.bg,
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: colors.text, fontSize: '14px', fontWeight: '600', margin: '0 0 4px' }}>
                    {skill.objectiveText}
                  </h4>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: colors.text2 }}>
                    <span>{skill.standardName}</span>
                    <span>•</span>
                    <span>{skill.studentCount} students struggling</span>
                    <span>•</span>
                    <span style={{ fontWeight: '600', color: skill.classAveragePercent < 50 ? '#ef4444' : '#f59e0b' }}>
                      {skill.classAveragePercent}% avg
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onCreateIntervention?.(skill.objectiveId, skill.objectiveText)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor:
                      group.group === 'critical'
                        ? '#ef4444'
                        : group.group === 'atRisk'
                          ? '#f59e0b'
                          : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    marginLeft: '16px',
                  }}
                >
                  {group.group === 'proficient' ? 'Review' : 'Create Group'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
