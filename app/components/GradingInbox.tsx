'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/app/design/colors';
import { SubmissionFilters } from './SubmissionFilters';
import { SubmissionTable } from './SubmissionTable';

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

interface Assessment {
  id: string;
  title: string;
}

interface GradingInboxProps {
  classId: string;
}

type SortBy = 'date' | 'student' | 'assessment';
type FilterStatus = 'all' | 'pending' | 'graded';

export function GradingInbox({ classId }: GradingInboxProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
  const [sortBy, setSortBy] = useState<SortBy>('date');

  useEffect(() => {
    fetchSubmissions();
    fetchAssessments();
  }, [classId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/k12-classes/${classId}/submissions`);
      if (!response.ok) throw new Error('Failed to fetch submissions');
      const data = await response.json();
      setSubmissions(Array.isArray(data) ? data : data.submissions || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessments = async () => {
    try {
      const response = await fetch(`/api/k12-classes/${classId}/assessments`);
      if (!response.ok) throw new Error('Failed to fetch assessments');
      const data = await response.json();
      setAssessments(Array.isArray(data) ? data : data.assessments || []);
    } catch (err) {
      console.error('Failed to fetch assessments:', err);
    }
  };

  const getFilteredAndSorted = () => {
    let filtered = [...submissions];

    if (filterStatus === 'pending') {
      filtered = filtered.filter((s) => s.status === 'pending');
    } else if (filterStatus === 'graded') {
      filtered = filtered.filter((s) => s.status === 'graded');
    }

    if (selectedAssessment !== 'all') {
      filtered = filtered.filter((s) => s.assessmentId === selectedAssessment);
    }

    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    } else if (sortBy === 'student') {
      filtered.sort((a, b) => a.studentName.localeCompare(b.studentName));
    } else if (sortBy === 'assessment') {
      filtered.sort((a, b) => a.assessmentTitle.localeCompare(b.assessmentTitle));
    }

    return filtered;
  };

  const filtered = getFilteredAndSorted();
  const pendingCount = submissions.filter((s) => s.status === 'pending').length;

  if (loading) {
    return <div style={{ padding: '24px', color: colors.text2 }}>Loading submissions...</div>;
  }

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px' }}>
            📥 Grading Inbox
          </h1>
          <p style={{ color: colors.text2, margin: '0' }}>
            {pendingCount} pending submission{pendingCount !== 1 ? 's' : ''} to grade
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              border: `1px solid #fecaca`,
              borderLeft: '4px solid #ef4444',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              color: '#7f1d1d',
            }}
          >
            ❌ {error}
          </div>
        )}

        <SubmissionFilters
          assessments={assessments}
          selectedAssessment={selectedAssessment}
          onAssessmentChange={setSelectedAssessment}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {filtered.length === 0 ? (
          <div
            style={{
              backgroundColor: colors.surface,
              borderRadius: '12px',
              padding: '48px',
              textAlign: 'center',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
            <p style={{ color: colors.text, fontSize: '18px', fontWeight: '600', margin: '0 0 8px' }}>
              All caught up!
            </p>
            <p style={{ color: colors.text2, fontSize: '14px', margin: '0' }}>
              No submissions match your filters
            </p>
          </div>
        ) : (
          <SubmissionTable submissions={filtered} classId={classId} />
        )}
      </div>
    </div>
  );
}
