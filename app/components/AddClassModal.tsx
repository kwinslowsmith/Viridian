'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Teacher {
  id: string;
  name: string;
  email: string;
}

export function AddClassModal({
  orgSlug,
  onClose,
  onSuccess,
}: {
  orgSlug: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [numWeeks, setNumWeeks] = useState(8);
  const [instructorId, setInstructorId] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(`/api/organizations/${orgSlug}/members`);
        if (res.ok) {
          const data = await res.json();
          const teacherMembers = data.members
            .filter((m: any) => m.role === 'Teacher' || m.role === 'SuperAdmin')
            .map((m: any) => m.user);
          setTeachers(teacherMembers);
          if (teacherMembers.length > 0) {
            setInstructorId(teacherMembers[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch teachers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [orgSlug]);

  const handleCreate = async () => {
    if (!name.trim() || !startDate || !instructorId) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/improv/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          subtitle: subtitle.trim() || undefined,
          startDate: new Date(startDate),
          numWeeks,
          instructorId,
          organizationSlug: orgSlug,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const error = await res.json();
        alert(`Failed to create class: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to create class:', error);
      alert('Failed to create class');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: '#000', margin: '0 0 1rem 0', fontSize: '24px', fontWeight: '700' }}>
          Create New Class
        </h2>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#000', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
            Class Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Musical Improv 101"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#000',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#000', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
            Subtitle (optional)
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. The Anti-Hero's Journey"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#000',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#000', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
            Start Date *
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#000',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#000', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
            Number of Weeks
          </label>
          <input
            type="number"
            min="1"
            max="24"
            value={numWeeks}
            onChange={(e) => setNumWeeks(parseInt(e.target.value) || 8)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#000',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: '#000', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
            Instructor *
          </label>
          <select
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#000',
              boxSizing: 'border-box',
              cursor: 'pointer',
            }}
            disabled={loading}
          >
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} ({teacher.email})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              backgroundColor: '#f0f0f0',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !name.trim() || !startDate || !instructorId}
            style={{
              padding: '10px 16px',
              backgroundColor: '#0D9488',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              opacity: creating || !name.trim() || !startDate || !instructorId ? 0.6 : 1,
            }}
          >
            {creating ? 'Creating...' : 'Create Class'}
          </button>
        </div>
      </div>
    </div>
  );
}
