'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { colors } from '@/app/design/colors';
import { terminology } from '@/app/config/terminology';

interface SubmissionItem {
  id: string;
  objectiveId: string;
  studentId: string;
  classId: string;
  status: string;
  submittedAt?: string;
  submissionType?: string;
  submissionText?: string;
  submissionUrl?: string;
  studentFeedback?: string;
  teacherFeedback?: string;
  studentRating?: number;
  teacherRating?: number;
  objective: {
    id: string;
    text: string;
    skill: {
      id: string;
      name: string;
    };
  };
  student: {
    id: string;
    name: string;
    email: string;
  };
}

interface SubmissionGradingModalProps {
  submission: SubmissionItem;
  onClose: () => void;
  onGrade: (feedback: string, passed: boolean) => Promise<void>;
}

export function GradingInbox({ classId }: { classId: string }) {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'notStarted'>('submitted');
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`/api/improv/classes/${classId}/grading-inbox`);
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.submissions || []);
        }
      } catch (err) {
        console.error('Failed to fetch grading inbox:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [classId]);

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'submitted') return sub.status === 'submitted';
    if (filter === 'notStarted') return sub.status === 'not-started';
    return true;
  });

  const handleGrade = async (feedback: string, passed: boolean) => {
    if (!selectedSubmission) return;

    setGrading(true);
    try {
      const res = await fetch(
        `/api/improv/classes/${classId}/objectives/${selectedSubmission.objectiveId}/assessments`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: selectedSubmission.studentId,
            teacherFeedback: feedback,
            teacherRating: passed ? 1 : 0,
          }),
        }
      );

      if (res.ok) {
        // Remove from list
        setSubmissions(prev => prev.filter(s => s.id !== selectedSubmission.id));
        setSelectedSubmission(null);
      }
    } catch (err) {
      console.error('Failed to grade submission:', err);
      alert('Failed to save grade');
    } finally {
      setGrading(false);
    }
  };

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading grading inbox...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', margin: 0 }}>
          {terminology.teacher.headers.gradingDashboard}
        </h2>
        <div style={{ color: colors.text2, fontSize: '14px' }}>
          {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: `1px solid ${colors.border}` }}>
        {['submitted', 'notStarted', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: filter === f ? `2px solid ${colors.teal.accent}` : 'none',
              color: filter === f ? colors.text : colors.text2,
              cursor: 'pointer',
              fontWeight: filter === f ? '600' : '400',
              fontSize: '14px',
            }}
          >
            {f === 'submitted' && 'Waiting for Grade'}
            {f === 'notStarted' && 'Not Started'}
            {f === 'all' && 'All'}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: colors.bg, borderRadius: '8px' }}>
          <p style={{ color: colors.text2, margin: 0 }}>
            {filter === 'submitted' && 'No submissions awaiting feedback'}
            {filter === 'notStarted' && 'No unstarted submissions'}
            {filter === 'all' && 'No submissions'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredSubmissions.map(sub => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubmission(sub)}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.bg;
                (e.currentTarget as HTMLButtonElement).style.borderColor = colors.teal.accent;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.surface;
                (e.currentTarget as HTMLButtonElement).style.borderColor = colors.border;
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                <div>
                  <p style={{ color: colors.text, fontSize: '14px', fontWeight: '500', margin: 0 }}>
                    {sub.student.name}
                  </p>
                  <p style={{ color: colors.text2, fontSize: '13px', margin: '0.5rem 0 0 0' }}>
                    <strong>{sub.objective.skill.name}</strong> → {sub.objective.text}
                  </p>
                  {sub.submittedAt && (
                    <p style={{ color: colors.text2, fontSize: '12px', margin: '0.25rem 0 0 0' }}>
                      Submitted {new Date(sub.submittedAt).toLocaleDateString()} at{' '}
                      {new Date(sub.submittedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: sub.status === 'submitted' ? '#f59e0b' : '#9ca3af',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {sub.status === 'submitted' ? 'Submitted' : 'Not Started'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Grading Modal */}
      {selectedSubmission && (
        <SubmissionGradingModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onGrade={handleGrade}
        />
      )}
    </div>
  );
}

function SubmissionGradingModal({
  submission,
  onClose,
  onGrade,
}: SubmissionGradingModalProps) {
  const [feedback, setFeedback] = useState(submission.teacherFeedback || '');
  const [passed, setPassed] = useState(!!submission.teacherRating);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onGrade(feedback, passed);
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
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          padding: '2rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', margin: '0 0 1.5rem 0' }}>
          Grade Submission
        </h2>

        <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
              Student
            </p>
            <p style={{ color: colors.text, fontSize: '14px', margin: 0 }}>
              {submission.student.name}
            </p>
          </div>

          <div>
            <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
              Objective
            </p>
            <p style={{ color: colors.text, fontSize: '14px', margin: 0 }}>
              <strong>{submission.objective.skill.name}</strong> → {submission.objective.text}
            </p>
          </div>

          {submission.submissionType === 'text' ? (
            <div>
              <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                {terminology.student.headers.submission}
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
                {submission.submissionText || '(No text submission)'}
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                Submission Link
              </p>
              {submission.submissionUrl ? (
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
              ) : (
                <p style={{ color: colors.text2, fontSize: '13px', margin: 0 }}>No URL provided</p>
              )}
            </div>
          )}

          {submission.studentFeedback && (
            <div>
              <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                {terminology.student.headers.selfAssessment}
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
              {terminology.teacher.headers.feedback}
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={terminology.teacher.prompts.feedbackPlaceholder}
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
              {terminology.teacher.labels.masterized}
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleSubmit}
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
            disabled={saving}
            style={{
              flex: 1,
              padding: '10px 16px',
              backgroundColor: colors.border,
              color: colors.text,
              border: 'none',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              opacity: saving ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
