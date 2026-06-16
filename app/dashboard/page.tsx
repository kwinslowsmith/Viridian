'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { colors } from '@/app/modules/improv/design/colors';

function expandRecurringEvents(events: any[]): any[] {
  const expanded: any[] = [];
  const now = new Date();
  const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());

  events.forEach((event) => {
    if (event.recurrenceType === 'none') {
      expanded.push(event);
      return;
    }

    const startDate = new Date(event.startDate);
    const endDate = event.recurrenceEndDate ? new Date(event.recurrenceEndDate) : twoYearsFromNow;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate && currentDate <= twoYearsFromNow) {
      expanded.push({
        ...event,
        startDate: new Date(currentDate),
        endDate: event.endDate ? new Date(currentDate.getTime() + (new Date(event.endDate).getTime() - startDate.getTime())) : null,
        isRecurringInstance: true,
      });

      if (event.recurrenceType === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (event.recurrenceType === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
  });

  return expanded;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar'>('dashboard');
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      const [orgsRes, communitiesRes, classesRes, eventsRes] = await Promise.all([
        fetch('/api/me/organizations'),
        fetch('/api/me/communities'),
        fetch('/api/me/classes'),
        fetch('/api/me/events'),
      ]);

      if (orgsRes.ok) {
        const data = await orgsRes.json();
        setOrganizations(data.organizations || []);
        // Pre-select all organizations
        const orgIds = new Set<string>(data.organizations.map((org: any) => org.id as string));
        setSelectedOrgs(orgIds);
      }

      if (communitiesRes.ok) {
        const data = await communitiesRes.json();
        setCommunities(data.communities || []);
      }

      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(data.classes || []);
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        const expanded = expandRecurringEvents(data.events || []);
        setEvents(data.events || []);
        setExpandedEvents(expanded);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const joinedCommunities = communities.filter((c) => c.status === 'active');
  const pendingCommunities = communities.filter((c) => c.status === 'pending');

  if (status === 'loading' || loading) {
    return <div style={{ color: colors.text, padding: '2rem' }}>Loading...</div>;
  }

  // If role is selected, show the old role interface
  if (selectedRole === 'teacher') {
    return (
      <div style={{ backgroundColor: colors.bg, minHeight: '100vh', padding: '2rem' }}>
        <button
          onClick={() => setSelectedRole(null)}
          className="mb-8 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
          }}
        >
          ← Back to Dashboard
        </button>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 className="text-3xl font-bold mb-6" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
            Teacher Dashboard
          </h1>
          <p style={{ color: colors.text2 }}>Teacher features coming soon...</p>
        </div>
      </div>
    );
  }

  if (selectedRole === 'student') {
    return (
      <div style={{ backgroundColor: colors.bg, minHeight: '100vh', padding: '2rem' }}>
        <button
          onClick={() => setSelectedRole(null)}
          className="mb-8 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
          }}
        >
          ← Back to Dashboard
        </button>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 className="text-3xl font-bold mb-6" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
            Student Dashboard
          </h1>
          <p style={{ color: colors.text2 }}>Student features coming soon...</p>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <main style={{ backgroundColor: colors.bg, minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Header */}
      <div className="p-6 md:p-8" style={{ backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
        <h1
          className="text-4xl md:text-5xl font-bold mb-2"
          style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}
        >
          Welcome, {session?.user?.name || 'Learner'}
        </h1>
        <p style={{ color: colors.text2 }}>Your learning hub for communities and organizations</p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: `1px solid ${colors.border}`, paddingBottom: '0', flexWrap: 'wrap', padding: '0 2rem' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            padding: '12px 16px',
            backgroundColor: 'transparent',
            color: activeTab === 'dashboard' ? colors.teal.accent : colors.text2,
            border: 'none',
            borderBottom: activeTab === 'dashboard' ? `2px solid ${colors.teal.accent}` : '2px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'dashboard' ? '600' : '500',
            transition: 'all 0.2s',
          }}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          style={{
            padding: '12px 16px',
            backgroundColor: 'transparent',
            color: activeTab === 'calendar' ? colors.teal.accent : colors.text2,
            border: 'none',
            borderBottom: activeTab === 'calendar' ? `2px solid ${colors.teal.accent}` : '2px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'calendar' ? '600' : '500',
            transition: 'all 0.2s',
          }}
        >
          Calendar
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        {activeTab === 'calendar' && (
          <section className="mb-12">
            {/* View Toggle */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: colors.surface, padding: '0.25rem', borderRadius: '6px', border: `1px solid ${colors.border}` }}>
                <button
                  onClick={() => setViewMode('week')}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: viewMode === 'week' ? colors.teal.bg : 'transparent',
                    color: viewMode === 'week' ? 'white' : colors.text,
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                  }}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: viewMode === 'month' ? colors.teal.bg : 'transparent',
                    color: viewMode === 'month' ? 'white' : colors.text,
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                  }}
                >
                  Month
                </button>
              </div>

              <button
                onClick={() => setShowEventModal(true)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: colors.teal.accent,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                + Create Event
              </button>
            </div>

            {/* Organization Filters */}
            {organizations.length > 0 && (
              <div style={{ marginBottom: '1.5rem', backgroundColor: colors.surface, padding: '1rem', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
                <div style={{ color: colors.text, fontWeight: '600', marginBottom: '0.75rem', fontSize: '14px' }}>
                  Filter by Organization:
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {organizations.map((org) => (
                    <label key={org.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedOrgs.has(org.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedOrgs);
                          if (e.target.checked) {
                            newSet.add(org.id);
                          } else {
                            newSet.delete(org.id);
                          }
                          setSelectedOrgs(newSet);
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ color: colors.text, fontSize: '14px' }}>{org.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar */}
            <div
              style={{
                backgroundColor: colors.surface,
                padding: '1.5rem',
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
              }}
            >
              {viewMode === 'week' ? (
                <DashboardWeekCalendar
                  classes={classes.filter((c) => selectedOrgs.has(c.organizationId))}
                  events={expandedEvents.filter((e) => selectedOrgs.has(e.organizationId) || !e.organizationId)}
                  currentWeekStart={currentWeekStart}
                  onPreviousWeek={() => setCurrentWeekStart(new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000))}
                  onNextWeek={() => setCurrentWeekStart(new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000))}
                  onToday={() => {
                    const today = new Date();
                    const day = today.getDay();
                    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
                    setCurrentWeekStart(new Date(today.setDate(diff)));
                  }}
                  onEventClick={(event: any) => setSelectedEvent(event)}
                />
              ) : (
                <DashboardMonthCalendar
                  classes={classes.filter((c) => selectedOrgs.has(c.organizationId))}
                  events={expandedEvents.filter((e) => selectedOrgs.has(e.organizationId) || !e.organizationId)}
                  currentMonth={currentMonth}
                  onPreviousMonth={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  onNextMonth={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  onToday={() => {
                    const today = new Date();
                    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                  }}
                  onEventClick={(event: any) => setSelectedEvent(event)}
                />
              )}
            </div>
          </section>
        )}

        {/* Event Creation Modal */}
        {showEventModal && (
          <DashboardEventCreateModal
            organizations={organizations}
            onClose={() => setShowEventModal(false)}
            onSuccess={() => {
              setShowEventModal(false);
              // Refresh events
              fetchData();
            }}
          />
        )}

        {/* Event Detail Modal */}
        {selectedEvent && (
          <DashboardEventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onUpdated={() => {
              setSelectedEvent(null);
              fetchData();
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <div>
        {/* Organizations Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
              Your Organizations
            </h2>
            <Link
              href="/organizations/create"
              className="px-4 py-2 rounded font-semibold text-sm text-white"
              style={{ backgroundColor: colors.teal.bg }}
            >
              + Create Organization
            </Link>
          </div>

          {organizations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className="p-6 rounded-lg border cursor-pointer transition-all hover:shadow-md"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  onClick={() => router.push(`/organization/${org.slug}`)}
                >
                  <h3 className="text-lg font-bold mb-2" style={{ color: colors.text }}>
                    {org.name}
                  </h3>
                  <div className="text-sm space-y-1" style={{ color: colors.text2 }}>
                    <div>Role: {org.userRole}</div>
                    <div>{org._count?.users || 0} members</div>
                    <div>{org._count?.learningCommunities || 0} communities</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="p-6 rounded-lg text-center"
              style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
            >
              <p style={{ color: colors.text2 }}>You're not part of any organizations yet.</p>
              <p style={{ color: colors.text2, fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Organization management coming soon
              </p>
            </div>
          )}
        </section>

        {/* Communities Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
              Your Learning Communities
            </h2>
            <Link
              href="/discover"
              className="px-4 py-2 rounded font-semibold text-sm text-white"
              style={{ backgroundColor: colors.teal.bg }}
            >
              Discover Communities
            </Link>
          </div>

          {joinedCommunities.length > 0 || pendingCommunities.length > 0 ? (
            <div className="space-y-4">
              {/* Joined Communities */}
              {joinedCommunities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
                    Active Communities ({joinedCommunities.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {joinedCommunities.map((community) => (
                      <Link
                        key={community.id}
                        href={`/discover/${community.slug}`}
                        className="p-5 rounded-lg border transition-all hover:shadow-md"
                        style={{ backgroundColor: colors.surface, borderColor: colors.border, textDecoration: 'none' }}
                      >
                        <h4 className="font-bold text-base mb-1" style={{ color: colors.text }}>
                          {community.name}
                        </h4>
                        <p style={{ color: colors.text2 }} className="text-sm mb-3">
                          {community.description || 'No description'}
                        </p>
                        <div className="flex gap-2 text-xs" style={{ color: colors.text2 }}>
                          {community.topic && <span>{community.topic}</span>}
                          {community._count?.modules && <span>•</span>}
                          {community._count?.modules && <span>{community._count.modules} modules</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Communities */}
              {pendingCommunities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
                    Pending Requests ({pendingCommunities.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingCommunities.map((community) => (
                      <div
                        key={community.id}
                        className="p-5 rounded-lg border opacity-75"
                        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                      >
                        <h4 className="font-bold text-base mb-1" style={{ color: colors.text }}>
                          {community.name}
                        </h4>
                        <p style={{ color: colors.text2 }} className="text-sm">
                          Awaiting curator approval...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="p-6 rounded-lg text-center"
              style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
            >
              <p style={{ color: colors.text2 }}>You haven't joined any communities yet.</p>
              <Link
                href="/discover"
                className="mt-4 inline-block px-6 py-2 rounded font-semibold text-white"
                style={{ backgroundColor: colors.teal.bg }}
              >
                Explore Communities
              </Link>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/discover"
              className="p-6 rounded-lg border text-center transition-all hover:shadow-md"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, textDecoration: 'none' }}
            >
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="font-bold mb-2" style={{ color: colors.text }}>
                Discover Communities
              </h3>
              <p style={{ color: colors.text2, fontSize: '0.875rem' }}>
                Find and join learning communities
              </p>
            </Link>

            <Link
              href="/curator"
              className="p-6 rounded-lg border text-center transition-all hover:shadow-md"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, textDecoration: 'none' }}
            >
              <div className="text-3xl mb-3">✏️</div>
              <h3 className="font-bold mb-2" style={{ color: colors.text }}>
                Curator Panel
              </h3>
              <p style={{ color: colors.text2, fontSize: '0.875rem' }}>
                Create and manage communities
              </p>
            </Link>

            <Link
              href="/communities"
              className="p-6 rounded-lg border text-center transition-all hover:shadow-md"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, textDecoration: 'none' }}
            >
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-bold mb-2" style={{ color: colors.text }}>
                My Communities
              </h3>
              <p style={{ color: colors.text2, fontSize: '0.875rem' }}>
                View all your communities
              </p>
            </Link>

            <Link
              href="/discover-organizations"
              className="p-6 rounded-lg border text-center transition-all hover:shadow-md"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, textDecoration: 'none' }}
            >
              <div className="text-3xl mb-3">🏢</div>
              <h3 className="font-bold mb-2" style={{ color: colors.text }}>
                Discover Organizations
              </h3>
              <p style={{ color: colors.text2, fontSize: '0.875rem' }}>
                Browse organizations and their communities
              </p>
            </Link>
          </div>
        </section>

        {/* Role Switcher */}
        <section>
          <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
            Institutional Features
          </h2>
          <p style={{ color: colors.text2 }} className="mb-6">
            Switch to a role to access institutional features (classes, standards, student tracking)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedRole('teacher')}
              className="p-6 rounded-xl border-2 text-left transition-all hover:shadow-md"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.amber.border,
              }}
            >
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                👨‍🏫 Teacher Mode
              </h3>
              <p style={{ color: colors.text2 }}>
                Rate student skills, manage assessments, track progress
              </p>
            </button>

            <button
              onClick={() => setSelectedRole('student')}
              className="p-6 rounded-xl border-2 text-left transition-all hover:shadow-md"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.teal.border,
              }}
            >
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                👨‍🎓 Student Mode
              </h3>
              <p style={{ color: colors.text2 }}>
                View progress, self-rate skills, receive feedback
              </p>
            </button>
          </div>
        </section>
          </div>
        )}
      </div>
    </main>
  );
}

function DashboardWeekCalendar({ classes, events, currentWeekStart, onPreviousWeek, onNextWeek, onToday, onEventClick }: any) {
  const router = useRouter();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayDates: Date[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    dayDates.push(date);
  }

  const weekStartString = currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekEndString = dayDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Get class events for this week
  const classEvents: any[] = [];
  classes.forEach((cls: any) => {
    cls.weeks.forEach((week: any) => {
      const weekStart = new Date(week.startDate);
      const weekEnd = new Date(week.endDate);

      if (weekStart >= currentWeekStart && weekStart < new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        classEvents.push({
          id: week.id,
          classId: cls.id,
          className: cls.name,
          instructor: cls.instructor.name,
          weekNum: week.weekNum,
          weekTitle: week.title,
          startDate: weekStart,
          endDate: weekEnd,
          type: 'class',
          color: colors.teal.accent,
        });
      }
    });
  });

  // Get standalone events for this week
  const standalonEvents = events
    .filter((event: any) => {
      const eventDate = new Date(event.startDate);
      return eventDate >= currentWeekStart && eventDate < new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    })
    .map((event: any) => ({
      ...event,
      type: 'event',
      color: '#FF6B6B',
    }));

  const weekEvents = [...classEvents, ...standalonEvents];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', margin: 0 }}>
          Week of {weekStartString} - {weekEndString}
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onPreviousWeek}
            style={{
              padding: '8px 12px',
              backgroundColor: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            ← Previous
          </button>
          <button
            onClick={onToday}
            style={{
              padding: '8px 12px',
              backgroundColor: colors.teal.bg,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Today
          </button>
          <button
            onClick={onNextWeek}
            style={{
              padding: '8px 12px',
              backgroundColor: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Next →
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '1rem' }}>
        {dayDates.map((date, idx) => {
          const dayEvents = weekEvents.filter((e: any) => {
            const eventDate = new Date(e.startDate);
            return eventDate.toDateString() === date.toDateString();
          });

          const isToday = new Date().toDateString() === date.toDateString();
          const dateStr = date.toLocaleDateString('en-US', { day: 'numeric' });

          return (
            <div
              key={idx}
              style={{
                backgroundColor: colors.surface,
                border: `2px solid ${isToday ? colors.teal.accent : colors.border}`,
                borderRadius: '8px',
                padding: '0.75rem',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  {days[idx]}
                </div>
                <div
                  style={{
                    color: isToday ? colors.teal.accent : colors.text,
                    fontSize: '18px',
                    fontWeight: '700',
                  }}
                >
                  {dateStr}
                </div>
              </div>

              {dayEvents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  {dayEvents.map((event: any) => (
                    <button
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      style={{
                        backgroundColor: event.color,
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        fontSize: '12px',
                        lineHeight: '1.3',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{event.title}</div>
                      {event.location && <div style={{ fontSize: '11px', opacity: 0.9 }}>{event.location}</div>}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ color: colors.text3 || colors.text2, fontSize: '13px', opacity: 0.5 }}>
                  —
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashboardMonthCalendar({ classes, events, currentMonth, onPreviousMonth, onNextMonth, onToday, onEventClick }: any) {
  const monthStr = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const days: (number | null)[] = [];

  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getEventsForDay = (dayOfMonth: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayOfMonth);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const classWeeks: any[] = [];
    classes.forEach((cls: any) => {
      cls.weeks.forEach((week: any) => {
        const weekStart = new Date(week.startDate);
        if (weekStart >= dayStart && weekStart < dayEnd) {
          classWeeks.push({
            id: week.id,
            classId: cls.id,
            className: cls.name,
            title: week.title,
            startDate: weekStart,
            type: 'class',
            color: colors.teal.accent,
          });
        }
      });
    });

    const dayEvents = events
      .filter((event: any) => {
        const eventDate = new Date(event.startDate);
        return eventDate >= dayStart && eventDate < dayEnd;
      })
      .map((event: any) => ({
        ...event,
        type: 'event',
        color: '#FF6B6B',
      }));

    return [...classWeeks, ...dayEvents];
  };

  const isToday = (dayOfMonth: number) => {
    const today = new Date();
    return (
      today.getDate() === dayOfMonth &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', margin: 0 }}>
          {monthStr}
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onPreviousMonth}
            style={{
              padding: '8px 12px',
              backgroundColor: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            ← Previous
          </button>
          <button
            onClick={onToday}
            style={{
              padding: '8px 12px',
              backgroundColor: colors.teal.bg,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Today
          </button>
          <button
            onClick={onNextMonth}
            style={{
              padding: '8px 12px',
              backgroundColor: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Next →
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '0.5rem' }}>
        {dayNames.map((day) => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              color: colors.text2,
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              paddingBottom: '0.5rem',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {days.map((dayOfMonth, idx) => {
          if (dayOfMonth === null) {
            return (
              <div
                key={`empty-${idx}`}
                style={{
                  backgroundColor: colors.bg,
                  borderRadius: '8px',
                  padding: '0.75rem',
                  minHeight: '120px',
                }}
              />
            );
          }

          const dayEvents = getEventsForDay(dayOfMonth);
          const today = isToday(dayOfMonth);

          return (
            <div
              key={dayOfMonth}
              style={{
                backgroundColor: colors.surface,
                border: `2px solid ${today ? colors.teal.accent : colors.border}`,
                borderRadius: '8px',
                padding: '0.75rem',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  color: today ? colors.teal.accent : colors.text,
                  fontSize: '16px',
                  fontWeight: '700',
                  marginBottom: '0.5rem',
                }}
              >
                {dayOfMonth}
              </div>

              {dayEvents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, overflow: 'hidden' }}>
                  {dayEvents.slice(0, 2).map((event: any) => (
                    <button
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      style={{
                        backgroundColor: event.color || '#FF6B6B',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '11px',
                        lineHeight: '1.2',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'opacity 0.2s',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      {event.title}
                    </button>
                  ))}
                  {dayEvents.length > 2 && (
                    <div style={{ color: colors.text2, fontSize: '10px', paddingTop: '0.25rem' }}>
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: colors.text3 || colors.text2, fontSize: '12px', opacity: 0.5 }}>
                  —
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashboardEventCreateModal({ organizations, onClose, onSuccess }: { organizations: any[]; onClose: () => void; onSuccess: () => void }) {
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [recurrenceType, setRecurrenceType] = useState('none');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState(organizations[0]?.id || '');
  const [saving, setSaving] = useState(false);
  const [showAttendeeSelector, setShowAttendeeSelector] = useState(false);
  const [selectedAttendees, setSelectedAttendees] = useState<Set<string>>(new Set());
  const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(new Set());
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<Set<string>>(new Set());
  const [orgUsers, setOrgUsers] = useState<any[]>([]);
  const [orgClasses, setOrgClasses] = useState<any[]>([]);
  const [orgCommunities, setOrgCommunities] = useState<any[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [eventContext, setEventContext] = useState<'class' | 'organization' | 'communities'>('organization');
  const [selectedEventClassId, setSelectedEventClassId] = useState('');

  const fetchOrgAttendees = async (orgId: string) => {
    if (!orgId) return;
    setLoadingAttendees(true);
    try {
      const org = organizations.find((o) => o.id === orgId);
      if (!org) return;

      const [usersRes, classesRes, communitiesRes] = await Promise.all([
        fetch(`/api/organizations/${org.slug}/users`, {
          headers: { 'User-Id': session?.user?.id || '' },
        }),
        fetch(`/api/organizations/${org.slug}/classes`, {
          headers: { 'User-Id': session?.user?.id || '' },
        }),
        fetch(`/api/organizations/${org.slug}/communities`, {
          headers: { 'User-Id': session?.user?.id || '' },
        }),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setOrgUsers(data.users || []);
      }

      if (classesRes.ok) {
        const data = await classesRes.json();
        setOrgClasses(data.classes || []);
      }

      if (communitiesRes.ok) {
        const data = await communitiesRes.json();
        setOrgCommunities(data.communities || []);
      }
    } catch (err) {
      console.error('Failed to fetch attendees:', err);
    } finally {
      setLoadingAttendees(false);
    }
  };

  const handleOrgChange = (orgId: string) => {
    setSelectedOrgId(orgId);
    fetchOrgAttendees(orgId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !startTime || !session?.user?.id || !selectedOrgId) return;

    setSaving(true);
    try {
      const org = organizations.find((o) => o.id === selectedOrgId);
      if (!org) return;

      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = endDate && endTime ? new Date(`${endDate}T${endTime}`) : undefined;

      const eventData: any = {
        title,
        description,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime?.toISOString(),
        location,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
        recurrenceType,
        recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate).toISOString() : undefined,
        eventContext,
        attendeeUserIds: Array.from(selectedAttendees),
        attendeeClassIds: Array.from(selectedClassIds),
        attendeeCommunityIds: Array.from(selectedCommunityIds),
      };

      if (eventContext === 'class') {
        eventData.classId = selectedEventClassId;
      }

      const res = await fetch(`/api/organizations/${org.slug}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Id': session?.user?.id || '',
        },
        body: JSON.stringify(eventData),
      });

      if (res.ok) {
        onSuccess();
      }
    } catch (err) {
      console.error('Failed to create event:', err);
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
        <h2 style={{ color: colors.text, marginBottom: '1.5rem', fontSize: '24px', fontWeight: '600' }}>
          Create Event
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '0.5rem', fontSize: '14px' }}>
              Organization
            </label>
            <select
              value={selectedOrgId}
              onChange={(e) => handleOrgChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surface,
                color: colors.text,
                boxSizing: 'border-box',
                fontSize: '14px',
              }}
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '0.5rem', fontSize: '14px' }}>
              Event Context
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {['class', 'organization', 'communities'].map((ctx) => (
                <button
                  key={ctx}
                  type="button"
                  onClick={() => {
                    setEventContext(ctx as any);
                    setSelectedEventClassId('');
                    setSelectedClassIds(new Set());
                    setSelectedCommunityIds(new Set());
                  }}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: eventContext === ctx ? colors.teal.accent : colors.surface,
                    color: eventContext === ctx ? 'white' : colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                  }}
                >
                  {ctx === 'class' ? '📚 Class' : ctx === 'organization' ? '🏢 Organization' : '👥 Communities'}
                </button>
              ))}
            </div>

            {eventContext === 'class' && (
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '0.5rem', fontSize: '13px' }}>
                  Select Class
                </label>
                <select
                  value={selectedEventClassId}
                  onChange={(e) => setSelectedEventClassId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surface,
                    color: colors.text,
                    boxSizing: 'border-box',
                    fontSize: '14px',
                  }}
                >
                  <option value="">-- Select a class --</option>
                  {orgClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {eventContext === 'communities' && (
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '0.5rem', fontSize: '13px' }}>
                  Select Communities
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', padding: '0.5rem', backgroundColor: colors.surface, borderRadius: '6px', border: `1px solid ${colors.border}` }}>
                  {orgCommunities.length > 0 ? (
                    orgCommunities.map((community) => (
                      <label key={community.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '13px' }}>
                        <input
                          type="checkbox"
                          checked={selectedCommunityIds.has(community.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedCommunityIds);
                            if (e.target.checked) {
                              newSet.add(community.id);
                            } else {
                              newSet.delete(community.id);
                            }
                            setSelectedCommunityIds(newSet);
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ color: colors.text }}>{community.name}</span>
                      </label>
                    ))
                  ) : (
                    <span style={{ color: colors.text2, fontSize: '12px' }}>No communities</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '0.5rem', fontSize: '14px' }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surface,
                color: colors.text,
                boxSizing: 'border-box',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '0.5rem', fontSize: '14px' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surface,
                color: colors.text,
                boxSizing: 'border-box',
                fontSize: '14px',
                minHeight: '80px',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '0.5rem', fontSize: '14px' }}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text,
                  boxSizing: 'border-box',
                  fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '0.5rem', fontSize: '14px' }}>
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text,
                  boxSizing: 'border-box',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '0.5rem', fontSize: '14px' }}>
                End Date (optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text,
                  boxSizing: 'border-box',
                  fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '0.5rem', fontSize: '14px' }}>
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text,
                  boxSizing: 'border-box',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '0.5rem', fontSize: '14px' }}>
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Building A, Room 201 or zoom.us/j/..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surface,
                color: colors.text,
                boxSizing: 'border-box',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '0.5rem', fontSize: '14px' }}>
              Recurrence
            </label>
            <select
              value={recurrenceType}
              onChange={(e) => setRecurrenceType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surface,
                color: colors.text,
                boxSizing: 'border-box',
                fontSize: '14px',
              }}
            >
              <option value="none">One-time event</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {recurrenceType !== 'none' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '0.5rem', fontSize: '14px' }}>
                Recurrence End Date
              </label>
              <input
                type="date"
                value={recurrenceEndDate}
                onChange={(e) => setRecurrenceEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text,
                  boxSizing: 'border-box',
                  fontSize: '14px',
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setShowAttendeeSelector(!showAttendeeSelector)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: colors.surface,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                marginBottom: showAttendeeSelector ? '1rem' : 0,
              }}
            >
              {showAttendeeSelector ? '▼' : '▶'} Add Attendees & Classes ({selectedAttendees.size + selectedClassIds.size})
            </button>

            {showAttendeeSelector && (
              <div style={{ backgroundColor: colors.surface, padding: '1rem', borderRadius: '6px', border: `1px solid ${colors.border}` }}>
                {loadingAttendees ? (
                  <p style={{ color: colors.text2, fontSize: '14px', margin: 0 }}>Loading...</p>
                ) : (
                  <>
                    {orgUsers.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', margin: 0 }}>People</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          {orgUsers.map((user: any) => (
                            <label key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '13px' }}>
                              <input
                                type="checkbox"
                                checked={selectedAttendees.has(user.id)}
                                onChange={(e) => {
                                  const newSet = new Set(selectedAttendees);
                                  if (e.target.checked) {
                                    newSet.add(user.id);
                                  } else {
                                    newSet.delete(user.id);
                                  }
                                  setSelectedAttendees(newSet);
                                }}
                                style={{ cursor: 'pointer' }}
                              />
                              <span style={{ color: colors.text }}>{user.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {orgClasses.length > 0 && (
                      <div>
                        <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', margin: 0 }}>Classes</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          {orgClasses.map((cls: any) => (
                            <label key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '13px' }}>
                              <input
                                type="checkbox"
                                checked={selectedClassIds.has(cls.id)}
                                onChange={(e) => {
                                  const newSet = new Set(selectedClassIds);
                                  if (e.target.checked) {
                                    newSet.add(cls.id);
                                  } else {
                                    newSet.delete(cls.id);
                                  }
                                  setSelectedClassIds(newSet);
                                }}
                                style={{ cursor: 'pointer' }}
                              />
                              <span style={{ color: colors.text }}>{cls.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {orgUsers.length === 0 && orgClasses.length === 0 && (
                      <p style={{ color: colors.text2, fontSize: '14px', margin: 0 }}>No users or classes available</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
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
              Cancel
            </button>
            <button
              type="submit"
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
              {saving ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DashboardEventDetailModal({ event, onClose, onUpdated }: { event: any; onClose: () => void; onUpdated: () => void }) {
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
        <h2 style={{ color: colors.text, marginBottom: '1.5rem', fontSize: '24px', fontWeight: '600' }}>
          {event.title}
        </h2>

        {event.description && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Description
            </div>
            <p style={{ color: colors.text, fontSize: '14px', margin: 0 }}>{event.description}</p>
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Date & Time
          </div>
          <div style={{ color: colors.text, fontSize: '14px' }}>
            {new Date(event.startDate).toLocaleString()}
          </div>
        </div>

        {event.location && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Location
            </div>
            <div style={{ color: colors.text, fontSize: '14px' }}>{event.location}</div>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: colors.teal.accent,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

function DashboardCalendar({ events, currentWeekStart, onPreviousWeek, onNextWeek, onToday }: any) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayDates: Date[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    dayDates.push(date);
  }

  const weekStartString = currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekEndString = dayDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const weekEvents = events
    .filter((event: any) => {
      const eventDate = new Date(event.startDate);
      return eventDate >= currentWeekStart && eventDate < new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    })
    .map((event: any) => ({
      ...event,
      type: 'event',
      color: '#FF6B6B',
    }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', margin: 0 }}>
          Week of {weekStartString} - {weekEndString}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onPreviousWeek}
            style={{
              padding: '8px 12px',
              backgroundColor: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            ← Previous
          </button>
          <button
            onClick={onToday}
            style={{
              padding: '8px 12px',
              backgroundColor: colors.teal.bg,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Today
          </button>
          <button
            onClick={onNextWeek}
            style={{
              padding: '8px 12px',
              backgroundColor: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Next →
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {dayDates.map((date, idx) => {
          const dayEvents = weekEvents.filter((e: any) => {
            const eventDate = new Date(e.startDate);
            return eventDate.toDateString() === date.toDateString();
          });

          const isToday = new Date().toDateString() === date.toDateString();
          const dateStr = date.toLocaleDateString('en-US', { day: 'numeric' });

          return (
            <div
              key={idx}
              style={{
                backgroundColor: colors.surface,
                border: `2px solid ${isToday ? colors.teal.accent : colors.border}`,
                borderRadius: '8px',
                padding: '0.75rem',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  {days[idx]}
                </div>
                <div
                  style={{
                    color: isToday ? colors.teal.accent : colors.text,
                    fontSize: '18px',
                    fontWeight: '700',
                  }}
                >
                  {dateStr}
                </div>
              </div>

              {dayEvents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflow: 'hidden' }}>
                  {dayEvents.map((event: any) => (
                    <div
                      key={event.id}
                      style={{
                        backgroundColor: event.color,
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        fontSize: '12px',
                        lineHeight: '1.3',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{event.title}</div>
                      {event.location && <div style={{ fontSize: '11px', opacity: 0.9 }}>{event.location}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: colors.text3 || colors.text2, fontSize: '13px', opacity: 0.5 }}>
                  —
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
