'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { colors } from '@/app/modules/improv/design/colors';

interface Department {
  id: string;
  name: string;
  description?: string;
  type: string;
  resourceLibrary?: {
    id: string;
    name: string;
  };
}

export function OrganizationalUnitList({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(`/api/organizations/${orgSlug}/organizational-units`);
        if (!res.ok) throw new Error('Failed to fetch departments');
        const data = await res.json();
        setDepartments(data.units || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [orgSlug]);

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading departments...</div>;
  }

  if (error) {
    return <div style={{ color: colors.red.accent }}>{error}</div>;
  }

  if (departments.length === 0) {
    return <div style={{ color: colors.text2 }}>No departments found</div>;
  }

  return (
    <div>
      <h2 style={{ color: colors.text, marginBottom: '1.5rem' }}>Organizational Structure</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {departments.map((dept) => (
          <div
            key={dept.id}
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '1.5rem',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ color: colors.text, margin: '0 0 0.5rem 0', fontSize: '18px' }}>
                {dept.name}
              </h3>
              <p style={{ color: colors.text2, fontSize: '13px', margin: 0 }}>
                {dept.type}
              </p>
            </div>

            {dept.description && (
              <p style={{ color: colors.text2, fontSize: '14px', marginBottom: '1rem' }}>
                {dept.description}
              </p>
            )}

            {dept.resourceLibrary && (
              <div
                style={{
                  backgroundColor: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginTop: '1rem',
                }}
              >
                <p style={{ color: colors.text2, fontSize: '12px', margin: '0 0 0.25rem 0', fontWeight: '600' }}>
                  Resource Library
                </p>
                <p style={{ color: colors.text, fontSize: '14px', margin: 0 }}>
                  {dept.resourceLibrary.name}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                router.push(`/organization/${orgSlug}/department/${dept.id}`);
              }}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.75rem',
                backgroundColor: colors.teal.accent,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Manage Resources
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
