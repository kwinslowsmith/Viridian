'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { colors } from '@/app/modules/improv/design/colors';
import { K12StandardsHierarchy } from '@/app/modules/k12/components/K12StandardsHierarchy';

interface K12Class {
  id: string;
  name: string;
  gradeLevel: string;
  subject: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  numUnits?: number;
  status?: string;
  instructor: {
    id: string;
    name: string;
  };
}

interface Standard {
  id: string;
  code: string;
  name: string;
  type: string;
  objectives: Array<{
    id: string;
    label: string;
    text: string;
  }>;
}

interface Unit {
  id: string;
  unitNum: number;
  title: string;
  objectives: Array<{
    id: string;
    label: string;
    text: string;
  }>;
}

export default function K12ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params?.slug as string;
  const classId = params?.classId as string;

  const [k12Class, setK12Class] = useState<K12Class | null>(null);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'objectives' | 'standards' | 'units' | 'assessments' | 'resources'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !classId) {
      return;
    }

    const fetchData = async () => {
      try {
        const headers: Record<string, string> = {};
        if (session?.user?.id) {
          headers['User-Id'] = session.user.id;
        }

        const classRes = await fetch(`/api/organizations/${slug}/k12-classes/${classId}`, { headers });
        if (classRes.ok) {
          const classData = await classRes.json();
          setK12Class(classData.class);
          setUserRole(classData.userRole || 'Student');
        } else {
          const errorData = await classRes.json().catch(() => ({}));
          setError(errorData.error || 'Class not found');
        }

        const standardsRes = await fetch(`/api/k12-classes/${classId}/standards-manager`);
        if (standardsRes.ok) {
          const standardsData = await standardsRes.json();
          // Transform the response for backwards compatibility
          const transformedStandards = standardsData.assignedStandards.map((s: any) => ({
            id: s.standardId,
            code: s.standardCode,
            name: s.standardName,
            type: s.standardType,
            objectives: s.objectives,
          }));
          setStandards(transformedStandards);
        }

        const unitsRes = await fetch(`/api/organizations/${slug}/k12-classes/${classId}/units`);
        if (unitsRes.ok) {
          const unitsData = await unitsRes.json();
          setUnits(unitsData.units || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load class');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, classId, session?.user?.id]);

  if (loading) {
    return <div style={{ color: colors.text, padding: '2rem' }}>Loading class...</div>;
  }

  if (error || !k12Class) {
    return (
      <main style={{ backgroundColor: colors.bg, minHeight: '100vh', padding: '2rem' }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: colors.teal.accent,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          ← Back
        </button>
        <div style={{ color: colors.red.accent }}>{error || 'Class not found'}</div>
      </main>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'objectives', label: 'Objectives' },
    { id: 'standards', label: `Standards (${standards.length})` },
    { id: 'units', label: `Units (${units.length})` },
    { id: 'assessments', label: 'Assessments' },
    { id: 'resources', label: 'Resources' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <h2 style={{ color: colors.text, marginBottom: '1.5rem', fontSize: '20px', fontWeight: '600' }}>Class Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div
                style={{
                  padding: '1.5rem',
                  backgroundColor: colors.surface,
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                }}
              >
                <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Grade Level</p>
                <p style={{ color: colors.text, fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  Grade {k12Class.gradeLevel}
                </p>
              </div>
              <div
                style={{
                  padding: '1.5rem',
                  backgroundColor: colors.surface,
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                }}
              >
                <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Subject</p>
                <p style={{ color: colors.text, fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  {k12Class.subject}
                </p>
              </div>
              <div
                style={{
                  padding: '1.5rem',
                  backgroundColor: colors.surface,
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                }}
              >
                <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Instructor</p>
                <p style={{ color: colors.text, fontSize: '16px', fontWeight: '600', margin: 0 }}>
                  {k12Class.instructor.name}
                </p>
              </div>
              {k12Class.numUnits && (
                <div
                  style={{
                    padding: '1.5rem',
                    backgroundColor: colors.surface,
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Units</p>
                  <p style={{ color: colors.text, fontSize: '18px', fontWeight: '600', margin: 0 }}>
                    {k12Class.numUnits}
                  </p>
                </div>
              )}
              {k12Class.startDate && (
                <div
                  style={{
                    padding: '1.5rem',
                    backgroundColor: colors.surface,
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Start Date</p>
                  <p style={{ color: colors.text, fontSize: '14px', fontWeight: '500', margin: 0 }}>
                    {new Date(k12Class.startDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {k12Class.status && (
                <div
                  style={{
                    padding: '1.5rem',
                    backgroundColor: colors.surface,
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Status</p>
                  <p style={{ color: colors.text, fontSize: '14px', fontWeight: '500', margin: 0, textTransform: 'capitalize' }}>
                    {k12Class.status}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'objectives':
        return (
          <K12StandardsHierarchy classId={classId} className={k12Class.name} />
        );

      case 'standards':
        return (
          <div>
            <h2 style={{ color: colors.text, marginBottom: '1.5rem' }}>Standards & Objectives</h2>
            {standards.length === 0 ? (
              <p style={{ color: colors.text2 }}>No standards assigned yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {standards.map((std) => (
                  <div
                    key={std.id}
                    style={{
                      padding: '1.5rem',
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div>
                        <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                          {std.type.toUpperCase()} STANDARD
                        </p>
                        <h3 style={{ color: colors.text, margin: '0.25rem 0 0 0' }}>{std.name}</h3>
                      </div>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: std.type === 'skill' ? colors.teal.bg : colors.amber.bg,
                          color: std.type === 'skill' ? colors.teal.accent : colors.amber.accent,
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {std.code}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {std.objectives.map((obj) => (
                        <div
                          key={obj.id}
                          style={{
                            padding: '0.75rem',
                            backgroundColor: colors.bg,
                            borderRadius: '6px',
                            borderLeft: `3px solid ${colors.teal.accent}`,
                          }}
                        >
                          <p style={{ color: colors.text, fontSize: '14px', margin: '0 0 0.25rem 0', fontWeight: '500' }}>
                            {obj.label}. {obj.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'units':
        return (
          <div>
            <h2 style={{ color: colors.text, marginBottom: '1.5rem', fontSize: '20px', fontWeight: '600' }}>Course Units</h2>
            {units.length === 0 ? (
              <p style={{ color: colors.text2 }}>No units configured yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    style={{
                      padding: '1.5rem',
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                    }}
                  >
                    <h3 style={{ color: colors.text, margin: '0 0 1rem 0' }}>
                      Unit {unit.unitNum}: {unit.title}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {unit.objectives.map((obj, idx) => (
                        <div
                          key={obj.id}
                          style={{
                            padding: '0.75rem',
                            backgroundColor: colors.bg,
                            borderRadius: '6px',
                            borderLeft: `3px solid ${colors.teal.accent}`,
                          }}
                        >
                          <p style={{ color: colors.text, fontSize: '14px', margin: 0, fontWeight: '500' }}>
                            {String.fromCharCode(65 + idx)}. {obj.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'assessments':
        return (
          <div>
            <h2 style={{ color: colors.text, marginBottom: '1.5rem', fontSize: '20px', fontWeight: '600' }}>Assessments</h2>
            <div style={{ backgroundColor: colors.surface, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
              <p style={{ color: colors.text2, marginBottom: '1rem' }}>Assessment tracking uses a 1-3 rubric scale:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: colors.approaching.bg, borderRadius: '6px' }}>
                  <p style={{ color: colors.approaching.accent, fontWeight: '600', margin: 0 }}>1 — Approaching</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: colors.developing.bg, borderRadius: '6px' }}>
                  <p style={{ color: colors.developing.accent, fontWeight: '600', margin: 0 }}>2 — Proficient</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: colors.teal.bg, borderRadius: '6px' }}>
                  <p style={{ color: colors.teal.accent, fontWeight: '600', margin: 0 }}>3 — Advanced</p>
                </div>
              </div>
              <p style={{ color: colors.text2, marginTop: '1.5rem' }}>Assessment data will be available soon</p>
            </div>
          </div>
        );

      case 'resources':
        return (
          <div>
            <h2 style={{ color: colors.text, marginBottom: '1.5rem', fontSize: '20px', fontWeight: '600' }}>Resources</h2>
            <p style={{ color: colors.text2 }}>Coming soon</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <div style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <button
            onClick={() => router.back()}
            style={{
              marginBottom: '1rem',
              padding: '8px 12px',
              backgroundColor: 'transparent',
              color: colors.text2,
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            ← Back
          </button>

          <h1 style={{ color: colors.text, fontFamily: "'DM Serif Display', serif", fontSize: '32px', marginBottom: '0.5rem' }}>
            {k12Class.name}
          </h1>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', marginTop: '2rem', borderBottom: `1px solid ${colors.border}`, paddingBottom: '0', flexWrap: 'wrap' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  color: activeTab === tab.id ? colors.teal.accent : colors.text2,
                  border: 'none',
                  borderBottom: activeTab === tab.id ? `2px solid ${colors.teal.accent}` : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  transition: 'all 0.2s',
                  fontSize: '14px',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ backgroundColor: colors.surface, padding: '2rem', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </main>
  );
}
