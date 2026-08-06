'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { colors } from '@/app/modules/improv/design/colors';
import { terminology, getMandatoryBadgeInfo } from '@/app/config/terminology';

export function StudentObjectiveList({
  classId,
  onSelectObjective,
}: {
  classId: string;
  onSelectObjective?: (objective: any) => void;
}) {
  const { data: session } = useSession();
  const [objectives, setObjectives] = useState<any[]>([]);
  const [classSkills, setClassSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [assessmentStatus, setAssessmentStatus] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, objectivesRes] = await Promise.all([
          fetch(`/api/improv/classes/${classId}/skills`),
          fetch(`/api/improv/classes/${classId}/objectives`),
        ]);

        if (skillsRes.ok) {
          const data = await skillsRes.json();
          setClassSkills(data.classSkills || []);
        }

        if (objectivesRes.ok) {
          const data = await objectivesRes.json();
          setObjectives(data.objectives || []);

          // Fetch assessment status for each objective
          const statuses: { [key: string]: any } = {};
          for (const obj of data.objectives || []) {
            try {
              const assessRes = await fetch(
                `/api/improv/classes/${classId}/objectives/${obj.id}/assessments`
              );
              if (assessRes.ok) {
                const assessData = await assessRes.json();
                statuses[obj.id] = assessData.assessment;
              }
            } catch (err) {
              console.error('Failed to fetch assessment:', err);
            }
          }
          setAssessmentStatus(statuses);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading objectives...</div>;
  }

  const groupedBySkill = classSkills.reduce((acc: any, cs) => {
    if (!acc[cs.skillId]) {
      acc[cs.skillId] = {
        classSkill: cs,
        objectives: [],
      };
    }
    acc[cs.skillId].objectives = objectives.filter((obj) => obj.skillId === cs.skillId);
    return acc;
  }, {});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded':
        return '#10b981';
      case 'submitted':
        return '#f59e0b';
      case 'not-started':
        return '#9ca3af';
      default:
        return '#9ca3af';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'graded':
        return 'Graded';
      case 'submitted':
        return 'Submitted';
      case 'not-started':
        return 'Not Started';
      default:
        return status;
    }
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', marginBottom: '1.5rem' }}>
        {terminology.student.headers.learningObjectives}
      </h2>

      {classSkills.length === 0 ? (
        <p style={{ color: colors.text2 }}>No skills assigned yet. Check back soon!</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {Object.entries(groupedBySkill).map(([skillId, group]: any) => {
            const mandatoryCount = group.classSkill.mandatoryObjectiveCount;
            const totalRequired = group.classSkill.totalObjectivesRequired;

            return (
              <div
                key={skillId}
                style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => {
                    const newExpanded = new Set(expandedSkills);
                    if (newExpanded.has(skillId)) {
                      newExpanded.delete(skillId);
                    } else {
                      newExpanded.add(skillId);
                    }
                    setExpandedSkills(newExpanded);
                  }}
                  style={{
                    width: '100%',
                    padding: '1.5rem',
                    backgroundColor: colors.bg,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', margin: 0 }}>
                      {group.classSkill.skill.name}
                    </h3>
                    <p style={{ color: colors.text2, fontSize: '13px', margin: '0.25rem 0 0 0' }}>
                      {mandatoryCount > 0 || totalRequired > 0
                        ? `${mandatoryCount} core + ${totalRequired} challenge objectives`
                        : `${group.objectives.length} objectives`}
                    </p>
                  </div>
                  <span style={{ color: colors.text2, fontSize: '16px' }}>
                    {expandedSkills.has(skillId) ? '▼' : '▶'}
                  </span>
                </button>

                {expandedSkills.has(skillId) && (
                  <div style={{ padding: '1rem', borderTop: `1px solid ${colors.border}`, display: 'grid', gap: '0.75rem' }}>
                    {group.objectives.length === 0 ? (
                      <p style={{ color: colors.text2, fontSize: '13px', margin: 0 }}>No objectives</p>
                    ) : (
                      group.objectives.map((obj: any) => {
                        const assessment = assessmentStatus[obj.id];
                        const status = assessment?.status || 'not-started';
                        const isMandatory = obj.isMandatory;

                        return (
                          <button
                            key={obj.id}
                            onClick={() => onSelectObjective?.(obj)}
                            style={{
                              width: '100%',
                              padding: '1rem',
                              backgroundColor: colors.bg,
                              border: `1px solid ${colors.border}`,
                              borderRadius: '4px',
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'start',
                              gap: '1rem',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = colors.teal.accent;
                              e.currentTarget.style.backgroundColor = colors.surface;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = colors.border;
                              e.currentTarget.style.backgroundColor = colors.bg;
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <p style={{ color: colors.text, fontSize: '13px', fontWeight: '500', margin: 0 }}>
                                {obj.text}
                              </p>
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {isMandatory && (() => {
                                  const badgeInfo = getMandatoryBadgeInfo(isMandatory);
                                  return (
                                    <span
                                      style={{
                                        backgroundColor: badgeInfo.backgroundColor,
                                        color: badgeInfo.color,
                                        padding: '2px 6px',
                                        borderRadius: '3px',
                                        fontSize: '10px',
                                        fontWeight: '600',
                                      }}
                                    >
                                      {badgeInfo.label}
                                    </span>
                                  );
                                })()}
                              </div>
                            </div>
                            <div
                              style={{
                                backgroundColor: getStatusColor(status),
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '3px',
                                fontSize: '11px',
                                fontWeight: '600',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {getStatusLabel(status)}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
