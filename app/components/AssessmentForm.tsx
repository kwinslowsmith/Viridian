'use client';

import React, { useState } from 'react';
import { colors } from '@/app/design/colors';

interface Objective {
  id: string;
  label: string;
  text: string;
}

interface Assessment {
  id?: string;
  title: string;
  description?: string;
  type: 'formative' | 'summative';
  dueDate?: string;
  objectiveIds?: string[];
}

interface AssessmentFormProps {
  assessment: Assessment | null;
  objectives: Objective[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function AssessmentForm({ assessment, objectives, onSubmit, onCancel }: AssessmentFormProps) {
  const [title, setTitle] = useState(assessment?.title || '');
  const [description, setDescription] = useState(assessment?.description || '');
  const [type, setType] = useState<'formative' | 'summative'>(assessment?.type || 'formative');
  const [dueDate, setDueDate] = useState(assessment?.dueDate || '');
  const [selectedObjectives, setSelectedObjectives] = useState<Set<string>>(
    new Set(assessment?.objectiveIds || [])
  );
  const [saving, setSaving] = useState(false);

  const handleObjectiveToggle = (objectiveId: string) => {
    const newSet = new Set(selectedObjectives);
    if (newSet.has(objectiveId)) {
      newSet.delete(objectiveId);
    } else {
      newSet.add(objectiveId);
    }
    setSelectedObjectives(newSet);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      await onSubmit({
        title,
        description,
        type,
        dueDate: dueDate || null,
        objectiveIds: Array.from(selectedObjectives),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: 'bold', margin: '0 0 24px' }}>
        {assessment?.id ? '✏️ Edit Assessment' : '➕ Create New Assessment'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                backgroundColor: colors.bg,
                color: colors.text,
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'formative' | 'summative')}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                backgroundColor: colors.bg,
                color: colors.text,
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            >
              <option value="formative">Formative</option>
              <option value="summative">Summative</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              backgroundColor: colors.bg,
              color: colors.text,
              fontSize: '14px',
              boxSizing: 'border-box',
              minHeight: '100px',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                backgroundColor: colors.bg,
                color: colors.text,
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '12px', fontSize: '14px' }}>
            Link Objectives
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '12px',
              padding: '12px',
              backgroundColor: colors.bg,
              borderRadius: '6px',
              border: `1px solid ${colors.border}`,
            }}
          >
            {objectives.length === 0 ? (
              <p style={{ color: colors.text2, fontSize: '14px', margin: '0', gridColumn: '1 / -1' }}>
                No objectives available
              </p>
            ) : (
              objectives.map((obj) => (
                <label
                  key={obj.id}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={selectedObjectives.has(obj.id)}
                    onChange={() => handleObjectiveToggle(obj.id)}
                    style={{ marginTop: '4px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ color: colors.text, fontSize: '13px', fontWeight: '500' }}>{obj.label}</div>
                    <div style={{ color: colors.text2, fontSize: '12px' }}>{obj.text}</div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: colors.text,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !title.trim()}
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
            {saving ? 'Saving...' : assessment?.id ? 'Update Assessment' : 'Create Assessment'}
          </button>
        </div>
      </form>
    </div>
  );
}
