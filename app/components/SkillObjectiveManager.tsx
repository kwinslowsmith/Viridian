'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { colors } from '@/app/modules/improv/design/colors';

export function SkillObjectiveManager({ classId }: { classId: string }) {
  const { data: session } = useSession();
  const [objectives, setObjectives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ skillId: '', text: '', isMandatory: false, assessmentGuidance: '' });
  const [classSkills, setClassSkills] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

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
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  const handleAddObjective = async () => {
    if (!addForm.skillId || !addForm.text) {
      alert('Skill and text are required');
      return;
    }

    try {
      const res = await fetch(`/api/improv/classes/${classId}/objectives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });

      if (res.ok) {
        const data = await res.json();
        setObjectives([...objectives, data.objective]);
        setAddForm({ skillId: '', text: '', isMandatory: false, assessmentGuidance: '' });
        setShowAddForm(false);
      }
    } catch (err) {
      console.error('Failed to add objective:', err);
    }
  };

  const handleUpdateObjective = async (objectiveId: string) => {
    try {
      const res = await fetch(`/api/improv/objectives/${objectiveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const data = await res.json();
        setObjectives(
          objectives.map((obj) => (obj.id === objectiveId ? data.objective : obj))
        );
        setEditingId(null);
        setEditForm(null);
      }
    } catch (err) {
      console.error('Failed to update objective:', err);
    }
  };

  const handleDeleteObjective = async (objectiveId: string) => {
    if (!window.confirm('Delete this objective?')) return;

    try {
      const res = await fetch(`/api/improv/objectives/${objectiveId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setObjectives(objectives.filter((obj) => obj.id !== objectiveId));
      }
    } catch (err) {
      console.error('Failed to delete objective:', err);
    }
  };

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading objectives...</div>;
  }

  const groupedBySkill = classSkills.reduce((acc: any, cs) => {
    if (!acc[cs.skillId]) {
      acc[cs.skillId] = {
        skill: cs.skill,
        objectives: [],
      };
    }
    acc[cs.skillId].objectives = objectives.filter((obj) => obj.skillId === cs.skillId);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', margin: 0 }}>
          Manage Objectives
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: colors.teal.accent,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
          }}
        >
          {showAddForm ? 'Cancel' : '+ Add Objective'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div
          style={{
            backgroundColor: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                Skill
              </label>
              <select
                value={addForm.skillId}
                onChange={(e) => setAddForm({ ...addForm, skillId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  color: colors.text,
                  backgroundColor: colors.surface,
                  fontSize: '13px',
                }}
              >
                <option value="">Select a skill</option>
                {classSkills.map((cs) => (
                  <option key={cs.skillId} value={cs.skillId}>
                    {cs.skill.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                Objective Text
              </label>
              <input
                type="text"
                value={addForm.text}
                onChange={(e) => setAddForm({ ...addForm, text: e.target.value })}
                placeholder="e.g., Can identify character motivations"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  color: colors.text,
                  backgroundColor: colors.surface,
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                Assessment Guidance (Google Doc URL or instructions)
              </label>
              <input
                type="text"
                value={addForm.assessmentGuidance}
                onChange={(e) => setAddForm({ ...addForm, assessmentGuidance: e.target.value })}
                placeholder="https://docs.google.com/..."
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  color: colors.text,
                  backgroundColor: colors.surface,
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={addForm.isMandatory}
                onChange={(e) => setAddForm({ ...addForm, isMandatory: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ color: colors.text2, fontSize: '13px' }}>Mark as core skill</span>
            </label>
            <button
              onClick={handleAddObjective}
              style={{
                padding: '10px 16px',
                backgroundColor: colors.teal.accent,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
              }}
            >
              Add Objective
            </button>
          </div>
        </div>
      )}

      {/* Skills and Objectives */}
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {Object.entries(groupedBySkill).map(([skillId, group]: any) => (
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
                <h3 style={{ color: colors.text, fontSize: '15px', fontWeight: '600', margin: 0 }}>
                  {group.skill.name}
                </h3>
                <p style={{ color: colors.text2, fontSize: '12px', margin: '0.25rem 0 0 0' }}>
                  {group.objectives.length} objectives
                </p>
              </div>
              <span style={{ color: colors.text2, fontSize: '16px' }}>
                {expandedSkills.has(skillId) ? '▼' : '▶'}
              </span>
            </button>

            {expandedSkills.has(skillId) && (() => {
              const mandatory = group.objectives.filter((o: any) => o.isMandatory);
              const optional = group.objectives.filter((o: any) => !o.isMandatory);

              return (
                <div style={{ padding: '1rem', borderTop: `1px solid ${colors.border}`, display: 'grid', gap: '1.5rem' }}>
                  {group.objectives.length === 0 ? (
                    <p style={{ color: colors.text2, fontSize: '13px', margin: 0 }}>No objectives yet</p>
                  ) : (
                    <>
                      {mandatory.length > 0 && (
                        <div>
                          <h4 style={{ margin: '0 0 1rem 0', fontSize: '12px', fontWeight: '600', color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Required Objectives ({mandatory.length})
                          </h4>
                          <div style={{ display: 'grid', gap: '1rem' }}>
                            {mandatory.map((obj: any) => (
                              <div
                      key={obj.id}
                      style={{
                        backgroundColor: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '4px',
                        padding: '1rem',
                      }}
                    >
                      {editingId === obj.id ? (
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                          <input
                            type="text"
                            value={editForm.text}
                            onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                            style={{
                              padding: '8px',
                              border: `1px solid ${colors.border}`,
                              borderRadius: '4px',
                              color: colors.text,
                              backgroundColor: colors.surface,
                              fontSize: '13px',
                              boxSizing: 'border-box',
                            }}
                          />
                          <input
                            type="text"
                            value={editForm.assessmentGuidance || ''}
                            onChange={(e) => setEditForm({ ...editForm, assessmentGuidance: e.target.value })}
                            placeholder="Assessment guidance URL or instructions"
                            style={{
                              padding: '8px',
                              border: `1px solid ${colors.border}`,
                              borderRadius: '4px',
                              color: colors.text,
                              backgroundColor: colors.surface,
                              fontSize: '13px',
                              boxSizing: 'border-box',
                            }}
                          />
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="checkbox"
                              checked={editForm.isMandatory}
                              onChange={(e) => setEditForm({ ...editForm, isMandatory: e.target.checked })}
                            />
                            <span style={{ color: colors.text2, fontSize: '13px' }}>Core Skill</span>
                          </label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleUpdateObjective(obj.id)}
                              style={{
                                flex: 1,
                                padding: '8px',
                                backgroundColor: colors.teal.accent,
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              style={{
                                flex: 1,
                                padding: '8px',
                                backgroundColor: colors.border,
                                color: colors.text,
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                              <p style={{ color: colors.text, fontSize: '14px', fontWeight: '500', margin: 0, lineHeight: '1.5' }}>
                                {obj.text}
                              </p>
                              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                <button
                                  onClick={() => {
                                    setEditingId(obj.id);
                                    setEditForm(obj);
                                  }}
                                  style={{
                                    padding: '8px 14px',
                                    backgroundColor: colors.teal.accent,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                  }}
                                >
                                  Edit
                                </button>
                                {obj.isCustom && (
                                  <button
                                    onClick={() => handleDeleteObjective(obj.id)}
                                    style={{
                                      padding: '8px 14px',
                                      backgroundColor: '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      fontWeight: '500',
                                    }}
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              {obj.isMandatory && (
                                <span
                                  style={{
                                    display: 'inline-block',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    padding: '4px 10px',
                                    borderRadius: '3px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                  }}
                                >
                                  Core Skill
                                </span>
                              )}
                            </div>
                          </div>
                          {obj.assessmentGuidance && (
                            <div style={{ paddingTop: '0.75rem', borderTop: `1px solid ${colors.border}` }}>
                              <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                                Assessment Guidance
                              </p>
                              {obj.assessmentGuidance.startsWith('http') ? (
                                <a
                                  href={obj.assessmentGuidance}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: colors.teal.accent,
                                    fontSize: '13px',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Open in new tab →
                                </a>
                              ) : (
                                <p style={{ color: colors.text, fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                                  {obj.assessmentGuidance}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                            </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {optional.length > 0 && (
                        <div>
                          {mandatory.length > 0 && (
                            <div style={{ height: '1px', backgroundColor: colors.border, margin: '0.5rem 0' }} />
                          )}
                          <h4 style={{ margin: '0 0 1rem 0', fontSize: '12px', fontWeight: '600', color: colors.text2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Optional Objectives ({optional.length})
                          </h4>
                          <div style={{ display: 'grid', gap: '1rem' }}>
                            {optional.map((obj: any) => (
                              <div
                                key={obj.id}
                                style={{
                                  backgroundColor: colors.bg,
                                  border: `1px solid ${colors.border}`,
                                  borderRadius: '4px',
                                  padding: '1rem',
                                }}
                              >
                                {editingId === obj.id ? (
                                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                                    <input
                                      type="text"
                                      value={editForm.text}
                                      onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                                      style={{
                                        padding: '8px',
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '4px',
                                        color: colors.text,
                                        backgroundColor: colors.surface,
                                        fontSize: '13px',
                                        boxSizing: 'border-box',
                                      }}
                                    />
                                    <input
                                      type="text"
                                      value={editForm.assessmentGuidance || ''}
                                      onChange={(e) => setEditForm({ ...editForm, assessmentGuidance: e.target.value })}
                                      placeholder="Assessment guidance URL or instructions"
                                      style={{
                                        padding: '8px',
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '4px',
                                        color: colors.text,
                                        backgroundColor: colors.surface,
                                        fontSize: '13px',
                                        boxSizing: 'border-box',
                                      }}
                                    />
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <input
                                        type="checkbox"
                                        checked={editForm.isMandatory}
                                        onChange={(e) => setEditForm({ ...editForm, isMandatory: e.target.checked })}
                                      />
                                      <span style={{ color: colors.text2, fontSize: '13px' }}>Core Skill</span>
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                      <button
                                        onClick={() => handleUpdateObjective(obj.id)}
                                        style={{
                                          flex: 1,
                                          padding: '8px',
                                          backgroundColor: colors.teal.accent,
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '12px',
                                        }}
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingId(null)}
                                        style={{
                                          flex: 1,
                                          padding: '8px',
                                          backgroundColor: colors.border,
                                          color: colors.text,
                                          border: 'none',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '12px',
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div style={{ marginBottom: '1rem' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                                        <p style={{ color: colors.text, fontSize: '14px', fontWeight: '500', margin: 0, lineHeight: '1.5' }}>
                                          {obj.text}
                                        </p>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                          <button
                                            onClick={() => {
                                              setEditingId(obj.id);
                                              setEditForm(obj);
                                            }}
                                            style={{
                                              padding: '8px 14px',
                                              backgroundColor: colors.teal.accent,
                                              color: 'white',
                                              border: 'none',
                                              borderRadius: '4px',
                                              cursor: 'pointer',
                                              fontSize: '13px',
                                              fontWeight: '500',
                                            }}
                                          >
                                            Edit
                                          </button>
                                          {obj.isCustom && (
                                            <button
                                              onClick={() => handleDeleteObjective(obj.id)}
                                              style={{
                                                padding: '8px 14px',
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                              }}
                                            >
                                              Delete
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    {obj.assessmentGuidance && (
                                      <div style={{ paddingTop: '0.75rem', borderTop: `1px solid ${colors.border}` }}>
                                        <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                                          Assessment Guidance
                                        </p>
                                        {obj.assessmentGuidance.startsWith('http') ? (
                                          <a
                                            href={obj.assessmentGuidance}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                              color: colors.teal.accent,
                                              fontSize: '13px',
                                              textDecoration: 'underline',
                                              cursor: 'pointer',
                                            }}
                                          >
                                            Open in new tab →
                                          </a>
                                        ) : (
                                          <p style={{ color: colors.text, fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                                            {obj.assessmentGuidance}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}
