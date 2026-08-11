'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { colors } from '@/app/design/colors';
import { TeacherSkillSelector } from '@/app/components/TeacherSkillSelector';
import { SkillObjectiveManager } from '@/app/components/SkillObjectiveManager';
import { StudentObjectiveList } from '@/app/components/StudentObjectiveList';
import { StudentObjectiveSubmission } from '@/app/components/StudentObjectiveSubmission';
import { GradingInbox } from '@/app/components/GradingInbox';
import { ClassProgressDashboard } from '@/app/components/ClassProgressDashboard';
import { ClassResourcesPanel } from '@/app/components/ClassResourcesPanel';
import { ClassScheduleManager } from '@/app/components/ClassScheduleManager';
import { K12ObjectivesGrid } from '@/app/modules/k12/components/K12ObjectivesGrid';
import { StandardsObjectivesTeacher } from '@/app/components/StandardsObjectivesTeacher';

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const slug = params?.slug as string;
  const classId = params?.classId as string;

  const [classData, setClassData] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'standards' | 'schedule' | 'students' | 'feedback' | 'objectives' | 'skills' | 'grading' | 'progress' | 'resources'>('overview');
  const [selectedWeek, setSelectedWeek] = useState<any>(null);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (!session?.user?.id || !slug || !classId) return;

    const fetchClassData = async () => {
      try {
        const res = await fetch(`/api/organizations/${slug}/class/${classId}`, {
          headers: { 'User-Id': session?.user?.id || '' },
        });

        if (res.ok) {
          const data = await res.json();
          setClassData(data.classData);
          setUserRole(data.userRole);

          // Redirect students to new dashboard
          if (data.userRole === 'Student') {
            router.push(`/students/class/${classId}/dashboard`);
            return;
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch class:', err);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [session?.user?.id, slug, classId, status, router]);

  if (status === 'loading' || loading) {
    return <div style={{ color: colors.text, padding: '2rem' }}>Loading class...</div>;
  }

  if (!classData) {
    return (
      <main style={{ backgroundColor: colors.bg, minHeight: '100vh', padding: '2rem' }}>
        <div style={{ color: colors.text }}>Class not found</div>
      </main>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'objectives', label: 'Objectives' },
    ...(userRole === 'Teacher' ? [{ id: 'progress', label: 'Class Progress' }] : []),
    ...(userRole === 'Teacher' ? [{ id: 'grading', label: 'Grading Inbox' }] : []),
    ...(userRole === 'Teacher' ? [{ id: 'skills', label: 'Skill Setup' }] : []),
    { id: 'standards', label: 'Standards' },
    { id: 'schedule', label: 'Schedule' },
    ...(userRole === 'Teacher' ? [{ id: 'students', label: 'Students' }] : []),
    { id: 'feedback', label: 'Feedback' },
    { id: 'resources', label: 'Resources' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab classData={classData} userRole={userRole} />;
      case 'objectives':
        return userRole === 'Teacher' ? (
          <StandardsObjectivesTeacher classId={classId} />
        ) : (
          <StudentObjectiveList classId={classId} onSelectObjective={setSelectedObjective} />
        );
      case 'skills':
        return <TeacherSkillSelector classId={classId} />;
      case 'progress':
        return <ClassProgressDashboard classId={classId} />;
      case 'grading':
        return <GradingInbox classId={classId} />;
      case 'standards':
        return <StandardsTab classData={classData} userRole={userRole} orgSlug={slug} />;
      case 'schedule':
        return <ScheduleTab classData={classData} userRole={userRole} slug={slug} />;
      case 'students':
        return <StudentsTab classData={classData} classId={classId} orgSlug={slug} />;
      case 'feedback':
        return <FeedbackTab classData={classData} userRole={userRole} />;
      case 'resources':
        return <ClassResourcesPanel classId={classId} orgSlug={slug} userRole={userRole || 'Student'} userId={session?.user?.id || ''} />;
      default:
        return null;
    }
  };

  return (
    <main style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <div style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
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
            {classData.name}
          </h1>
          {classData.subtitle && (
            <p style={{ color: colors.text2, fontSize: '16px', marginBottom: '1.5rem' }}>
              {classData.subtitle}
            </p>
          )}

          {/* Class stats */}
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Instructor</div>
              <div style={{ color: colors.text, fontSize: '16px', fontWeight: '600' }}>{classData.instructor.name}</div>
            </div>
            <div>
              <div style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Enrolled</div>
              <div style={{ color: colors.text, fontSize: '16px', fontWeight: '600' }}>{classData.enrollmentCount} students</div>
            </div>
            <div>
              <div style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Duration</div>
              <div style={{ color: colors.text, fontSize: '16px', fontWeight: '600' }}>
                {classData.numWeeks} weeks
              </div>
            </div>
            <div>
              <div style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Status</div>
              <div style={{ color: colors.teal.accent, fontSize: '16px', fontWeight: '600', textTransform: 'capitalize' }}>
                {classData.status}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: `1px solid ${colors.border}`, paddingBottom: '0', flexWrap: 'wrap' }}>
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
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ backgroundColor: colors.surface, padding: '2rem', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Week Detail Modal */}
      {showWeekModal && selectedWeek && (
        <WeekDetailModal
          week={selectedWeek}
          classId={classId}
          orgSlug={slug}
          userRole={userRole}
          onClose={() => setShowWeekModal(false)}
          onSave={() => {
            setShowWeekModal(false);
            setSelectedWeek(null);
          }}
          session={session}
        />
      )}

      {/* Objective Submission Modal */}
      {selectedObjective && (
        <StudentObjectiveSubmission
          classId={classId}
          objective={selectedObjective}
          onClose={() => setSelectedObjective(null)}
        />
      )}
    </main>
  );
}

