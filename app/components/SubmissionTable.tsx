'use client';

import React, { useState } from 'react';
import { colors } from '@/app/design/colors';

interface Submission {
  submissionId: string;
  studentId: string;
  studentName: string;
  assessmentId: string;
  assessmentTitle: string;
  submittedAt: string;
  grade?: number;
  status: 'pending' | 'graded';
}

interface SubmissionTableProps {
  submissions: Submission[];
  classId: string;
}

export function SubmissionTable({ submissions, classId }: SubmissionTableProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => (status === 'pending' ? '#f59e0b' : '#10b981');
  const getStatusLabel = (status: string) => (status === 'pending' ? 'Pending' : 'Graded');

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
              <th style={{ padding: '16px', textAlign: 'left', color: colors.text2, fontWeight: '600', fontSize: '13px' }}>
                Student
              </th>
              <th style={{ padding: '16px', textAlign: 'left', color: colors.text2, fontWeight: '600', fontSize: '13px' }}>
                Assessment
              </th>
              <th style={{ padding: '16px', textAlign: 'left', color: colors.text2, fontWeight: '600', fontSize: '13px' }}>
                Submitted
              </th>
              <th style={{ padding: '16px', textAlign: 'center', color: colors.text2, fontWeight: '600', fontSize: '13px' }}>
                Grade
              </th>
              <th style={{ padding: '16px', textAlign: 'center', color: colors.text2, fontWeight: '600', fontSize: '13px' }}>
                Status
              </th>
              <th style={{ padding: '16px', textAlign: 'right', color: colors.text2, fontWeight: '600', fontSize: '13px' }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission, idx) => (
              <tr
                key={submission.submissionId}
                style={{
                  borderBottom: idx !== submissions.length - 1 ? `1px solid ${colors.border}` : 'none',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : colors.bg,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.bg)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'transparent' : colors.bg)}
              >
                <td style={{ padding: '16px', color: colors.text, fontSize: '14px', fontWeight: '500' }}>
                  {submission.studentName}
                </td>
                <td style={{ padding: '16px', color: colors.text2, fontSize: '14px' }}>
                  {submission.assessmentTitle}
                </td>
                <td style={{ padding: '16px', color: colors.text2, fontSize: '14px' }}>
                  {formatDate(submission.submittedAt)}
                </td>
                <td style={{ padding: '16px', textAlign: 'center', color: colors.text, fontSize: '14px', fontWeight: '600' }}>
                  {submission.grade ? `${submission.grade}%` : '-'}
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span
                    style={{
                      backgroundColor: getStatusColor(submission.status),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'inline-block',
                    }}
                  >
                    {getStatusLabel(submission.status)}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <button
                    onClick={() => setSelectedSubmission(submission.submissionId)}
                    style={{
                      padding: '6px 16px',
                      backgroundColor: colors.teal.accent,
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    {submission.status === 'pending' ? 'Grade' : 'Review'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
