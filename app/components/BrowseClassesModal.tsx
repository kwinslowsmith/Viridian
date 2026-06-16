'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { colors } from '@/app/modules/improv/design/colors';

export function BrowseClassesModal({
  onClose,
  onEnrolled,
}: {
  onClose: () => void;
  onEnrolled?: () => void;
}) {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch('/api/me/available-classes');
        if (res.ok) {
          const data = await res.json();
          setClasses(data.classes || []);
        }
      } catch (err) {
        console.error('Failed to fetch classes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleEnroll = async (classId: string) => {
    setEnrollingId(classId);
    try {
      const res = await fetch(`/api/improv/classes/${classId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        alert('Successfully enrolled!');
        setClasses(classes.filter((c) => c.id !== classId));
        onEnrolled?.();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || 'Failed to enroll'}`);
      }
    } catch (err) {
      console.error('Failed to enroll:', err);
      alert('Failed to enroll');
    } finally {
      setEnrollingId(null);
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
          backgroundColor: colors.surface,
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: colors.text, fontSize: '24px', fontWeight: '700', margin: 0 }}>
            Browse Classes
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: colors.text2,
              fontSize: '24px',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        {loading ? (
          <div style={{ color: colors.text2 }}>Loading classes...</div>
        ) : classes.length === 0 ? (
          <div style={{ color: colors.text2, textAlign: 'center', padding: '2rem' }}>
            No classes available to enroll in.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {classes.map((cls) => (
              <div
                key={cls.id}
                style={{
                  backgroundColor: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  gap: '1rem',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                    {cls.name}
                  </h3>
                  {cls.subtitle && (
                    <p style={{ color: colors.text2, fontSize: '13px', margin: '0 0 1rem 0' }}>
                      {cls.subtitle}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '2rem', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: colors.text2 }}>Instructor: </span>
                      <span style={{ color: colors.text, fontWeight: '500' }}>{cls.instructor.name}</span>
                    </div>
                    <div>
                      <span style={{ color: colors.text2 }}>Enrolled: </span>
                      <span style={{ color: colors.text, fontWeight: '500' }}>{cls._count.enrollments}</span>
                    </div>
                    <div>
                      <span style={{ color: colors.text2 }}>Weeks: </span>
                      <span style={{ color: colors.text, fontWeight: '500' }}>{cls.weeks?.length || 0}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleEnroll(cls.id)}
                  disabled={enrollingId === cls.id}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: colors.teal.accent,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    opacity: enrollingId === cls.id ? 0.6 : 1,
                  }}
                >
                  {enrollingId === cls.id ? 'Enrolling...' : 'Enroll'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