function OverviewTab({ classData, userRole }: any) {
  return (
    <div>
      <h2 style={{ color: colors.text, marginBottom: '1rem', fontSize: '20px', fontWeight: '600' }}>Class Overview</h2>
      {userRole === 'Teacher' ? (
        <div>
          <p style={{ color: colors.text2, marginBottom: '1.5rem' }}>
            You are teaching this class. View the Standards tab to see student progress on learning objectives.
          </p>
          <div style={{ backgroundColor: colors.bg, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
            <h3 style={{ color: colors.text, marginBottom: '1rem', fontWeight: '600' }}>Class Info</h3>
            <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '0.5rem 1rem' }}>
              <dt style={{ color: colors.text2, fontWeight: '600' }}>Start Date:</dt>
              <dd style={{ color: colors.text }}>{new Date(classData.startDate).toLocaleDateString()}</dd>
              <dt style={{ color: colors.text2, fontWeight: '600' }}>End Date:</dt>
              <dd style={{ color: colors.text }}>{classData.endDate ? new Date(classData.endDate).toLocaleDateString() : 'Ongoing'}</dd>
              <dt style={{ color: colors.text2, fontWeight: '600' }}>Status:</dt>
              <dd style={{ color: colors.text, textTransform: 'capitalize' }}>{classData.status}</dd>
            </dl>
          </div>
        </div>
      ) : (
        <div>
          <p style={{ color: colors.text2, marginBottom: '1.5rem' }}>
            You are enrolled in this class. Track your progress on the Standards tab.
          </p>
          <div style={{ backgroundColor: colors.bg, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
            <h3 style={{ color: colors.text, marginBottom: '1rem', fontWeight: '600' }}>Getting Started</h3>
            <ul style={{ color: colors.text2, lineHeight: '1.8', paddingLeft: '1.5rem' }}>
              <li>Check the Schedule tab to see the week-by-week curriculum</li>
              <li>Visit Standards to see what you'll be learning</li>
              <li>Ask questions in the Feedback section</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function StandardsTab({ classData, userRole, orgSlug }: any) {
  const [standards, setStandards] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [studentProgress, setStudentProgress] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id || !orgSlug || !classData?.id) return;

    // Skip fetching for K12 classes (K12ObjectivesGrid handles it)
    if (classData.classType === 'k12') {
      setLoading(false);
      return;
    }

    const fetchStandards = async () => {
      try {
        const res = await fetch(`/api/organizations/${orgSlug}/class/${classData.id}/standards`, {
          headers: { 'User-Id': session?.user?.id || '' },
        });

        if (res.ok) {
          const data = await res.json();
          setStandards(data.standards);

          if (userRole === 'Teacher') {
            setStudents(data.students);
          } else {
            setStudentProgress(data.studentProgress);
          }
        }
      } catch (err) {
        console.error('Failed to fetch standards:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStandards();
  }, [session?.user?.id, orgSlug, classData?.id, classData?.classType, userRole]);

  const getLevelColor = (level: number | null | undefined) => {
    if (!level) return colors.border;
    switch (level) {
      case 1:
        return colors.approaching.accent;
      case 2:
        return colors.developing.accent;
      case 3:
        return colors.proficient.accent;
      case 4:
        return colors.teal.accent;
      default:
        return colors.border;
    }
  };

  const getLevelLabel = (level: number | null | undefined) => {
    if (!level) return '—';
    switch (level) {
      case 1:
        return 'Approaching';
      case 2:
        return 'Developing';
      case 3:
        return 'Proficient';
      case 4:
        return 'Advanced';
      default:
        return '—';
    }
  };

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading standards...</div>;
  }

  // Only show "no standards" message for Improv classes; K12 classes have their own display
  if (standards.length === 0 && classData?.classType !== 'k12') {
    return (
      <div>
        <h2 style={{ color: colors.text, marginBottom: '1rem', fontSize: '20px', fontWeight: '600' }}>Learning Standards</h2>
        <p style={{ color: colors.text2 }}>No standards assigned to this class yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ color: colors.text, marginBottom: '1.5rem', fontSize: '20px', fontWeight: '600' }}>Learning Standards</h2>

      {/* K12 Standards & Objectives */}
      {classData?.classType === 'k12' && (
        <K12ObjectivesGrid classId={classData.id} className={classData.name} />
      )}

      {/* Improv Class Standards */}
      {classData?.classType !== 'k12' && (
        <>
          {userRole === 'Teacher' ? (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: '600px',
                }}
              >
                <thead>
                  <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                    <th
                      style={{
                        padding: '1rem',
                        textAlign: 'left',
                        color: colors.text,
                        fontWeight: '600',
                        backgroundColor: colors.bg,
                      }}
                    >
                      Student
                    </th>
                    {standards.map((standard: any) => (
                      <th
                        key={standard.id}
                        style={{
                          padding: '1rem',
                          textAlign: 'center',
                          color: colors.text,
                          fontWeight: '600',
                          backgroundColor: colors.bg,
                          minWidth: '120px',
                          fontSize: '14px',
                        }}
                      >
                        <div>{standard.code}</div>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: colors.text2 }}>
                          {standard.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student: any) => (
                    <tr
                      key={student.studentId}
                      style={{ borderBottom: `1px solid ${colors.border}` }}
                    >
                      <td
                        style={{
                          padding: '1rem',
                          color: colors.text,
                          fontWeight: '500',
                        }}
                      >
                        {student.studentName}
                      </td>
                      {standards.map((standard: any) => {
                        const progress = student.progress[standard.id];
                        const level = progress?.level;
                        const isCompleted = progress?.completed;

                        return (
                          <td
                            key={`${student.studentId}-${standard.id}`}
                            style={{
                              padding: '1rem',
                              textAlign: 'center',
                              backgroundColor: level ? getLevelColor(level) : 'transparent',
                              color: level ? colors.text : colors.text3,
                              fontSize: '13px',
                              fontWeight: '500',
                            }}
                          >
                            {standard.type === 'skill' && level ? getLevelLabel(level) : isCompleted ? '✓' : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {standards.map((standard: any) => {
                  const progress = studentProgress[standard.id];
                  const level = progress?.level;
                  const isCompleted = progress?.completed;

                  return (
                    <div
                      key={standard.id}
                      style={{
                        backgroundColor: colors.bg,
                        border: `2px solid ${level ? getLevelColor(level) : colors.border}`,
                        borderRadius: '8px',
                        padding: '1.5rem',
                      }}
                    >
                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                          {standard.code}
                        </div>
                        <h3 style={{ color: colors.text, fontWeight: '600', fontSize: '16px' }}>
                          {standard.name}
                        </h3>
                      </div>

                      {standard.description && (
                        <p style={{ color: colors.text2, fontSize: '14px', marginBottom: '1rem' }}>
                          {standard.description}
                        </p>
                      )}

                      <div style={{ marginTop: '1rem' }}>
                        <div style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', marginBottom: '0.5rem' }}>
                          Your Progress
                        </div>
                        <div
                          style={{
                            backgroundColor: level ? getLevelColor(level) : colors.border,
                            color: colors.text,
                            padding: '0.75rem',
                            borderRadius: '6px',
                            textAlign: 'center',
                            fontWeight: '600',
                            fontSize: '14px',
                          }}
                        >
                          {standard.type === 'skill' && level
                            ? getLevelLabel(level)
                            : isCompleted
                              ? 'Completed'
                              : 'Not Started'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ScheduleTab({ classData, userRole, slug }: any) {
  return (
    <ClassScheduleManager
      classId={classData.id}
      classType={classData.classType || 'improv'}
      orgSlug={slug}
      userRole={userRole}
    />
  );
}

function StudentsTab({ classData, classId, orgSlug }: any) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id || !classId) return;

    const fetchStudents = async () => {
      try {
        const res = await fetch(`/api/organizations/${orgSlug}/class/${classId}/students`, {
          headers: { 'User-Id': session?.user?.id || '' },
        });

        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
        }
      } catch (err) {
        console.error('Failed to fetch students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [session?.user?.id, classId, orgSlug]);

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading students...</div>;
  }

  return (
    <div>
      <h2 style={{ color: colors.text, marginBottom: '1.5rem', fontSize: '20px', fontWeight: '600' }}>
        Enrolled Students ({students.length})
      </h2>

      {students.length === 0 ? (
        <p style={{ color: colors.text2 }}>No students enrolled yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '400px',
            }}
          >
            <thead>
              <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    color: colors.text,
                    fontWeight: '600',
                    backgroundColor: colors.bg,
                  }}
                >
                  Student Name
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    color: colors.text,
                    fontWeight: '600',
                    backgroundColor: colors.bg,
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    color: colors.text,
                    fontWeight: '600',
                    backgroundColor: colors.bg,
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    color: colors.text,
                    fontWeight: '600',
                    backgroundColor: colors.bg,
                  }}
                >
                  Enrolled
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student: any) => (
                <tr
                  key={student.id}
                  style={{ borderBottom: `1px solid ${colors.border}` }}
                >
                  <td
                    style={{
                      padding: '1rem',
                      color: colors.text,
                    }}
                  >
                    {student.name}
                  </td>
                  <td
                    style={{
                      padding: '1rem',
                      color: colors.text2,
                      fontSize: '14px',
                    }}
                  >
                    {student.email}
                  </td>
                  <td
                    style={{
                      padding: '1rem',
                      textAlign: 'center',
                      color: student.status === 'active' ? colors.proficient.accent : colors.text3,
                      fontWeight: '500',
                      fontSize: '14px',
                      textTransform: 'capitalize',
                    }}
                  >
                    {student.status}
                  </td>
                  <td
                    style={{
                      padding: '1rem',
                      textAlign: 'center',
                      color: colors.text2,
                      fontSize: '14px',
                    }}
                  >
                    {new Date(student.enrolledAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FeedbackTab({ classData, userRole }: any) {
  return (
    <div>
      <h2 style={{ color: colors.text, marginBottom: '1rem', fontSize: '20px', fontWeight: '600' }}>Feedback & Notes</h2>
      {userRole === 'Teacher' ? (
        <p style={{ color: colors.text2 }}>
          Feedback panel for leaving notes on student progress coming soon.
        </p>
      ) : (
        <p style={{ color: colors.text2 }}>
          Feedback from your instructor will appear here.
        </p>
      )}
    </div>
  );
}

// Helper function to detect and parse Google Drive URLs
function parseGoogleDriveUrl(url: string) {
  if (!url) return null;

  const isGoogleDrive = url.includes('drive.google.com') || url.includes('docs.google.com');
  if (!isGoogleDrive) return null;

  // Detect document type from URL
  let type = 'Document';
  let icon = '📄';

  if (url.includes('/spreadsheets/')) {
    type = 'Sheet';
    icon = '📊';
  } else if (url.includes('/presentation/')) {
    type = 'Slide';
    icon = '🎨';
  } else if (url.includes('/document/')) {
    type = 'Doc';
    icon = '📝';
  }

  return { type, icon, isGoogleDrive: true };
}

function WeekDetailModal({ week, classId, orgSlug, userRole, onClose, onSave, session }: any) {
  const [weekData, setWeekData] = useState<any>(week);
  const [agenda, setAgenda] = useState<string>(week.agenda || '');
  const [materials, setMaterials] = useState<any[]>(week.materials || []);
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialUrl, setNewMaterialUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch fresh week data when modal opens
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchWeekData = async () => {
      try {
        const res = await fetch(`/api/organizations/${orgSlug}/class/${classId}/week/${week.weekNum}`, {
          headers: { 'User-Id': session?.user?.id || '' },
        });

        if (res.ok) {
          const data = await res.json();
          setWeekData(data.week);
          setAgenda(data.week.agenda || '');
          setMaterials(data.week.materials || []);
        }
      } catch (err) {
        console.error('Failed to fetch week data:', err);
      }
    };

    fetchWeekData();
  }, [week.weekNum, classId, orgSlug, session?.user?.id]);

  const handleAddMaterial = () => {
    if (newMaterialTitle.trim() && newMaterialUrl.trim()) {
      setMaterials([...materials, { title: newMaterialTitle, url: newMaterialUrl }]);
      setNewMaterialTitle('');
      setNewMaterialUrl('');
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/organizations/${orgSlug}/class/${classId}/week/${week.weekNum}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'User-Id': session?.user?.id || '',
        },
        body: JSON.stringify({ agenda, materials }),
      });

      if (res.ok) {
        // Refetch to confirm save
        const getRes = await fetch(`/api/organizations/${orgSlug}/class/${classId}/week/${week.weekNum}`, {
          headers: { 'User-Id': session?.user?.id || '' },
        });

        if (getRes.ok) {
          const data = await getRes.json();
          setWeekData(data.week);
          setAgenda(data.week.agenda || '');
          setMaterials(data.week.materials || []);
        }

        onSave();
      }
    } catch (err) {
      console.error('Failed to save week details:', err);
    } finally {
      setSaving(false);
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
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: colors.bg,
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ color: colors.text, fontSize: '24px', fontWeight: '600', marginBottom: '0.5rem' }}>
              Week {week.weekNum}
            </h2>
            <p style={{ color: colors.text2, fontSize: '14px' }}>
              {week.title}
            </p>
            <p style={{ color: colors.text3 || colors.text2, fontSize: '12px', marginTop: '0.5rem' }}>
              {new Date(week.startDate).toLocaleDateString()} - {new Date(week.endDate).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: colors.text2,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        {/* Agenda Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: colors.text, fontWeight: '600', marginBottom: '0.5rem' }}>Agenda</h3>
          {userRole === 'Teacher' ? (
            <textarea
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="Enter the week's agenda, lesson plan, or focus areas..."
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '0.75rem',
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surface,
                color: colors.text,
                fontFamily: 'inherit',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          ) : (
            <div
              style={{
                backgroundColor: colors.surface,
                padding: '1rem',
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
                color: colors.text2,
                minHeight: '100px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {agenda || 'No agenda posted yet.'}
            </div>
          )}
        </div>

        {/* Materials Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: colors.text, fontWeight: '600', marginBottom: '0.5rem' }}>Materials & Resources</h3>

          {materials.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              {materials.map((material, idx) => {
                const driveInfo = parseGoogleDriveUrl(material.url);
                const isGoogleDrive = driveInfo?.isGoogleDrive;

                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: isGoogleDrive ? '#F3F4F6' : colors.surface,
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      border: isGoogleDrive ? `2px solid #4285F4` : `1px solid ${colors.border}`,
                      marginBottom: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '0.75rem' }}>
                      {isGoogleDrive && (
                        <span style={{ fontSize: '16px' }}>{driveInfo.icon}</span>
                      )}
                      <div style={{ flex: 1 }}>
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: isGoogleDrive ? '#4285F4' : colors.teal.accent,
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: isGoogleDrive ? '600' : '500',
                            display: 'block',
                            marginBottom: '0.25rem',
                          }}
                        >
                          {material.title}
                        </a>
                        {isGoogleDrive && (
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            Google {driveInfo.type}
                          </span>
                        )}
                      </div>
                    </div>
                    {userRole === 'Teacher' && (
                      <button
                        onClick={() => handleRemoveMaterial(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: colors.text3,
                          cursor: 'pointer',
                          fontSize: '16px',
                          padding: '0 0.5rem',
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {userRole === 'Teacher' && (
            <div style={{ marginTop: '1rem' }}>
              <input
                type="text"
                value={newMaterialTitle}
                onChange={(e) => setNewMaterialTitle(e.target.value)}
                placeholder="Material title"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text,
                  marginBottom: '0.5rem',
                  boxSizing: 'border-box',
                  fontSize: '14px',
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="url"
                  value={newMaterialUrl}
                  onChange={(e) => setNewMaterialUrl(e.target.value)}
                  placeholder="Google Drive link or URL"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surface,
                    color: colors.text,
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={handleAddMaterial}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: colors.teal.accent,
                    color: colors.bg,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                  }}
                >
                  Add
                </button>
              </div>
              <p style={{ fontSize: '12px', color: colors.text3, margin: '0' }}>
                💡 Tip: Paste Google Docs, Sheets, or Slides links directly. They'll automatically display with a Google Drive badge.
              </p>
            </div>
          )}

          {materials.length === 0 && userRole !== 'Teacher' && (
            <p style={{ color: colors.text3 || colors.text2, fontSize: '13px' }}>
              No materials posted yet.
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: colors.text2,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
            }}
          >
            {userRole === 'Teacher' ? 'Cancel' : 'Close'}
          </button>
          {userRole === 'Teacher' && (
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: colors.teal.accent,
                color: colors.bg,
                border: 'none',
                borderRadius: '6px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
