'use client';

import React from 'react';
import { colors } from '@/app/modules/improv/design/colors';

interface PostGradeFeedbackProps {
  teacherFeedback?: string;
  teacherRating?: number;
  isMastered?: boolean;
  objectiveText?: string;
}

export function PostGradeFeedback({
  teacherFeedback,
  teacherRating,
  isMastered,
  objectiveText,
}: PostGradeFeedbackProps) {
  // Determine if mastered based on rating (1 = mastered, 0 = needs improvement)
  const passed = isMastered !== undefined ? isMastered : teacherRating === 1;

  if (!teacherFeedback) {
    return null;
  }

  return (
    <div
      style={{
        marginBottom: '1.5rem',
        padding: '1.5rem',
        backgroundColor: passed ? '#10b98120' : '#f59e0b20',
        borderLeft: `4px solid ${passed ? '#10b981' : '#f59e0b'}`,
        borderRadius: '6px',
      }}
    >
      {/* Status Header */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '20px' }}>
            {passed ? '🎉' : '💡'}
          </span>
          <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '700', margin: 0 }}>
            {passed ? 'Mastered!' : 'Keep Working!'}
          </h3>
        </div>
        <p style={{ color: colors.text2, fontSize: '12px', margin: 0 }}>
          {passed
            ? `Great job on "${objectiveText || 'this objective'}"! You've shown mastery.`
            : `You're on the right track with "${objectiveText || 'this objective'}". Here's what to focus on next:`}
        </p>
      </div>

      {/* Feedback Text */}
      <div
        style={{
          backgroundColor: colors.surface,
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
        }}
      >
        <p style={{ color: colors.text, fontSize: '13px', margin: 0, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
          {teacherFeedback}
        </p>
      </div>

      {/* Next Steps */}
      {!passed && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: colors.bg,
            borderRadius: '4px',
            borderLeft: `2px solid ${colors.teal.accent}`,
          }}
        >
          <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
            Next Step
          </p>
          <p style={{ color: colors.text, fontSize: '12px', margin: 0 }}>
            Review the feedback above and submit again when you're ready. You've got this! 💪
          </p>
        </div>
      )}

      {/* Encouragement */}
      {passed && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: colors.text2, fontSize: '12px', margin: 0, fontStyle: 'italic' }}>
            You're building mastery! Keep up the great work.
          </p>
        </div>
      )}
    </div>
  );
}
