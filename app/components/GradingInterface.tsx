'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/app/design/colors';

interface Submission {
  submissionId: string;
  studentName: string;
  assessmentTitle: string;
  submittedAt: string;
  content?: string;
  attachments?: Array<{ id: string; name: string; url: string }>;
  grade?: number;
  feedback?: string;
}

interface GradingInterfaceProps {
  classId: string;
  submissionId: string;
  onClose: () => void;
  onGraded: () => void;
}

export function GradingInterface({ classId, submissionId, onClose, onGraded }: GradingInterfaceProps) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [grade, setGrade] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/k12-classes/${classId}/submissions/${submissionId}`);
      if (!response.ok) throw new Error('Failed to fetch submission');
      const data = await response.json();
      setSubmission(data.submission);
      setGrade(data.submission.grade || 0);
      setFeedback(data.submission.feedback || '');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGrade = (quickGrade: number) => {
    setGrade(quickGrade);
  };

  const handleSubmitGrade = async () => {
    if (!submission) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/k12-classes/${classId}/submissions/${submissionId}/grade`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade, feedback }),
      });

      if (!response.ok) throw new Error('Failed to save grade');

      setSuccessMessage('Grade saved successfully!');
      setTimeout(() => {
        onGraded();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save grade');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: colors.bg,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            textAlign: 'center',
          }}
        >
          <p style={{ color: colors.text2 }}>Loading submission...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: colors.bg,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            textAlign: 'center',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <p style={{ color: '#ef4444' }}>Failed to load submission</p>
          <button onClick={onClose} style={{ padding: '8px 16px', marginTop: '16px' }}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: colors.bg,
          borderRadius: '12px',
          maxWidth: '700px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px' }}>
              Grade Submission
            </h2>
            <p style={{ color: colors.text2, fontSize: '13px', margin: '0' }}>
              {submission.studentName} • {submission.assessmentTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: colors.text2,
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div
              style={{
                backgroundColor: '#fee2e2',
                color: '#7f1d1d',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '13px',
              }}
            >
              ❌ {error}
            </div>
          )}

          {successMessage && (
            <div
              style={{
                backgroundColor: '#d1fae5',
                color: '#065f46',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '13px',
              }}
            >
              ✓ {successMessage}
            </div>
          )}

          {/* Submission Content */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: colors.text, fontSize: '13px', fontWeight: '600', margin: '0 0 12px', textTransform: 'uppercase' }}>
              Student Submission
            </h3>
            <div
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: '16px',
                minHeight: '150px',
                color: colors.text,
                lineHeight: '1.6',
                fontSize: '13px',
              }}
            >
              {submission.content || '(No content)'}
            </div>
            {submission.attachments && submission.attachments.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 8px' }}>
                  Attachments:
                </p>
                {submission.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: colors.teal.accent,
                      textDecoration: 'none',
                      marginRight: '8px',
                    }}
                  >
                    📎 {att.name}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Grade Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: colors.text, fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              Grade (0-100)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              style={{ width: '100%', marginBottom: '8px' }}
            />
            <input
              type="number"
              min="0"
              max="100"
              value={grade}
              onChange={(e) => setGrade(Math.max(0, Math.min(100, Number(e.target.value))))}
              style={{
                width: '80px',
                padding: '8px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                backgroundColor: colors.bg,
                color: colors.text,
                fontSize: '14px',
              }}
            />
          </div>

          {/* Quick Grade Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {[
              { label: 'Excellent', grade: 90 },
              { label: 'Good', grade: 80 },
              { label: 'Needs Work', grade: 65 },
              { label: 'Resubmit', grade: 0 },
            ].map((btn) => (
              <button
                key={btn.grade}
                onClick={() => handleQuickGrade(btn.grade)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: grade === btn.grade ? colors.teal.accent : colors.surface,
                  color: grade === btn.grade ? 'white' : colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Feedback */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: colors.text, fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback for the student..."
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                backgroundColor: colors.bg,
                color: colors.text,
                fontSize: '13px',
                minHeight: '120px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                border: `1px solid ${colors.border}`,
                backgroundColor: 'transparent',
                color: colors.text,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitGrade}
              disabled={saving}
              style={{
                padding: '12px 24px',
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
              {saving ? 'Saving...' : 'Save Grade'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
