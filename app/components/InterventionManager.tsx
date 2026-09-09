'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/app/design/colors';
import { InterventionGroupList } from './InterventionGroupList';
import { InterventionGroupForm } from './InterventionGroupForm';

interface InterventionGroup {
  id: string;
  name: string;
  objectiveId: string;
  objectiveName: string;
  studentCount: number;
  meetingSchedule: string;
  studentIds: string[];
}

interface Objective {
  id: string;
  label: string;
  text: string;
}

interface Student {
  id: string;
  name: string;
}

interface InterventionManagerProps {
  classId: string;
}

export function InterventionManager({ classId }: InterventionManagerProps) {
  const [groups, setGroups] = useState<InterventionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<InterventionGroup | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetchGroups();
    fetchObjectives();
    fetchStudents();
  }, [classId]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/k12-classes/${classId}/intervention-groups`);
      if (!response.ok) throw new Error('Failed to fetch intervention groups');
      const data = await response.json();
      setGroups(data.groups || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups');
      setGroups([]);
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

  const fetchStudents = async () => {
    try {
      const response = await fetch(`/api/k12-classes/${classId}/students`);
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(data.students || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const handleCreateGroup = async (formData: any) => {
    try {
      const response = await fetch(`/api/k12-classes/${classId}/intervention-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create group');
      await fetchGroups();
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this intervention group?')) return;

    try {
      const response = await fetch(`/api/k12-classes/${classId}/intervention-groups/${groupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete group');
      await fetchGroups();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group');
    }
  };

  const handleAddStudent = async (groupId: string, studentId: string) => {
    try {
      const response = await fetch(
        `/api/k12-classes/${classId}/intervention-groups/${groupId}/add-student`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId }),
        }
      );

      if (!response.ok) throw new Error('Failed to add student');
      await fetchGroups();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add student');
    }
  };

  const handleRemoveStudent = async (groupId: string, studentId: string) => {
    try {
      const response = await fetch(
        `/api/k12-classes/${classId}/intervention-groups/${groupId}/remove-student?studentId=${studentId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Failed to remove student');
      await fetchGroups();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove student');
    }
  };

  const handleEdit = (group: InterventionGroup) => {
    setEditingGroup(group);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingGroup(null);
  };

  if (loading) {
    return <div style={{ padding: '24px', color: colors.text2 }}>Loading intervention groups...</div>;
  }

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h1 style={{ color: colors.text, fontSize: '28px', fontWeight: 'bold', margin: '0' }}>
              🎯 Intervention Groups
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
                + Create Group
              </button>
            )}
          </div>
          <p style={{ color: colors.text2, margin: '0' }}>
            {groups.length} active group{groups.length !== 1 ? 's' : ''} supporting struggling students
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

        {showForm && (
          <InterventionGroupForm
            objectives={objectives}
            students={students}
            onSubmit={handleCreateGroup}
            onCancel={handleCloseForm}
          />
        )}

        <InterventionGroupList
          groups={groups}
          students={students}
          onEdit={handleEdit}
          onDelete={handleDeleteGroup}
          onAddStudent={handleAddStudent}
          onRemoveStudent={handleRemoveStudent}
        />
      </div>
    </div>
  );
}
