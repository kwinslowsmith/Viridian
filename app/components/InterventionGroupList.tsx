'use client';

import React, { useState } from 'react';
import { colors } from '@/app/design/colors';

interface InterventionGroup {
  id: string;
  name: string;
  objectiveId: string;
  objectiveName: string;
  studentCount: number;
  meetingSchedule: string;
  studentIds: string[];
}

interface Student {
  id: string;
  name: string;
}

interface InterventionGroupListProps {
  groups: InterventionGroup[];
  students: Student[];
  onEdit: (group: InterventionGroup) => void;
  onDelete: (id: string) => void;
  onAddStudent: (groupId: string, studentId: string) => void;
  onRemoveStudent: (groupId: string, studentId: string) => void;
}

export function InterventionGroupList({
  groups,
  students,
  onEdit,
  onDelete,
  onAddStudent,
  onRemoveStudent,
}: InterventionGroupListProps) {
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  if (groups.length === 0) {
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
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
        <p style={{ color: colors.text, fontSize: '18px', fontWeight: '600', margin: '0 0 8px' }}>
          No intervention groups yet
        </p>
        <p style={{ color: colors.text2, fontSize: '14px', margin: '0' }}>
          Create groups to support struggling students
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {groups.map((group) => (
        <div
          key={group.id}
          style={{
            backgroundColor: colors.surface,
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            overflow: 'hidden',
          }}
        >
          <div
            onClick={() => setExpandedGroupId(expandedGroupId === group.id ? null : group.id)}
            style={{
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              backgroundColor: colors.bg,
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.border)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.bg)}
          >
            <div style={{ flex: 1 }}>
              <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', margin: '0 0 4px' }}>
                {expandedGroupId === group.id ? '▼' : '▶'} {group.name}
              </h3>
              <div style={{ fontSize: '13px', color: colors.text2 }}>
                📌 {group.objectiveName} • 👥 {group.studentCount} student{group.studentCount !== 1 ? 's' : ''} • 📅{' '}
                {group.meetingSchedule}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(group);
                }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(group.id);
                }}
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
          </div>

          {expandedGroupId === group.id && (
            <div style={{ padding: '16px', borderTop: `1px solid ${colors.border}`, backgroundColor: colors.bg }}>
              <h4 style={{ color: colors.text, fontSize: '13px', fontWeight: '600', margin: '0 0 12px', textTransform: 'uppercase' }}>
                Students ({group.studentIds.length})
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                {group.studentIds.map((studentId) => {
                  const student = students.find((s) => s.id === studentId);
                  return (
                    <div
                      key={studentId}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor: colors.surface,
                        borderRadius: '6px',
                        border: `1px solid ${colors.border}`,
                        fontSize: '13px',
                      }}
                    >
                      <span style={{ color: colors.text }}>{student?.name || 'Unknown'}</span>
                      <button
                        onClick={() => onRemoveStudent(group.id, studentId)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '16px',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              <h4 style={{ color: colors.text, fontSize: '13px', fontWeight: '600', margin: '0 0 8px', textTransform: 'uppercase' }}>
                Add Student
              </h4>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onAddStudent(group.id, e.target.value);
                    e.target.value = '';
                  }
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  backgroundColor: colors.surface,
                  color: colors.text,
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">-- Select student to add --</option>
                {students
                  .filter((s) => !group.studentIds.includes(s.id))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
