'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { colors } from '@/app/design/colors';
import { terminology } from '@/app/config/terminology';

interface SubmissionRow {
  id: string;
  studentName: string;
  studentId: string;
  skillName: string;
  objectiveText: string;
  objectiveId: string;
  status: 'submitted' | 'graded';
  submittedAt: string;
  raw: any;
}

export function TeacherGradingInbox({ classId }: { classId: string }) {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'date' | 'student' | 'skill'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'graded'>('pending');

  useEffect(() => {
    const fetchAllSubmissions = async () => {
      try {
        const [skillsRes, objectivesRes] = await Promise.all([
          fetch(`/api/improv/classes/${classId}/skills`),
          fetch(`/api/improv/classes/${classId}/objectives`),
        ]);

        if (!skillsRes.ok || !objectivesRes.ok) throw new Error('Failed to fetch data');

        const skillsData = await skillsRes.json();
        const objectivesData = await objectivesRes.json();

        const classSkills = skillsData.classSkills || [];
        const classObjectives = objectivesData.objectives || [];

        // Build skill map
        const skillMap = new Map();
        classSkills.forEach((cs: any) => {
          skillMap.set(cs.skillId, cs.skill.name);
        });

        // Fetch all submissions for all objectives
        const allSubmissions: SubmissionRow[] = [];
        for (const obj of classObjectives) {
          try {
            const res = await fetch(
              `/api/improv/classes/${classId}/objectives/${obj.id}/assessments`
            );
            if (res.ok) {
              const data = await res.json();
              const assessments = data.assessments || [];

              assessments.forEach((assessment: any) => {
                if (assessment.submittedAt) {
                  allSubmissions.push({
                    id: `${obj.id}-${assessment.studentId}`,
                    studentName: assessment.student?.name || 'Unknown',
                    studentId: assessment.studentId,
                    skillName: skillMap.get(obj.skillId) || 'Unknown Skill',
                    objectiveText: obj.text,
                    objectiveId: obj.id,
                    status: assessment.status || 'submitted',
                    submittedAt: assessment.submittedAt,
                    raw: assessment,
                  });
                }
              });
            }
          } catch (err) {
            console.error(`Failed to fetch submissions for objective ${obj.id}:`, err);
          }
        }

        setSubmissions(allSubmissions);
      } catch (err) {
        console.error('Failed to fetch submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSubmissions();
  }, [classId]);

  const filteredSubmissions = submissions.filter((sub) => {
    if (filterStatus === 'pending') return sub.status === 'submitted';
    if (filterStatus === 'graded') return sub.status === 'graded';
    return true;
  });

  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    } else if (sortBy === 'student') {
      return a.studentName.localeCompare(b.studentName);
    } else {
      return a.skillName.localeCompare(b.skillName);
    }
  });

  const pendingCount = submissions.filter((s) => s.status === 'submitted').length;

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading submissions...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', margin: 0 }}>
          {terminology.teacher.headers.gradingDashboard}
        </h2>
        <p style={{ color: colors.text2, fontSize: '14px', marginTop: '0.5rem' }}>
          {pendingCount > 0 ? (
            <span style={{ fontWeight: '600', color: '#ef4444' }}>
              🔴 {pendingCount} submission{pendingCount !== 1 ? 's' : ''} waiting to grade
            </span>
          ) : (
            <span>✓ All submissions graded</span>
          )}
        </p>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Sort Dropdown */}
        <div>
          <label style={{ fontSize: '12px', color: colors.text2, fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '6px 10px',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              backgroundColor: colors.surface,
              color: colors.text,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <option value="date">Most Recent</option>
            <option value="student">Student Name</option>
            <option value="skill">Skill</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label style={{ fontSize: '12px', color: colors.text2, fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
            Filter
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            style={{
              padding: '6px 10px',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              backgroundColor: colors.surface,
              color: colors.text,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <option value="all">All ({submissions.length})</option>
            <option value="pending">Pending ({pendingCount})</option>
            <option value="graded">Graded ({submissions.length - pendingCount})</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      {sortedSubmissions.length === 0 ? (
        <div
          style={{
            padding: '2rem',
            backgroundColor: colors.surface,
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            textAlign: 'center',
            color: colors.text2,
          }}
        >
          <p>No submissions to display</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {/* Header Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '200px 150px 1fr 100px 120px 80px',
              gap: '1rem',
              padding: '0.75rem 1rem',
              backgroundColor: colors.bg,
              borderBottom: `2px solid ${colors.border}`,
              fontWeight: '600',
              fontSize: '12px',
              color: colors.text2,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            <div>Student</div>
            <div>Skill</div>
            <div>Objective</div>
            <div>Submitted</div>
            <div>Status</div>
            <div>Action</div>
          </div>

          {/* Data Rows */}
          {sortedSubmissions.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubmission(sub.raw)}
              style={{
                display: 'grid',
                gridTemplateColumns: '200px 150px 1fr 100px 120px 80px',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget;
                btn.style.backgroundColor = colors.bg;
                btn.style.borderColor = colors.teal.accent;
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget;
                btn.style.backgroundColor = colors.surface;
                btn.style.borderColor = colors.border;
              }}
            >
              <div>
                <p style={{ color: colors.text, fontSize: '13px', fontWeight: '500', margin: 0 }}>
                  {sub.studentName}
                </p>
              </div>

              <div>
                <p style={{ color: colors.text2, fontSize: '12px', margin: 0 }}>
                  {sub.skillName}
                </p>
              </div>

              <div>
                <p
                  style={{
                    color: colors.text,
                    fontSize: '13px',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={sub.objectiveText}
                >
                  {sub.objectiveText}
                </p>
              </div>

              <div>
                <p style={{ color: colors.text2, fontSize: '12px', margin: 0 }}>
                  {new Date(sub.submittedAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: sub.status === 'graded' ? '#10b981' : '#f59e0b',
                  }}
                >
                  {sub.status === 'graded' ? '✓ Graded' : 'Pending'}
                </span>
              </div>

              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSubmission(sub.raw);
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: colors.teal.accent,
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {sub.status === 'graded' ? 'View' : 'Grade'}
                </button>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Grading Modal */}
      {selectedSubmission && (
        <GradingModal
          submission={selectedSubmission}
          classId={classId}
          onClose={() => setSelectedSubmission(null)}
          onGradeComplete={() => {
            setSelectedSubmission(null);
            // Trigger reload in parent
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

function GradingModal({
  submission,
  classId,
  onClose,
  onGradeComplete,
}: {
  submission: any;
  classId: string;
  onClose: () => void;
  onGradeComplete: () => void;
}) {
  const [feedback, setFeedback] = useState(submission.teacherFeedback || '');
  const [passed, setPassed] = useState(submission.teacherRating === 'pass');
  const [saving, setSaving] = useState(false);

  const handleGrade = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/improv/classes/${classId}/objectives/${submission.objectiveId}/assessments`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: submission.studentId,
            teacherFeedback: feedback,
            teacherRating: passed ? 'pass' : 'fail',
          }),
        }
      );

      if (res.ok) {
        onGradeComplete();
      } else {
        alert('Failed to save grade');
      }
    } catch (err) {
      console.error('Failed to grade:', err);
      alert('Error saving grade');
    } finally {
      setSaving(false);
    }
  };

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
          maxWidth: '700px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '2rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', margin: 0 }}>
              Grade Submission
            </h2>
            <p style={{ color: colors.text2, fontSize: '12px', margin: '0.5rem 0 0 0' }}>
              {submission.student?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: colors.text2,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
              Objective
            </p>
            <p style={{ color: colors.text, fontSize: '13px', margin: 0 }}>
              {submission.objective?.text}
            </p>
          </div>

          {submission.submissionType === 'text' && submission.submissionText && (
            <div>
              <p style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
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
                  maxHeight: '250px',
                  overflow: 'auto',
                }}
              >
                {submission.submissionText}
              </div>
            </div>
          )}

          {submission.submissionType === 'google-doc' && submission.submissionUrl && (
            <div>
              <p style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
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
                Open in Google Docs →
              </a>
            </div>
          )}

          {submission.studentFeedback && (
            <div>
              <p style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
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
            <p style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
              Your Feedback
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What went well? What should they work on?"
              style={{
                width: '100%',
                minHeight: '120px',
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
              ✓ Mastered (Pass)
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleGrade}
            disabled={saving}
            style={{
              flex: 1,
              padding: '10px 16px',
              backgroundColor: colors.teal.accent,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Grade'}
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
