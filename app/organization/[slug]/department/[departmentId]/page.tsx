'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

interface Class {
  id: string;
  name: string;
  gradeLevel: string;
  subject: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  lead: { id: string; name: string };
}

interface Member {
  id: string;
  user: { id: string; name: string; email: string };
  role: string;
}

export default function DepartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params?.slug as string;
  const departmentId = params?.departmentId as string;

  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'classes' | 'resources' | 'communities' | 'projects'>('overview');
  const [department, setDepartment] = useState<Department | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch department
        const deptRes = await fetch(`/api/organizations/${orgSlug}/organizational-units/${departmentId}`);
        if (deptRes.ok) {
          const deptData = await deptRes.json();
          setDepartment(deptData.unit);
        }

        // Fetch classes in department
        const classesRes = await fetch(`/api/organizations/${orgSlug}/department/${departmentId}/classes`);
        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setClasses(classesData.classes || []);
        }

        // Fetch members
        const membersRes = await fetch(`/api/organizations/${orgSlug}/organizational-units/${departmentId}/members`);
        if (membersRes.ok) {
          const membersData = await membersRes.json();
          setMembers(membersData.members || []);
        }

        // Fetch projects
        const projectsRes = await fetch(`/api/organizations/${orgSlug}/department/${departmentId}/projects`);
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData.projects || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load department');
      } finally {
        setLoading(false);
      }
    };

    if (orgSlug && departmentId) {
      fetchData();
    }
  }, [orgSlug, departmentId]);

  if (loading) {
    return <div style={{ color: colors.text, padding: '2rem' }}>Loading department...</div>;
  }

  if (error || !department) {
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
        <div style={{ color: colors.error }}>{error || 'Department not found'}</div>
      </main>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: `Members (${members.length})` },
    { id: 'classes', label: `Classes (${classes.length})` },
    { id: 'resources', label: 'Resources' },
    { id: 'communities', label: 'Communities' },
    { id: 'projects', label: `Projects (${projects.length})` },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <h2 style={{ color: colors.text, marginBottom: '1rem' }}>{department.name}</h2>
            <p style={{ color: colors.text2 }}>{department.description}</p>
            {department.resourceLibrary && (
              <div
                style={{
                  marginTop: '2rem',
                  padding: '1rem',
                  backgroundColor: colors.bg,
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                }}
              >
                <h3 style={{ color: colors.text, margin: '0 0 0.5rem 0' }}>Resource Library</h3>
                <p style={{ color: colors.text2, margin: 0 }}>{department.resourceLibrary.name}</p>
              </div>
            )}
          </div>
        );

      case 'members':
        return (
          <div>
            <h2 style={{ color: colors.text, marginBottom: '1.5rem' }}>Department Members</h2>
            {members.length === 0 ? (
              <p style={{ color: colors.text2 }}>No members yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {members.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <p style={{ color: colors.text, margin: '0 0 0.25rem 0', fontWeight: '500' }}>
                        {member.user.name}
                      </p>
                      <p style={{ color: colors.text2, fontSize: '13px', margin: 0 }}>{member.user.email}</p>
                    </div>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: colors.teal.bg,
                        color: colors.teal.accent,
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                      }}
                    >
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'classes':
        return (
          <div>
            <h2 style={{ color: colors.text, marginBottom: '1.5rem' }}>Classes in {department.name}</h2>
            {classes.length === 0 ? (
              <p style={{ color: colors.text2 }}>No classes yet</p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '1rem',
                }}
              >
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => router.push(`/organization/${orgSlug}/k12-class/${cls.id}`)}
                    style={{
                      padding: '1rem',
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 4px 12px ${colors.border}`;
                      e.currentTarget.style.borderColor = colors.teal.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                  >
                    <h3 style={{ color: colors.text, margin: '0 0 0.5rem 0' }}>{cls.name}</h3>
                    <p style={{ color: colors.text2, fontSize: '13px', margin: '0.25rem 0' }}>
                      Grade: {cls.gradeLevel}
                    </p>
                    <p style={{ color: colors.text2, fontSize: '13px', margin: 0 }}>
                      Subject: {cls.subject}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'resources':
        return (
          <div>
            <h2 style={{ color: colors.text, marginBottom: '1.5rem' }}>Resource Library</h2>
            {department.resourceLibrary ? (
              <div style={{ color: colors.text2 }}>
                <p>Resource library: {department.resourceLibrary.name}</p>
                <button
                  onClick={() =>
                    router.push(
                      `/organization/${orgSlug}/library/${department.resourceLibrary?.id}`
                    )
                  }
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: colors.teal.accent,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Browse Resources
                </button>
              </div>
            ) : (
              <p style={{ color: colors.text2 }}>No resource library assigned</p>
            )}
          </div>
        );

      case 'communities':
        return (
          <div>
            <h2 style={{ color: colors.text, marginBottom: '1.5rem' }}>Communities</h2>
            <p style={{ color: colors.text2 }}>Coming soon</p>
          </div>
        );

      case 'projects':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: colors.text, margin: 0 }}>Projects</h2>
              <button
                onClick={() =>
                  router.push(`/organization/${orgSlug}/department/${departmentId}/new-project`)
                }
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: colors.teal.accent,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                + New Project
              </button>
            </div>
            {projects.length === 0 ? (
              <p style={{ color: colors.text2 }}>No projects yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {projects.map((project) => (
                  <div
                    key={project.id}
                    style={{
                      padding: '1.5rem',
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() =>
                      router.push(
                        `/organization/${orgSlug}/department/${departmentId}/project/${project.id}`
                      )
                    }
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                      }}
                    >
                      <div>
                        <h3 style={{ color: colors.text, margin: '0 0 0.5rem 0' }}>
                          {project.name}
                        </h3>
                        {project.description && (
                          <p style={{ color: colors.text2, margin: '0.25rem 0', fontSize: '14px' }}>
                            {project.description}
                          </p>
                        )}
                        <p style={{ color: colors.text2, fontSize: '13px', margin: '0.5rem 0 0 0' }}>
                          Lead: {project.lead.name}
                        </p>
                      </div>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor:
                            project.status === 'active'
                              ? '#10b98150'
                              : '#f59e0b50',
                          color:
                            project.status === 'active'
                              ? colors.success
                              : colors.warning,
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main style={{ backgroundColor: colors.bg, minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            color: colors.teal.accent,
            border: `1px solid ${colors.teal.accent}`,
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            fontSize: '14px',
          }}
        >
          ← Back to Departments
        </button>

        <h1 style={{ color: colors.text, fontFamily: "'DM Serif Display', serif", fontSize: '32px', marginBottom: '2rem' }}>
          {department.name}
        </h1>

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

        {/* Tab Content */}
        <div style={{ backgroundColor: colors.surface, padding: '2rem', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
          {renderTabContent()}
        </div>
      </div>
    </main>
  );
}
