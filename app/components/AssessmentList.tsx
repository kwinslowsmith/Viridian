'use client';

import React from 'react';
import { colors } from '@/app/design/colors';

interface Assessment {
  id: string;
  title: string;
  type: 'formative' | 'summative';
  dueDate?: string;
  submissionCount: number;
  gradedCount: number;
}

interface AssessmentListProps {
  assessments: Assessment[];
  onEdit: (assessment: Assessment) => void;
  onDelete: (id: string) => void;
}

export function AssessmentList({ assessments, onEdit, onDelete }: AssessmentListProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTypeColor = (type: string) => (type === 'summative' ? '#ef4444' : '#3b82f6');
  const getTypeLabel = (type: string) => (type === 'summative' ? 'Summative' : 'Formative');

  if (assessments.length === 0) {
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
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <p style={{ color: colors.text, fontSize: '18px', fontWeight: '600', margin: '0 0 8px' }}>
          No assessments yet
        </p>
        <p style={{ color: colors.text2, fontSize: '14px', margin: '0' }}>
          Create your first assessment to get started
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: colors.bg, borderBottom: `1px solid ${colors.border}` }}>
              <th style={{ padding: '16px', textAlign: 'left', color: colors.text2, fontWeight: '600', fontSize: '13px' }}>Title</th>
              <th style={{ padding: '16px', textAlign: 'left', color: colors.text2, fontWeight: '600', fontSize: '13px' }}>Type</th>
              <th style={{ padding: '16px', textAlign: 'left', color: colors.text2, fontWeight: '600', fontSize: '13px' }}>Due Date</th>
              <th style={{ padding: '16px', textAlign: 'center', color: colors.text2, fontWeight: '600', fontSize: '13px' }}>Submissions</th>
              <th style={{ padding: '16px', textAlign: 'center', color: colors.text2, fontWeight: '600', fontSize: '13px' }}>Graded</th>
              <th style={{ padding: '16px', textAlign: 'right', color: colors.text2, fontWeight: '600', fontSize: '13px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((assessment, idx) => (
              <tr
                key={assessment.id}
                style={{
                  borderBottom: idx !== assessments.length - 1 ? `1px solid ${colors.border}` : 'none',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : colors.bg,
                }}
              >
                <td style={{ padding: '16px', color: colors.text, fontSize: '14px', fontWeight: '500' }}>
                  {assessment.title}
                </td>
                <td style={{ padding: '16px', fontSize: '13px' }}>
                  <span
                    style={{
                      backgroundColor: getTypeColor(assessment.type),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'inline-block',
                    }}
                  >
                    {getTypeLabel(assessment.type)}
                  </span>
                </td>
                <td style={{ padding: '16px', color: colors.text2, fontSize: '14px' }}>
                  {formatDate(assessment.dueDate)}
                </td>
                <td style={{ padding: '16px', textAlign: 'center', color: colors.text, fontSize: '14px', fontWeight: '600' }}>
                  {assessment.submissionCount}
                </td>
                <td style={{ padding: '16px', textAlign: 'center', color: colors.text, fontSize: '14px', fontWeight: '600' }}>
                  {assessment.gradedCount}/{assessment.submissionCount}
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => onEdit(assessment)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: colors.teal.accent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(assessment.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
