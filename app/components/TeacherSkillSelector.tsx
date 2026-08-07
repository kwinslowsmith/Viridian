'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { colors } from '@/app/design/colors';

export function TeacherSkillSelector({ classId, onComplete }: { classId: string; onComplete?: () => void }) {
  const { data: session } = useSession();
  const [classSkills, setClassSkills] = useState<any[]>([]);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch(`/api/improv/classes/${classId}/skills`);
        if (res.ok) {
          const data = await res.json();
          setClassSkills(data.classSkills || []);
          setAvailableSkills(data.availableSkills || []);
        }
      } catch (err) {
        console.error('Failed to fetch skills:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [classId]);

  const handleAddSkill = async (skillId: string) => {
    try {
      const res = await fetch(`/api/improv/classes/${classId}/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId,
          mandatoryObjectiveCount: 0,
          totalObjectivesRequired: 0,
          sequenceNum: classSkills.length,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setClassSkills([...classSkills, data.classSkill]);
        setAvailableSkills(availableSkills.filter((s) => s.id !== skillId));
      }
    } catch (err) {
      console.error('Failed to add skill:', err);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      const res = await fetch(`/api/improv/classes/${classId}/skills?skillId=${skillId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const skill = classSkills.find((cs) => cs.skillId === skillId)?.skill;
        setClassSkills(classSkills.filter((cs) => cs.skillId !== skillId));
        if (skill) {
          setAvailableSkills([...availableSkills, skill]);
        }
      }
    } catch (err) {
      console.error('Failed to remove skill:', err);
    }
  };

  const handleUpdateConfig = async (skillId: string, mandatoryCount: number, totalRequired: number) => {
    try {
      const res = await fetch(`/api/improv/classes/${classId}/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId,
          mandatoryObjectiveCount: mandatoryCount,
          totalObjectivesRequired: totalRequired,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setClassSkills(
          classSkills.map((cs) => (cs.skillId === skillId ? data.classSkill : cs))
        );
      }
    } catch (err) {
      console.error('Failed to update skill config:', err);
    }
  };

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading skills...</div>;
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', marginBottom: '1.5rem' }}>
        Manage Class Skills
      </h2>

      {/* Selected Skills */}
      {classSkills.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>
            Selected Skills ({classSkills.length})
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {classSkills.map((classSkill) => (
              <div
                key={classSkill.skillId}
                style={{
                  backgroundColor: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: colors.text, fontSize: '15px', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                      {classSkill.skill.name}
                    </h4>
                    <p style={{ color: colors.text2, fontSize: '13px', margin: '0 0 1rem 0' }}>
                      {classSkill.skill.objectives?.length || 0} objectives
                    </p>

                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                      <div>
                        <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                          Mandatory Objectives
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={classSkill.mandatoryObjectiveCount}
                          onChange={(e) =>
                            handleUpdateConfig(
                              classSkill.skillId,
                              parseInt(e.target.value),
                              classSkill.totalObjectivesRequired
                            )
                          }
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '4px',
                            fontSize: '13px',
                            color: colors.text,
                            backgroundColor: colors.surface,
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                          Total Required to Pass
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={classSkill.totalObjectivesRequired}
                          onChange={(e) =>
                            handleUpdateConfig(
                              classSkill.skillId,
                              classSkill.mandatoryObjectiveCount,
                              parseInt(e.target.value)
                            )
                          }
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '4px',
                            fontSize: '13px',
                            color: colors.text,
                            backgroundColor: colors.surface,
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSkill(classSkill.skillId)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Skills */}
      {availableSkills.length > 0 && (
        <div>
          <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>
            Available Skills
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {availableSkills.map((skill) => (
              <div
                key={skill.id}
                style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h4 style={{ color: colors.text, fontSize: '15px', fontWeight: '600', margin: 0 }}>
                    {skill.name}
                  </h4>
                  <p style={{ color: colors.text2, fontSize: '13px', margin: '0.25rem 0 0 0' }}>
                    {skill.objectives?.length || 0} objectives
                  </p>
                </div>
                <button
                  onClick={() => handleAddSkill(skill.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: colors.teal.accent,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Add Skill
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
