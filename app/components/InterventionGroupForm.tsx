'use client';

import React, { useState } from 'react';
import { colors } from '@/app/design/colors';

interface Objective {
  id: string;
  label: string;
  text: string;
}

interface Student {
  id: string;
  name: string;
}

interface InterventionGroupFormProps {
  objectives: Objective[];
  students: Student[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function InterventionGroupForm({
  objectives,
  students,
  onSubmit,
  onCancel,
}: InterventionGroupFormProps) {
  const [name, setName] = useState('');
  const [objectiveId, setObjectiveId] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [meetingSchedule, setMeetingSchedule] = useState('');
  const [saving, setSaving] = useState(false);

  const handleStudentToggle = (studentId: string) => {
    const newSet = new Set(selectedStudents);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setSelectedStudents(newSet);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !objectiveId) return;

    setSaving(true);
    try {
      await onSubmit({
        name,
        objectiveId,
        studentIds: Array.from(selectedStudents),
        meetingSchedule,
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
        ➕ Create Intervention Group
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
            Group Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Theme Analysis Support"
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

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
            Objective *
          </label>
          <select
            value={objectiveId}
            onChange={(e) => setObjectiveId(e.target.value)}
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
          >
            <option value="">-- Select objective --</option>
            {objectives.map((obj) => (
              <option key={obj.id} value={obj.id}>
                {obj.label} - {obj.text}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
            Meeting Schedule
          </label>
          <input
            type="text"
            value={meetingSchedule}
            onChange={(e) => setMeetingSchedule(e.target.value)}
            placeholder="e.g., Tuesdays 2pm"
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

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '12px', fontSize: '14px' }}>
            Add Students
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px',
              padding: '12px',
              backgroundColor: colors.bg,
              borderRadius: '6px',
              border: `1px solid ${colors.border}`,
            }}
          >
            {students.map((student) => (
              <label key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedStudents.has(student.id)}
                  onChange={() => handleStudentToggle(student.id)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ color: colors.text, fontSize: '13px' }}>{student.name}</span>
              </label>
            ))}
          </div>
          <p style={{ color: colors.text2, fontSize: '12px', margin: '8px 0 0' }}>
            {selectedStudents.size} student{selectedStudents.size !== 1 ? 's' : ''} selected
          </p>
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
            disabled={saving || !name.trim() || !objectiveId}
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
            {saving ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </form>
    </div>
  );
}
