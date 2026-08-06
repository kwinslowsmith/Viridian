'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { colors } from '@/app/modules/improv/design/colors';
import { terminology, getMandatoryBadgeInfo } from '@/app/config/terminology';

export function StudentObjectiveSubmission({
  classId,
  objective,
  onClose,
}: {
  classId: string;
  objective: any;
  onClose?: () => void;
}) {
  const { data: session } = useSession();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submissionType, setSubmissionType] = useState('text');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [studentRating, setStudentRating] = useState(0);
  const [studentFeedback, setStudentFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await fetch(
          `/api/improv/classes/${classId}/objectives/${objective.id}/assessments`
        );
        if (res.ok) {
          const data = await res.json();
          setAssessment(data.assessment);
          if (data.assessment.submissionType) {
            setSubmissionType(data.assessment.submissionType);
            setSubmissionUrl(data.assessment.submissionUrl || '');
            setSubmissionText(data.assessment.submissionText || '');
            setStudentRating(data.assessment.studentRating || 0);
            setStudentFeedback(data.assessment.studentFeedback || '');
          }
        }
      } catch (err) {
        console.error('Failed to fetch assessment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [classId, objective.id]);

  const handleSubmit = async () => {
    if (!submissionUrl && !submissionText) {
      alert('Please provide a submission (URL or text)');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        `/api/improv/classes/${classId}/objectives/${objective.id}/assessments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submissionType,
            submissionUrl: submissionType === 'google-doc' ? submissionUrl : null,
            submissionText: submissionType === 'text' ? submissionText : null,
            studentRubricType: 'feedback',
            studentRating,
            studentFeedback,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setAssessment(data.assessment);
        alert('Submission saved!');
      }
    } catch (err) {
      console.error('Failed to submit:', err);
      alert('Failed to submit');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading...</div>;
  }

  const isSubmitted = assessment?.status === 'submitted' || assessment?.status === 'graded';
  const isGraded = assessment?.status === 'graded';

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
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '700px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '700', margin: 0 }}>
              {objective.text}
            </h2>
            <p style={{ color: colors.text2, fontSize: '13px', margin: '0.5rem 0 0 0' }}>
              {objective.skill.name}
              {objective.isMandatory && ` • ${getMandatoryBadgeInfo(true).label}`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: colors.text2,
              fontSize: '24px',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Assessment Guidance */}
        {objective.assessmentGuidance && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: colors.bg, borderRadius: '8px' }}>
            <h3 style={{ color: colors.text, fontSize: '13px', fontWeight: '600', marginBottom: '0.5rem' }}>
              Assessment Guidance
            </h3>
            <p style={{ color: colors.text2, fontSize: '13px', margin: 0 }}>
              {objective.assessmentGuidance.startsWith('http') ? (
                <a
                  href={objective.assessmentGuidance}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: colors.teal.accent, textDecoration: 'none' }}
                >
                  View guidance →
                </a>
              ) : (
                objective.assessmentGuidance
              )}
            </p>
          </div>
        )}

        {/* Submission Form */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '600', marginBottom: '1rem' }}>
            {terminology.student.headers.submission}
          </h3>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value="text"
                  checked={submissionType === 'text'}
                  onChange={() => setSubmissionType('text')}
                  disabled={isSubmitted}
                />
                <span style={{ color: colors.text, fontSize: '13px' }}>Text Submission</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value="google-doc"
                  checked={submissionType === 'google-doc'}
                  onChange={() => setSubmissionType('google-doc')}
                  disabled={isSubmitted}
                />
                <span style={{ color: colors.text, fontSize: '13px' }}>Google Doc URL</span>
              </label>
            </div>

            {submissionType === 'text' ? (
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                disabled={isSubmitted}
                placeholder="Write your response here..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  backgroundColor: colors.bg,
                  color: colors.text,
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  opacity: isSubmitted ? 0.6 : 1,
                  cursor: isSubmitted ? 'not-allowed' : 'text',
                }}
              />
            ) : (
              <input
                type="url"
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                disabled={isSubmitted}
                placeholder="https://docs.google.com/..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  backgroundColor: colors.bg,
                  color: colors.text,
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  opacity: isSubmitted ? 0.6 : 1,
                  cursor: isSubmitted ? 'not-allowed' : 'text',
                }}
              />
            )}
          </div>
        </div>

        {/* Self Assessment */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '600', marginBottom: '1rem' }}>
            {terminology.student.headers.selfAssessment}
          </h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
              Feedback
            </label>
            <textarea
              value={studentFeedback}
              onChange={(e) => setStudentFeedback(e.target.value)}
              disabled={isSubmitted}
              placeholder={terminology.student.prompts.reflectionPlaceholder}
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                backgroundColor: colors.bg,
                color: colors.text,
                fontFamily: 'inherit',
                fontSize: '13px',
                boxSizing: 'border-box',
                opacity: isSubmitted ? 0.6 : 1,
                cursor: isSubmitted ? 'not-allowed' : 'text',
              }}
            />
          </div>
        </div>

        {/* Teacher Feedback (if graded) */}
        {isGraded && assessment?.teacherFeedback && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#10b98120', borderLeft: '4px solid #10b981', borderRadius: '4px' }}>
            <h3 style={{ color: colors.text, fontSize: '13px', fontWeight: '600', marginBottom: '0.5rem' }}>
              Teacher Feedback
            </h3>
            <p style={{ color: colors.text, fontSize: '13px', margin: 0, whiteSpace: 'pre-wrap' }}>
              {assessment.teacherFeedback}
            </p>
          </div>
        )}

        {/* Submit Button */}
        {!isSubmitted && (
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: colors.teal.accent,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Submit'}
          </button>
        )}

        {isSubmitted && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#10b98120',
              color: '#10b981',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            ✓ Submitted {assessment?.submittedAt ? new Date(assessment.submittedAt).toLocaleDateString() : ''}
          </div>
        )}
      </div>
    </div>
  );
}
