'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/app/design/colors';
import { AssessmentList } from './AssessmentList';
import { AssessmentForm } from './AssessmentForm';

interface Assessment {
  id: string;
  title: string;
  description?: string;
  type: 'formative' | 'summative';
  dueDate?: string;
  submissionCount: number;
  gradedCount: number;
  objectiveIds?: string[];
}

interface AssessmentCreatorProps {
  classId: string;
}

export function AssessmentCreator({ classId }: AssessmentCreatorProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [objectives, setObjectives] = useState<Array<{ id: string; label: string; text: string }>>([]);

  useEffect(() => {
    fetchAssessments();
    fetchObjectives();
  }, [classId]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/k12-classes/${classId}/assessments`);
      if (!response.ok) throw new Error('Failed to fetch assessments');
      const data = await response.json();
      setAssessments(data.assessments || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessments');
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchObjectives = async () => {
    try {
      const response = await fetch(`/api/k12-classes/${classId}/objectives`);
      if (!response.ok) throw new Error('Failed to fetch objectives');
      const data = await response.json();
      setObjectives(data.objectives || []);
    } catch (err) {
      console.error('Failed to fetch objectives:', err);
    }
  };

  const handleCreateAssessment = async (formData: any) => {
    try {
      const response = await fetch(`/api/k12-classes/${classId}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create assessment');
      await fetchAssessments();
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assessment');
    }
  };

  const handleUpdateAssessment = async (assessmentId: string, formData: any) => {
    try {
      const response = await fetch(`/api/k12-classes/${classId}/assessments/${assessmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update assessment');
      await fetchAssessments();
      setEditingAssessment(null);
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assessment');
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!confirm('Are you sure you want to delete this assessment?')) return;

    try {
      const response = await fetch(`/api/k12-classes/${classId}/assessments/${assessmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete assessment');
      await fetchAssessments();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete assessment');
    }
  };

  const handleEdit = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAssessment(null);
  };

  if (loading) {
    return <div style={{ padding: '24px', color: colors.text2 }}>Loading assessments...</div>;
  }

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold', margin: '0' }}>
              📝 Assessments
            </h1>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  backgroundColor: colors.teal.accent,
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                + New Assessment
              </button>
            )}
          </div>
          <p style={{ color: colors.text2, margin: '0' }}>Create and manage assessments for your class</p>
        </div>

        {/* Error Message */}
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

        {/* Form */}
        {showForm && (
          <AssessmentForm
            assessment={editingAssessment}
            objectives={objectives}
            onSubmit={editingAssessment ? (data) => handleUpdateAssessment(editingAssessment.id, data) : handleCreateAssessment}
            onCancel={handleCloseForm}
          />
        )}

        {/* List */}
        <AssessmentList
          assessments={assessments}
          onEdit={handleEdit}
          onDelete={handleDeleteAssessment}
        />
      </div>
    </div>
  );
}
