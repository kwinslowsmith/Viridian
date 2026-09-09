'use client';

import React from 'react';
import { colors } from '@/app/design/colors';

interface Assessment {
  id: string;
  title: string;
}

interface SubmissionFiltersProps {
  assessments: Assessment[];
  selectedAssessment: string;
  onAssessmentChange: (id: string) => void;
  filterStatus: 'all' | 'pending' | 'graded';
  onStatusChange: (status: 'all' | 'pending' | 'graded') => void;
  sortBy: 'date' | 'student' | 'assessment';
  onSortChange: (sort: 'date' | 'student' | 'assessment') => void;
}

export function SubmissionFilters({
  assessments,
  selectedAssessment,
  onAssessmentChange,
  filterStatus,
  onStatusChange,
  sortBy,
  onSortChange,
}: SubmissionFiltersProps) {
  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        padding: '16px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {/* Assessment Filter */}
        <div>
          <label style={{ display: 'block', color: colors.text2, fontSize: '12px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>
            Assessment
          </label>
          <select
            value={selectedAssessment}
            onChange={(e) => onAssessmentChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              backgroundColor: colors.bg,
              color: colors.text,
              fontSize: '13px',
              boxSizing: 'border-box',
            }}
          >
            <option value="all">All Assessments</option>
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label style={{ display: 'block', color: colors.text2, fontSize: '12px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>
            Status
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['pending', 'graded', 'all'] as const).map((status) => (
              <button
                key={status}
                onClick={() => onStatusChange(status)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: filterStatus === status ? colors.teal.accent : colors.bg,
                  color: filterStatus === status ? 'white' : colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                }}
              >
                {status === 'all' ? 'All' : status === 'pending' ? 'Pending' : 'Graded'}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div>
          <label style={{ display: 'block', color: colors.text2, fontSize: '12px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'date' | 'student' | 'assessment')}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              backgroundColor: colors.bg,
              color: colors.text,
              fontSize: '13px',
              boxSizing: 'border-box',
            }}
          >
            <option value="date">Submitted Date</option>
            <option value="student">Student Name</option>
            <option value="assessment">Assessment</option>
          </select>
        </div>
      </div>
    </div>
  );
}
