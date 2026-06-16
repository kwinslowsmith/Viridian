'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { colors } from '@/app/modules/improv/design/colors';

export function TeacherGradingDashboard({ classId }: { classId: string }) {
  const { data: session } = useSession();
  const [skills, setSkills] = useState<any[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, objectivesRes] = await Promise.all([
          fetch(`/api/improv/classes/${classId}/skills`),
          fetch(`/api/improv/classes/${classId}/objectives`),
        ]);

        if (skillsRes.ok) {
          const data = await skillsRes.json();
          setSkills(data.classSkills || []);
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

  const handleExpandObjective = async (objectiveId: string) => {
    const newExpanded = new Set(expandedObjectives);

    if (newExpanded.has(objectiveId)) {
      newExpanded.delete(objectiveId);
    } else {
      newExpanded.add(objectiveId);
      // Fetch submissions for this objective if not already loaded
      if (!submissions[objectiveId]) {
        try {
          const res = await fetch(
            `/api/improv/classes/${classId}/objectives/${objectiveId}/assessments`
          );
          if (res.ok) {
            const data = await res.json();
            setSubmissions((prev) => ({
              ...prev,
              [objectiveId]: data.assessments || [],
            }));
          }
        } catch (err) {
          console.error('Failed to fetch submissions:', err);
        }
      }
    }

    setExpandedObjectives(newExpanded);
  };

  const handleGradeSubmission = async (
    objectiveId: string,
    studentId: string,
    feedback: string,
    passed: boolean
  ) => {
    try {
      const res = await fetch(
        `/api/improv/classes/${classId}/objectives/${objectiveId}/assessments`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            teacherFeedback: feedback,
          }),
        }
      );

      if (res.ok) {
        // Refresh submissions
        const refreshRes = await fetch(
          `/api/improv/classes/${classId}/objectives/${objectiveId}/assessments`
        );
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setSubmissions((prev) => ({
            ...prev,
            [objectiveId]: data.assessments || [],
          }));
        }
        setSelectedSubmission(null);
      }
    } catch (err) {
      console.error('Failed to grade submission:', err);
    }
  };

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading...</div>;
  }

  // Group objectives by skill
  const skillGroups = skills.reduce((acc: any, cs) => {
    if (!acc[cs.skillId]) {
      acc[cs.skillId] = { skill: cs.skill, classSkill: cs };
    }
    return acc;
  }, {});

  // Get objectives for each skill
  const skillObjectives: Record<string, any[]> = {};
  Object.keys(skillGroups).forEach((skillId) => {
    skillObjectives[skillId] = objectives.filter((obj) => obj.skillId === skillId);
  });

  return (
    <div style={{ maxWidth: '1000px' }}>
      <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', marginBottom: '1.5rem' }}>
        Grading Dashboard
      </h2>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {Object.entries(skillGroups).map(([skillId, group]: any) => {
          const skillObjs = skillObjectives[skillId] || [];
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
              {/* Skill Header */}
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
                    {group.skill.name}
                  </h3>
                  <p style={{ color: colors.text2, fontSize: '12px', margin: '0.25rem 0 0 0' }}>
                    {skillObjs.length} objectives
                  </p>
                </div>
                <span style={{ color: colors.text2, fontSize: '16px' }}>
                  {expandedSkills.has(skillId) ? '▼' : '▶'}
                </span>
              </button>

              {/* Objectives */}
              {expandedSkills.has(skillId) && (
                <div style={{ padding: '1rem', borderTop: `1px solid ${colors.border}`, display: 'grid', gap: '1rem' }}>
                  {skillObjs.length === 0 ? (
                    <p style={{ color: colors.text2, fontSize: '13px', margin: 0 }}>No objectives</p>
                  ) : (
                    skillObjs.map((obj) => {
                      const objSubmissions = submissions[obj.id] || [];
                      const submissionCount = objSubmissions.filter((s) => s.submittedAt).length;

                      return (
                        <div
                          key={obj.id}
                          style={{
                            backgroundColor: colors.bg,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '4px',
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            onClick={() => handleExpandObjective(obj.id)}
                            style={{
                              width: '100%',
                              padding: '1rem',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div style={{ textAlign: 'left' }}>
                              <p style={{ color: colors.text, fontSize: '13px', fontWeight: '500', margin: 0 }}>
                                {obj.text}
                              </p>
                              <p style={{ color: colors.text2, fontSize: '12px', margin: '0.25rem 0 0 0' }}>
                                {submissionCount} submission{submissionCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <span style={{ color: colors.text2 }}>
                              {expandedObjectives.has(obj.id) ? '▼' : '▶'}
                            </span>
                          </button>

                          {/* Submissions */}
                          {expandedObjectives.has(obj.id) && (
                            <div style={{ padding: '1rem', borderTop: `1px solid ${colors.border}`, display: 'grid', gap: '0.75rem' }}>
                              {objSubmissions.length === 0 ? (
                                <p style={{ color: colors.text2, fontSize: '12px', margin: 0 }}>
                                  No submissions yet
                                </p>
                              ) : (
                                objSubmissions.map((sub) => (
                                  <button
                                    key={`${sub.objectiveId}-${sub.studentId}`}
                                    onClick={() => setSelectedSubmission(sub)}
                                    style={{
                                      width: '100%',
                                      padding: '0.75rem',
                                      backgroundColor: colors.surface,
                                      border: `1px solid ${colors.border}`,
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                      (e.target as HTMLButtonElement).style.backgroundColor = colors.bg;
                                    }}
                                    onMouseLeave={(e) => {
                                      (e.target as HTMLButtonElement).style.backgroundColor = colors.surface;
                                    }}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div>
                                        <p style={{ color: colors.text, fontSize: '13px', fontWeight: '500', margin: 0 }}>
                                          {sub.student?.name}
                                        </p>
                                        <p style={{ color: colors.text2, fontSize: '12px', margin: '0.25rem 0 0 0' }}>
                                          {sub.status === 'graded' ? '✓ Graded' : 'Pending feedback'}
                                        </p>
                                      </div>
                                      <span
                                        style={{
                                          display: 'inline-block',
                                          padding: '4px 8px',
                                          backgroundColor: sub.status === 'graded' ? '#10b981' : '#f59e0b',
                                          color: 'white',
                                          borderRadius: '3px',
                                          fontSize: '11px',
                                          fontWeight: '600',
                                        }}
                                      >
                                        {sub.status === 'graded' ? 'Graded' : 'Submitted'}
                                      </span>
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grading Modal */}
      {selectedSubmission && (
        <SubmissionGradingModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onGrade={(feedback, passed) =>
            handleGradeSubmission(
              selectedSubmission.objectiveId,
              selectedSubmission.studentId,
              feedback,
              passed
            )
          }
        />
      )}
    </div>
  );
}

function SubmissionGradingModal({
  submission,
  onClose,
  onGrade,
}: {
  submission: any;
  onClose: () => void;
  onGrade: (feedback: string, passed: boolean) => void;
}) {
  const [feedback, setFeedback] = useState(submission.teacherFeedback || '');
  const [passed, setPassed] = useState(submission.teacherRating === 'pass');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: '8px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          padding: '2rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', margin: '0 0 1rem 0' }}>
          Grade Submission
        </h2>

        <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
              Student
            </p>
            <p style={{ color: colors.text, fontSize: '14px', margin: 0 }}>
              {submission.student?.name}
            </p>
          </div>

          <div>
            <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
              Objective
            </p>
            <p style={{ color: colors.text, fontSize: '14px', margin: 0 }}>
              {submission.objective?.text}
            </p>
          </div>

          {submission.submissionType === 'text' ? (
            <div>
              <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                Student Submission
              </p>
              <div
                style={{
                  backgroundColor: colors.bg,
                  padding: '1rem',
                  borderRadius: '4px',
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontSize: '13px',
                  lineHeight: '1.6',
                  maxHeight: '300px',
                  overflow: 'auto',
                }}
              >
                {submission.submissionText}
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                Submission Link
              </p>
              <a
                href={submission.submissionUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: colors.teal.accent,
                  textDecoration: 'underline',
                  fontSize: '13px',
                }}
              >
                Open submission →
              </a>
            </div>
          )}

          {submission.studentFeedback && (
            <div>
              <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                Student Reflection
              </p>
              <div
                style={{
                  backgroundColor: colors.bg,
                  padding: '1rem',
                  borderRadius: '4px',
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontSize: '13px',
                  lineHeight: '1.6',
                }}
              >
                {submission.studentFeedback}
              </div>
            </div>
          )}

          <div>
            <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
              Your Feedback
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback..."
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                backgroundColor: colors.bg,
                color: colors.text,
                fontSize: '13px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={passed}
              onChange={(e) => setPassed(e.target.checked)}
              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
            />
            <span style={{ color: colors.text, fontSize: '14px', fontWeight: '500' }}>
              Student passed this objective
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => onGrade(feedback, passed)}
            style={{
              flex: 1,
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
            Save Grade
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px 16px',
              backgroundColor: colors.border,
              color: colors.text,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
