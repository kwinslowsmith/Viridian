'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { colors } from '@/app/design/colors';
import { MessagingCenter } from '@/app/components/MessagingCenter';

import { TeacherObjectivePicker } from '@/app/components/TeacherObjectivePicker';
import { StudentSelfAssessment } from '@/app/components/StudentSelfAssessment';
import { StudentProgressDashboard } from '@/app/components/StudentProgressDashboard';
import { TeacherClassDashboard } from '@/app/components/TeacherClassDashboard';
import { AddClassModal } from '@/app/components/AddClassModal';
import { AddPeopleModal } from '@/app/components/AddPeopleModal';
import { BrowseClassesModal } from '@/app/components/BrowseClassesModal';
import { OrgResourceLibrary } from '@/app/components/OrgResourceLibrary';
import { OrganizationalUnitList } from '@/app/components/OrganizationalUnitList';
import { OrgNewsfeed } from '@/app/components/OrgNewsfeed';
import { OrgHourlyCalendar } from '@/app/components/OrgHourlyCalendar';
import { K12StandardsInterface } from '@/app/components/K12StandardsInterface';

export default function OrganizationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const slug = params?.slug as string;

  const [userRole, setUserRole] = useState<string | null>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (!session?.user?.id || !slug) return;

    const fetchOrgAndRole = async () => {
      try {
        // Fetch organization
        const orgRes = await fetch(`/api/organizations/${slug}`);
        if (!orgRes.ok) {
          setError('Organization not found');
          setLoading(false);
          return;
        }
        const orgData = await orgRes.json();
        setOrganization(orgData.organization);

        // Fetch user's role in this organization
        const roleRes = await fetch(`/api/organizations/${slug}/user-role`, {
          headers: { 'User-Id': session?.user?.id || '' },
        });

        if (roleRes.ok) {
          const roleData = await roleRes.json();
          setUserRole(roleData.role);
          setLoading(false);
        } else {
          setError('You do not have access to this organization');
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch org:', err);
        setError('Failed to load organization');
        setLoading(false);
      }
    };

    fetchOrgAndRole();
  }, [session?.user?.id, slug, status, router]);

  if (status === 'loading' || loading) {
    return <div style={{ color: colors.text, padding: '2rem' }}>Loading...</div>;
  }

  if (error) {
    return (
      <main style={{ backgroundColor: colors.bg, minHeight: '100vh', padding: '2rem' }}>
        <div style={{ color: colors.text }}>{error}</div>
      </main>
    );
  }

  if (!organization) {
    return (
      <main style={{ backgroundColor: colors.bg, minHeight: '100vh', padding: '2rem' }}>
        <div style={{ color: colors.text }}>Organization not found</div>
      </main>
    );
  }

  // Route based on user role
  if (!userRole) {
    return (
      <main style={{ backgroundColor: colors.bg, minHeight: '100vh', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ color: colors.text, fontSize: '24px', marginBottom: '1rem' }}>
            {organization.name}
          </h1>
          <p style={{ color: colors.text2, marginBottom: '2rem' }}>
            You are not currently enrolled in this organization.
          </p>
          <button
            onClick={() => router.back()}
            style={{
              padding: '10px 20px',
              backgroundColor: colors.teal.bg,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  // Route to role-specific dashboard
  if (userRole === 'SuperAdmin' || userRole === 'Admin') {
    return <AdminDashboard org={organization} />;
  }

  if (userRole === 'Teacher') {
    return <TeacherDashboard org={organization} />;
  }

  if (userRole === 'Student') {
    return <StudentDashboard org={organization} userRole={userRole} />;
  }

  return (
    <main style={{ backgroundColor: colors.bg, minHeight: '100vh', padding: '2rem' }}>
      <div style={{ color: colors.text }}>Unknown role: {userRole}</div>
    </main>
  );
}

function StudentDashboard({ org, userRole }: { org: any; userRole?: string }) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'calendar' | 'classes' | 'standards' | 'events' | 'feedback' | 'messages' | 'community' | 'resources'>('calendar');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showBrowseClasses, setShowBrowseClasses] = useState(false);

  const tabs = [
    { id: 'calendar', label: 'Calendar' },
    { id: 'classes', label: 'Classes' },
    { id: 'resources', label: 'Resources' },
    { id: 'standards', label: 'Standards' },
    { id: 'events', label: 'Events' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'messages', label: 'Messages' },
    { id: 'community', label: 'Community' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <CalendarTab org={org} userRole={userRole} onEventClick={(event) => setSelectedEvent(event)} />;
      case 'classes':
        return <ClassesTab org={org} onBrowseClick={() => setShowBrowseClasses(true)} />;
      case 'resources':
        return <OrgResourceLibrary org={org} userRole="Student" userId={session?.user?.id || ''} />;
      case 'standards':
        return <StandardsTab org={org} />;
      case 'events':
        return <EventsTab org={org} onCreateClick={() => setShowEventModal(true)} onEventClick={(event) => setSelectedEvent(event)} />;
      case 'feedback':
        return <FeedbackTab org={org} />;
      case 'messages':
        return <MessagesTab org={org} />;
      case 'community':
        return <CommunityTab org={org} />;
      default:
        return null;
    }
  };

  return (
    <main style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <div style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ color: colors.text, fontFamily: "'DM Serif Display', serif", fontSize: '32px', marginBottom: '0.5rem' }}>
            {org.name}
          </h1>
          <p style={{ color: colors.text2, marginBottom: '2rem' }}>
            {org.description || 'Welcome to this organization'}
          </p>

          {/* Navigation tabs */}
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
                {tab.id === 'messages' ? 'Message Center' : tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ backgroundColor: colors.surface, padding: '2rem', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Event Creation Modal */}
      {showEventModal && (
        <EventCreateModal
          org={org}
          onClose={() => setShowEventModal(false)}
          onSuccess={() => {
            setShowEventModal(false);
            setActiveTab('events');
          }}
        />
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          org={org}
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdated={() => setSelectedEvent(null)}
        />
      )}

      {/* Browse Classes Modal */}
      {showBrowseClasses && (
        <BrowseClassesModal
          onClose={() => setShowBrowseClasses(false)}
          onEnrolled={() => {
            setShowBrowseClasses(false);
          }}
        />
      )}
    </main>
  );
}

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

function CalendarTab({ org, userRole, onEventClick }: { org: any; userRole?: string; onEventClick?: (event: any) => void }) {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    return new Date(today.setDate(diff));
  });
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    if (!session?.user?.id || !org.slug) return;

    const fetchClassesAndEvents = async () => {
      try {
        const [classesRes, eventsRes] = await Promise.all([
          fetch(`/api/organizations/${org.slug}/classes`, {
            headers: { 'User-Id': session?.user?.id || '' },
          }),
          fetch(`/api/organizations/${org.slug}/events`, {
            headers: { 'User-Id': session?.user?.id || '' },
          }),
        ]);

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
        console.error('Failed to fetch classes/events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassesAndEvents();
  }, [session?.user?.id, org.slug]);

  const goToPreviousWeek = () => {
    setCurrentWeekStart(new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  const goToTodayWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToTodayMonth = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading calendar...</div>;
  }

  return (
    <div>
      {/* Newsfeed at top */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: colors.surface, borderRadius: '8px', border: `2px solid ${colors.teal.accent}` }}>
        <OrgNewsfeed orgSlug={org.slug} userRole={userRole} />
      </div>

      {/* Calendar below */}
      <div>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
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
        </div>

        {viewMode === 'week' ? (
          <WeekCalendar
            classes={classes}
            events={expandedEvents}
            currentWeekStart={currentWeekStart}
            onPreviousWeek={goToPreviousWeek}
            onNextWeek={goToNextWeek}
            onToday={goToTodayWeek}
            orgSlug={org.slug}
          />
        ) : (
          <MonthCalendar
            classes={classes}
            events={expandedEvents}
            currentMonth={currentMonth}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            onToday={goToTodayMonth}
            orgSlug={org.slug}
          />
        )}
      </div>
    </div>
  );
}

function WeekCalendar({ classes, events, currentWeekStart, onPreviousWeek, onNextWeek, onToday, orgSlug, onEventClick }: any) {
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

  // Get class events for this week (only for ImprovClass with weeks)
  const classEvents: any[] = [];
  classes.forEach((cls: any) => {
    if (cls.weeks && Array.isArray(cls.weeks)) {
      cls.weeks.forEach((week: any) => {
        const weekStart = new Date(week.startDate);
        const weekEnd = new Date(week.endDate);

        // Check if this week overlaps with the calendar week
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
    }
  });

  // Get standalone events for this week
  const standalonEvents = (events || [])
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

      {/* Week grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '1rem' }}>
        {dayDates.map((date, idx) => {
          const dayEvents = weekEvents.filter((e) => {
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
                <div style={{
                  color: isToday ? colors.teal.accent : colors.text,
                  fontSize: '18px',
                  fontWeight: '700',
                }}>
                  {dateStr}
                </div>
              </div>

              {dayEvents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  {dayEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => {
                        if (event.type === 'class') {
                          router.push(`/organization/${orgSlug}/class/${event.classId}`);
                        } else if (onEventClick) {
                          onEventClick(event);
                        }
                      }}
                      style={{
                        backgroundColor: event.color,
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        fontSize: '12px',
                        lineHeight: '1.3',
                        border: 'none',
                        cursor: event.type === 'class' ? 'pointer' : 'pointer',
                        textAlign: 'left',
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        {event.type === 'class' ? event.className : event.title}
                      </div>
                      {event.type === 'class' && (
                        <>
                          <div style={{ fontSize: '11px', opacity: 0.9 }}>{event.weekTitle}</div>
                          <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '0.25rem' }}>w/ {event.instructor}</div>
                        </>
                      )}
                      {event.type === 'event' && event.location && (
                        <div style={{ fontSize: '11px', opacity: 0.9 }}>{event.location}</div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ color: colors.text3 || colors.text2, fontSize: '13px', opacity: 0.5 }}>
                  No events
                </div>
              )}
            </div>
          );
        })}
      </div>

      {classes.length === 0 && (
        <div style={{
          backgroundColor: colors.bg,
          border: `1px dashed ${colors.border}`,
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <p style={{ color: colors.text2 }}>You are not enrolled in any classes yet.</p>
        </div>
      )}
    </div>
  );
}

function MonthCalendar({ classes, events, currentMonth, onPreviousMonth, onNextMonth, onToday, orgSlug, onEventClick }: any) {
  const router = useRouter();
  const monthStr = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday start

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const days: (number | null)[] = [];

  // Add empty slots for days before the month starts
  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getEventsForDay = (dayOfMonth: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayOfMonth);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const classEvents = classes.flatMap((cls: any) =>
      cls.weeks && Array.isArray(cls.weeks)
        ? cls.weeks
            .filter((week: any) => {
              const weekStart = new Date(week.startDate);
              return weekStart >= dayStart && weekStart < dayEnd;
            })
            .map((week: any) => ({
              id: week.id,
              classId: cls.id,
              className: cls.name,
              instructor: cls.instructor.name,
              weekNum: week.weekNum,
              weekTitle: week.title,
              startDate: new Date(week.startDate),
              type: 'class',
              color: colors.teal.accent,
            }))
        : []
    );

    const dayEvents = (events || [])
      .filter((event: any) => {
        const eventDate = new Date(event.startDate);
        return eventDate >= dayStart && eventDate < dayEnd;
      })
      .map((event: any) => ({
        ...event,
        type: 'event',
        color: '#FF6B6B',
      }));

    return [...classEvents, ...dayEvents];
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

      {/* Day names header */}
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

      {/* Month grid */}
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
              <div style={{
                color: today ? colors.teal.accent : colors.text,
                fontSize: '16px',
                fontWeight: '700',
                marginBottom: '0.5rem',
              }}>
                {dayOfMonth}
              </div>

              {dayEvents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, overflow: 'hidden' }}>
                  {dayEvents.slice(0, 2).map((event) => (
                    <button
                      key={event.id}
                      onClick={() => {
                        if (event.type === 'class') {
                          router.push(`/organization/${orgSlug}/class/${event.classId}`);
                        } else if (onEventClick) {
                          onEventClick(event);
                        }
                      }}
                      style={{
                        backgroundColor: event.color,
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
                      {event.type === 'class' ? event.className : event.title}
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

function ClassesTab({ org, onBrowseClick }: { org: any; onBrowseClick?: () => void }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id || !org.slug) return;

    const fetchClasses = async () => {
      try {
        const res = await fetch(`/api/organizations/${org.slug}/classes`, {
          headers: { 'User-Id': session?.user?.id || '' },
        });

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
  }, [session?.user?.id, org.slug]);

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading classes...</div>;
  }

  if (classes.length === 0) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', margin: 0 }}>Your Classes</h2>
          <button
            onClick={onBrowseClick}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: colors.teal.accent,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
            }}
          >
            Browse Classes
          </button>
        </div>
        <p style={{ color: colors.text2 }}>You are not enrolled in any classes yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', margin: 0 }}>Your Classes</h2>
        <button
          onClick={onBrowseClick}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: colors.teal.accent,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
          }}
        >
          Browse More Classes
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {classes.map((cls) => (
          <div
            key={cls.id}
            onClick={() => router.push(`/organization/${org.slug}/class/${cls.id}`)}
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '1.5rem',
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
            <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '0.25rem' }}>
              {cls.name}
            </h3>
            {cls.subtitle && (
              <p style={{ color: colors.text2, fontSize: '14px', marginBottom: '1rem' }}>
                {cls.subtitle}
              </p>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', paddingTop: '1rem', borderTop: `1px solid ${colors.border}` }}>
              <div>
                <div style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Instructor
                </div>
                <div style={{ color: colors.text, fontSize: '13px', fontWeight: '500' }}>
                  {cls.instructor.name}
                </div>
              </div>
              <div>
                <div style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Weeks
                </div>
                <div style={{ color: colors.text, fontSize: '13px', fontWeight: '500' }}>
                  {cls.weeks?.length || 0}
                </div>
              </div>
              <div>
                <div style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Enrolled
                </div>
                <div style={{ color: colors.text, fontSize: '13px', fontWeight: '500' }}>
                  {cls._count.enrollments}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: colors.teal.accent, fontWeight: '600' }}>
              View Class Details →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StandardsTab({ org }: { org: any }) {
  return (
    <div>
      <K12StandardsInterface orgId={org?.id} orgSlug={org?.slug} />
    </div>
  );
}

function FeedbackTab({ org }: { org: any }) {
  return (
    <div>
      <h2 style={{ color: colors.text, marginBottom: '1rem', fontSize: '20px', fontWeight: '600' }}>Feedback</h2>
      <p style={{ color: colors.text2 }}>Messages and feedback from your instructors will appear here.</p>
    </div>
  );
}

function MessagesTab({ org }: { org: any }) {
  return (
    <div style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      <MessagingCenter defaultOrgSlug={org.slug} />
    </div>
  );
}

function CommunityTab({ org }: { org: any }) {
  return (
    <div>
      <h2 style={{ color: colors.text, marginBottom: '1rem', fontSize: '20px', fontWeight: '600' }}>Community</h2>
      <p style={{ color: colors.text2 }}>Connect with classmates and access shared resources.</p>
    </div>
  );
}

function EventsTab({ org, onCreateClick, onEventClick }: { org: any; onCreateClick: () => void; onEventClick?: (event: any) => void }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id || !org?.slug) return;

    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/organizations/${org.slug}/events`, {
          headers: { 'User-Id': session?.user?.id || '' },
        });

        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || []);
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [session?.user?.id, org?.slug]);

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading events...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600' }}>
          Events ({events.length})
        </h2>
        <button
          onClick={onCreateClick}
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
          + Create Event
        </button>
      </div>

      {events.length === 0 ? (
        <div style={{ backgroundColor: colors.surface, padding: '2rem', borderRadius: '8px', border: `1px solid ${colors.border}`, textAlign: 'center' }}>
          <p style={{ color: colors.text2, marginBottom: '1rem' }}>No events scheduled yet.</p>
          <button
            onClick={onCreateClick}
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
            Create the first event
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {events.map((event: any) => (
            <EventCard key={event.id} event={event} orgSlug={org.slug} onEventClick={onEventClick} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event, orgSlug, onEventClick }: { event: any; orgSlug: string; onEventClick?: (event: any) => void }) {
  const { data: session } = useSession();
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(event.rsvps?.[0]?.status || null);
  const [saving, setSaving] = useState(false);

  const handleRSVP = async (status: string) => {
    if (!session?.user?.id) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/organizations/${orgSlug}/events/${event.id}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Id': session?.user?.id || '',
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setRsvpStatus(status);
      }
    } catch (err) {
      console.error('Failed to RSVP:', err);
    } finally {
      setSaving(false);
    }
  };

  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  return (
    <div
      onClick={() => onEventClick?.(event)}
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '1.5rem',
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
      <h3 style={{ color: colors.text, fontWeight: '600', fontSize: '18px', marginBottom: '0.5rem' }}>
        {event.title}
      </h3>

      {event.description && (
        <p style={{ color: colors.text2, fontSize: '14px', marginBottom: '1rem', lineHeight: '1.5' }}>
          {event.description}
        </p>
      )}

      <div style={{ color: colors.text2, fontSize: '13px', marginBottom: '1rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          📅 {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        {event.location && (
          <div style={{ marginBottom: '0.5rem' }}>
            📍 {event.location}
        </div>
        )}
        {event.maxAttendees && (
          <div>
            👥 {event._count.rsvps}/{event.maxAttendees} attending
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => handleRSVP('attending')}
          disabled={saving}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: rsvpStatus === 'attending' ? colors.proficient.accent : colors.bg,
            color: rsvpStatus === 'attending' ? colors.surface : colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            fontSize: '12px',
            opacity: saving ? 0.6 : 1,
          }}
        >
          ✓ Attending
        </button>
        <button
          onClick={() => handleRSVP('maybe')}
          disabled={saving}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: rsvpStatus === 'maybe' ? colors.developing.accent : colors.bg,
            color: rsvpStatus === 'maybe' ? colors.surface : colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            fontSize: '12px',
            opacity: saving ? 0.6 : 1,
          }}
        >
          ? Maybe
        </button>
        <button
          onClick={() => handleRSVP('declined')}
          disabled={saving}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: rsvpStatus === 'declined' ? colors.red.accent : colors.bg,
            color: rsvpStatus === 'declined' ? colors.surface : colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            fontSize: '12px',
            opacity: saving ? 0.6 : 1,
          }}
        >
          ✗ Can't attend
        </button>
      </div>
    </div>
  );
}

function TeacherDashboard({ org }: { org: any }) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'calendar' | 'classes' | 'resources' | 'events' | 'messages'>('calendar');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const tabs = [
    { id: 'calendar', label: 'Calendar' },
    { id: 'classes', label: 'Classes' },
    { id: 'resources', label: 'Resources' },
    { id: 'events', label: 'Events' },
    { id: 'messages', label: 'Messages' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <TeacherCalendarTab org={org} onEventClick={(event) => setSelectedEvent(event)} />;
      case 'classes':
        return <TeacherClassesTab org={org} />;
      case 'resources':
        return <OrgResourceLibrary org={org} userRole="Teacher" userId={session?.user?.id || ''} />;
      case 'events':
        return <EventsTab org={org} onCreateClick={() => setShowEventModal(true)} onEventClick={(event) => setSelectedEvent(event)} />;
      case 'messages':
        return <MessagesTab org={org} />;
      default:
        return null;
    }
  };

  return (
    <main style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <div style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ color: colors.text, fontFamily: "'DM Serif Display', serif", fontSize: '32px', marginBottom: '0.5rem' }}>
            {org.name}
          </h1>
          <p style={{ color: colors.text2, marginBottom: '2rem' }}>
            Teacher Dashboard
          </p>

          {/* Navigation tabs */}
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
                {tab.id === 'messages' ? 'Message Center' : tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ backgroundColor: colors.surface, padding: '2rem', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Event Creation Modal */}
      {showEventModal && (
        <EventCreateModal
          org={org}
          onClose={() => setShowEventModal(false)}
          onSuccess={() => {
            setShowEventModal(false);
            setActiveTab('events');
          }}
        />
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          org={org}
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdated={() => setSelectedEvent(null)}
        />
      )}
    </main>
  );
}

function TeacherCalendarTab({ org, onEventClick }: { org: any; onEventClick?: (event: any) => void }) {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
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
    if (!session?.user?.id || !org.slug) return;

    const fetchClassesAndEvents = async () => {
      try {
        const [classesRes, eventsRes] = await Promise.all([
          fetch(`/api/organizations/${org.slug}/teaching-classes`, {
            headers: { 'User-Id': session?.user?.id || '' },
          }),
          fetch(`/api/organizations/${org.slug}/events`, {
            headers: { 'User-Id': session?.user?.id || '' },
          }),
        ]);

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
        console.error('Failed to fetch classes/events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassesAndEvents();
  }, [session?.user?.id, org.slug]);

  const goToPreviousWeek = () => {
    setCurrentWeekStart(new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  const goToTodayWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToTodayMonth = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading calendar...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
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
      </div>

      {viewMode === 'week' ? (
        <WeekCalendar
          classes={classes}
          events={expandedEvents}
          currentWeekStart={currentWeekStart}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
          onToday={goToTodayWeek}
          orgSlug={org.slug}
          onEventClick={onEventClick}
        />
      ) : (
        <MonthCalendar
          classes={classes}
          events={expandedEvents}
          currentMonth={currentMonth}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onToday={goToTodayMonth}
          orgSlug={org.slug}
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
}

function TeacherClassesTab({ org }: { org: any }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id || !org.slug) return;

    const fetchClasses = async () => {
      try {
        const res = await fetch(`/api/organizations/${org.slug}/teaching-classes`, {
          headers: { 'User-Id': session?.user?.id || '' },
        });

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
  }, [session?.user?.id, org.slug]);

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading classes...</div>;
  }

  if (classes.length === 0) {
    return (
      <div>
        <h2 style={{ color: colors.text, marginBottom: '1rem', fontSize: '20px', fontWeight: '600' }}>Your Classes</h2>
        <p style={{ color: colors.text2 }}>You are not teaching any classes yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ color: colors.text, marginBottom: '1.5rem', fontSize: '20px', fontWeight: '600' }}>Your Classes</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {classes.map((cls) => (
          <div
            key={cls.id}
            onClick={() => router.push(`/organization/${org.slug}/class/${cls.id}`)}
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '1.5rem',
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
            <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '0.25rem' }}>
              {cls.name}
            </h3>
            {cls.subtitle && (
              <p style={{ color: colors.text2, fontSize: '14px', marginBottom: '1rem' }}>
                {cls.subtitle}
              </p>
            )}

            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: `1px solid ${colors.border}` }}>
              <div>
                <div style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Weeks
                </div>
                <div style={{ color: colors.text, fontSize: '13px', fontWeight: '500' }}>
                  {cls.weeks?.length || 0}
                </div>
              </div>
              <div>
                <div style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Students
                </div>
                <div style={{ color: colors.text, fontSize: '13px', fontWeight: '500' }}>
                  {cls._count?.enrollments || 0}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventCreateModal({ org, onClose, onSuccess }: { org: any; onClose: () => void; onSuccess: () => void }) {
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
  const [communityId, setCommunityId] = useState('');
  const [curatedCommunities, setCuratedCommunities] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id || !org?.id) return;

    const fetchCuratedCommunities = async () => {
      try {
        // Fetch communities where user is curator
        const res = await fetch(`/api/organizations/${org.slug}/communities`, {
          headers: { 'User-Id': session?.user?.id || '' },
        });

        if (res.ok) {
          const data = await res.json();
          setCuratedCommunities(data.communities || []);
        }
      } catch (err) {
        console.error('Failed to fetch communities:', err);
      }
    };

    fetchCuratedCommunities();
  }, [session?.user?.id, org?.id, org?.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !startTime || !session?.user?.id) return;

    setSaving(true);
    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = endDate && endTime ? new Date(`${endDate}T${endTime}`) : undefined;

      const res = await fetch(`/api/organizations/${org.slug}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Id': session?.user?.id || '',
        },
        body: JSON.stringify({
          title,
          description,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime?.toISOString(),
          location,
          maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
          recurrenceType,
          recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate).toISOString() : undefined,
          communityId: communityId || undefined,
        }),
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
              Event Title *
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

          {curatedCommunities.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '0.5rem', fontSize: '14px' }}>
                Event Type
              </label>
              <select
                value={communityId}
                onChange={(e) => setCommunityId(e.target.value)}
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
                <option value="">Organization Event</option>
                {curatedCommunities.map((community: any) => (
                  <option key={community.id} value={community.id}>
                    {community.name} (Community)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '0.5rem', fontSize: '14px' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '0.5rem', fontSize: '14px' }}>
                Start Date *
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
                Start Time *
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
                End Date
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
              Location (address or link)
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
              Max Attendees
            </label>
            <input
              type="number"
              value={maxAttendees}
              onChange={(e) => setMaxAttendees(e.target.value)}
              min="1"
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

function EventDetailModal({ org, event, onClose, onUpdated }: { org: any; event: any; onClose: () => void; onUpdated: () => void }) {
  const { data: session } = useSession();

  const formatDateForInput = (date: any) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  };

  const formatTimeForInput = (date: any) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[1]?.slice(0, 5) || '';
  };

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [startDate, setStartDate] = useState(formatDateForInput(event.startDate));
  const [startTime, setStartTime] = useState(formatTimeForInput(event.startDate));
  const [endDate, setEndDate] = useState(formatDateForInput(event.endDate));
  const [endTime, setEndTime] = useState(formatTimeForInput(event.endDate));
  const [location, setLocation] = useState(event.location || '');
  const [maxAttendees, setMaxAttendees] = useState(event.maxAttendees?.toString() || '');
  const [recurrenceType, setRecurrenceType] = useState(event.recurrenceType || 'none');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(event.recurrenceEndDate ? formatDateForInput(event.recurrenceEndDate) : '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isCreator = session?.user?.id === event.createdById;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !startTime || !session?.user?.id) return;

    setSaving(true);
    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = endDate && endTime ? new Date(`${endDate}T${endTime}`) : undefined;

      const res = await fetch(`/api/organizations/${org.slug}/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'User-Id': session?.user?.id || '',
        },
        body: JSON.stringify({
          title,
          description,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime?.toISOString(),
          location,
          maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
          recurrenceType,
          recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate).toISOString() : undefined,
        }),
      });

      if (res.ok) {
        onUpdated();
      }
    } catch (err) {
      console.error('Failed to update event:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/organizations/${org.slug}/events/${event.id}`, {
        method: 'DELETE',
        headers: {
          'User-Id': session?.user?.id || '',
        },
      });

      if (res.ok) {
        onUpdated();
      }
    } catch (err) {
      console.error('Failed to delete event:', err);
    } finally {
      setDeleting(false);
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
          Event Details
        </h2>

        {isCreator ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: colors.text, fontWeight: '600', marginBottom: '0.5rem', fontSize: '14px' }}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                    opacity: deleting ? 0.6 : 1,
                  }}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
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
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Title
              </div>
              <div style={{ color: colors.text, fontSize: '16px', fontWeight: '500' }}>{title}</div>
            </div>

            {description && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Description
                </div>
                <div style={{ color: colors.text, fontSize: '14px' }}>{description}</div>
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

            {location && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Location
                </div>
                <div style={{ color: colors.text, fontSize: '14px' }}>{location}</div>
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
        )}
      </div>
    </div>
  );
}

function AdminDashboard({ org }: { org: any }) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'calendar' | 'classes' | 'resources' | 'events' | 'messages' | 'people' | 'communities' | 'departments' | 'standards'>('calendar');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddPeopleModal, setShowAddPeopleModal] = useState(false);

  const tabs = [
    { id: 'calendar', label: 'Calendar' },
    { id: 'classes', label: 'Classes' },
    { id: 'departments', label: 'Departments' },
    { id: 'standards', label: 'Standards' },
    { id: 'resources', label: 'Resources' },
    { id: 'communities', label: 'Communities' },
    { id: 'events', label: 'Events' },
    { id: 'people', label: 'People' },
    { id: 'messages', label: 'Messages' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <AdminCalendarTab org={org} userRole="SuperAdmin" onEventClick={(event) => setSelectedEvent(event)} />;
      case 'classes':
        return <AdminClassesTab org={org} onAddClick={() => setShowAddClassModal(true)} />;
      case 'departments':
        return <OrganizationalUnitList orgSlug={org.slug} />;
      case 'standards':
        return <StandardsTab org={org} />;
      case 'resources':
        return <OrgResourceLibrary org={org} userRole="SuperAdmin" userId={session?.user?.id || ''} />;
      case 'communities':
        return <CommunitiesTab org={org} />;
      case 'events':
        return <EventsTab org={org} onCreateClick={() => setShowEventModal(true)} onEventClick={(event) => setSelectedEvent(event)} />;
      case 'people':
        return <PeopleTab org={org} onSwitchTab={(tab) => setActiveTab(tab as 'events' | 'messages' | 'classes' | 'people' | 'calendar' | 'communities' | 'resources' | 'departments')} onAddClick={() => setShowAddPeopleModal(true)} />;
      case 'messages':
        return <MessagesTab org={org} />;
      default:
        return null;
    }
  };

  return (
    <main style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <div style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ color: colors.text, fontFamily: "'DM Serif Display', serif", fontSize: '32px', marginBottom: '0.5rem' }}>
            {org.name}
          </h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <p style={{ color: colors.text2, margin: 0 }}>
              Admin Dashboard
            </p>
          </div>

          {/* Navigation tabs */}
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
                {tab.id === 'messages' ? 'Message Center' : tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ backgroundColor: colors.surface, padding: '2rem', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Event Creation Modal */}
      {showEventModal && (
        <EventCreateModal
          org={org}
          onClose={() => setShowEventModal(false)}
          onSuccess={() => {
            setShowEventModal(false);
            setActiveTab('events');
          }}
        />
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          org={org}
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdated={() => setSelectedEvent(null)}
        />
      )}

      {/* Add Class Modal */}
      {showAddClassModal && (
        <AddClassModal
          orgSlug={org.slug}
          onClose={() => setShowAddClassModal(false)}
          onSuccess={() => {
            setShowAddClassModal(false);
            setActiveTab('classes');
          }}
        />
      )}

      {/* Add People Modal */}
      {showAddPeopleModal && (
        <AddPeopleModal
          orgId={org.id}
          orgSlug={org.slug}
          onClose={() => setShowAddPeopleModal(false)}
          onSuccess={() => {
            setShowAddPeopleModal(false);
            setActiveTab('people');
          }}
        />
      )}
    </main>
  );
}

function AdminCalendarTab({ org, userRole, onEventClick }: { org: any; userRole?: string; onEventClick?: (event: any) => void }) {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'hourly'>('hourly');
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
    if (!session?.user?.id || !org.slug) return;

    const fetchClassesAndEvents = async () => {
      try {
        const [classesRes, eventsRes] = await Promise.all([
          fetch(`/api/organizations/${org.slug}/classes`, {
            headers: { 'User-Id': session?.user?.id || '' },
          }),
          fetch(`/api/organizations/${org.slug}/events`, {
            headers: { 'User-Id': session?.user?.id || '' },
          }),
        ]);

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
        console.error('Failed to fetch classes/events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassesAndEvents();
  }, [session?.user?.id, org.slug]);

  const goToPreviousWeek = () => {
    setCurrentWeekStart(new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  const goToTodayWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToTodayMonth = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading calendar...</div>;
  }

  return (
    <div>
      {/* Newsfeed at top */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: colors.surface, borderRadius: '8px', border: `2px solid ${colors.teal.accent}` }}>
        <OrgNewsfeed orgSlug={org.slug} userRole={userRole} />
      </div>

      {/* Calendar below */}
      <div>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: colors.surface, padding: '0.25rem', borderRadius: '6px', border: `1px solid ${colors.border}` }}>
            <button
              onClick={() => setViewMode('hourly')}
              style={{
                padding: '8px 12px',
                backgroundColor: viewMode === 'hourly' ? colors.teal.bg : 'transparent',
                color: viewMode === 'hourly' ? 'white' : colors.text,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
            >
              Hourly
            </button>
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
        </div>

        {viewMode === 'hourly' ? (
          <OrgHourlyCalendar orgSlug={org.slug} userRole={userRole} />
        ) : viewMode === 'week' ? (
          <WeekCalendar
            classes={classes}
            events={expandedEvents}
            currentWeekStart={currentWeekStart}
            onPreviousWeek={goToPreviousWeek}
            onNextWeek={goToNextWeek}
            onToday={goToTodayWeek}
            orgSlug={org.slug}
            onEventClick={onEventClick}
          />
        ) : (
          <MonthCalendar
            classes={classes}
            events={expandedEvents}
            currentMonth={currentMonth}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            onToday={goToTodayMonth}
            orgSlug={org.slug}
            onEventClick={onEventClick}
          />
        )}
      </div>
    </div>
  );
}

function AdminClassesTab({ org, onAddClick }: { org: any; onAddClick?: () => void }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id || !org.slug) return;

    const fetchClasses = async () => {
      try {
        const res = await fetch(`/api/organizations/${org.slug}/classes`, {
          headers: { 'User-Id': session?.user?.id || '' },
        });

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
  }, [session?.user?.id, org.slug]);

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading classes...</div>;
  }

  if (classes.length === 0) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', margin: 0 }}>Organization Classes</h2>
          <button
            onClick={onAddClick}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: colors.teal.accent,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
            }}
          >
            + Add Class
          </button>
        </div>
        <p style={{ color: colors.text2 }}>No classes in this organization yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', margin: 0 }}>Organization Classes</h2>
        <button
          onClick={onAddClick}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: colors.teal.accent,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
          }}
        >
          + Add Class
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {classes.map((cls: any) => (
          <div
            key={cls.id}
            onClick={() => {
              router.push(`/organization/${org.slug}/class/${cls.id}`);
            }}
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '1.5rem',
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
            <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '0.25rem' }}>
              {cls.name}
            </h3>
            {cls.subtitle && (
              <p style={{ color: colors.text2, fontSize: '14px', marginBottom: '1rem' }}>
                {cls.subtitle}
              </p>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', paddingTop: '1rem', borderTop: `1px solid ${colors.border}` }}>
              <div>
                <div style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Instructor
                </div>
                <div style={{ color: colors.text, fontSize: '13px', fontWeight: '500' }}>
                  {cls.instructor.name}
                </div>
              </div>
              {cls.type === 'k12' ? (
                <>
                  <div>
                    <div style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Grade
                    </div>
                    <div style={{ color: colors.text, fontSize: '13px', fontWeight: '500' }}>
                      {cls.gradeLevel}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Subject
                    </div>
                    <div style={{ color: colors.text, fontSize: '13px', fontWeight: '500' }}>
                      {cls.subject}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Weeks
                    </div>
                    <div style={{ color: colors.text, fontSize: '13px', fontWeight: '500' }}>
                      {cls.weeks?.length || 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Enrolled
                    </div>
                    <div style={{ color: colors.text, fontSize: '13px', fontWeight: '500' }}>
                      {cls._count?.enrollments || 0}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunitiesTab({ org }: { org: any }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id || !org.slug) return;

    const fetchCommunities = async () => {
      try {
        const res = await fetch(`/api/organizations/${org.slug}/communities`, {
          headers: { 'User-Id': session?.user?.id || '' },
        });

        if (res.ok) {
          const data = await res.json();
          setCommunities(data.communities || []);
        }
      } catch (err) {
        console.error('Failed to fetch communities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [session?.user?.id, org.slug]);

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading communities...</div>;
  }

  if (communities.length === 0) {
    return (
      <div>
        <h2 style={{ color: colors.text, marginBottom: '1rem', fontSize: '20px', fontWeight: '600' }}>Communities</h2>
        <p style={{ color: colors.text2 }}>No communities in this organization yet.</p>
      </div>
    );
  }

  const difficultyColors: { [key: string]: string } = {
    beginner: '#10b981',
    intermediate: '#f59e0b',
    advanced: '#ef4444',
  };

  return (
    <div>
      <h2 style={{ color: colors.text, marginBottom: '1.5rem', fontSize: '20px', fontWeight: '600' }}>Communities</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {communities.map((community) => (
          <div
            key={community.id}
            onClick={() => router.push(`/organization/${org.slug}/community/${community.slug}`)}
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '1.5rem',
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
            <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '0.5rem' }}>
              {community.name}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span
                style={{
                  backgroundColor: difficultyColors[community.difficulty?.toLowerCase()] || colors.text2,
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                }}
              >
                {community.difficulty || 'Unknown'}
              </span>
            </div>

            <div style={{ fontSize: '12px', color: colors.teal.accent, fontWeight: '600' }}>
              View Community →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PeopleTab({ org, onSwitchTab, onAddClick }: { org: any; onSwitchTab?: (tab: string) => void; onAddClick?: () => void }) {
  const { data: session } = useSession();
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchPeople = async () => {
    if (!session?.user?.id || !org.slug) return;

    try {
      const res = await fetch(`/api/organizations/${org.slug}/users`, {
        headers: { 'User-Id': session?.user?.id || '' },
      });

      if (res.ok) {
        const data = await res.json();
        setPeople(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch organization members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.user?.id || !org.slug) return;
    fetchPeople();
  }, [session?.user?.id, org.slug, refreshKey]);

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading members...</div>;
  }

  const filteredPeople = selectedRole === 'all'
    ? people
    : people.filter((person) => person.organizationRole === selectedRole);

  const roles = ['SuperAdmin', 'Teacher', 'Student', 'Admin'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', margin: 0 }}>
          Organization Members ({filteredPeople.length})
        </h2>
        <button
          onClick={onAddClick}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: colors.teal.accent,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
          }}
        >
          + Add People
        </button>
      </div>

      {/* Role Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedRole('all')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: selectedRole === 'all' ? colors.teal.bg : colors.surface,
            color: selectedRole === 'all' ? 'white' : colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '13px',
            transition: 'all 0.2s',
          }}
        >
          All
        </button>
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: selectedRole === role ? colors.teal.bg : colors.surface,
              color: selectedRole === role ? 'white' : colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '13px',
              transition: 'all 0.2s',
            }}
          >
            {role}
          </button>
        ))}
      </div>

      {filteredPeople.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filteredPeople.map((person) => (
            <div
              key={person.id}
              onClick={() => setSelectedPerson(person)}
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.teal.accent;
                e.currentTarget.style.boxShadow = `0 4px 12px rgba(0, 0, 0, 0.1)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Name
                </div>
                <div style={{ color: colors.text, fontSize: '14px', fontWeight: '600' }}>
                  {person.name}
                </div>
              </div>

              <div>
                <div style={{ color: colors.text2, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Email
                </div>
                <div style={{ color: colors.text, fontSize: '13px' }}>
                  {person.email}
                </div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ color: colors.teal.accent, fontSize: '12px', fontWeight: '600' }}>
                  Click to view profile →
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          backgroundColor: colors.bg,
          border: `1px dashed ${colors.border}`,
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <p style={{ color: colors.text2 }}>No members in this organization yet.</p>
        </div>
      )}

      {selectedPerson && (
        <PeopleDetailModal
          person={selectedPerson}
          org={org}
          onClose={() => setSelectedPerson(null)}
          onConversationCreated={() => {
            setSelectedPerson(null);
            onSwitchTab?.('messages');
          }}
          onRoleChanged={() => {
            setRefreshKey((prev) => prev + 1);
            setSelectedPerson(null);
          }}
        />
      )}
    </div>
  );
}

function PeopleDetailModal({ person, org, onClose, onConversationCreated, onRoleChanged }: { person: any; org: any; onClose: () => void; onConversationCreated?: () => void; onRoleChanged?: () => void }) {
  const { data: session } = useSession();
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [role, setRole] = useState(person.organizationRole || 'Student');
  const [changingRole, setChangingRole] = useState(false);

  useEffect(() => {
    // Load notes from localStorage (for now, until we add a proper backend)
    const savedNotes = localStorage.getItem(`person-notes-${person.id}`);
    if (savedNotes) {
      setNotes(savedNotes);
    }
    setLoadingNotes(false);
  }, [person.id]);

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      // Save to localStorage for now
      localStorage.setItem(`person-notes-${person.id}`, notes);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChangeRole = async () => {
    if (role === person.organizationRole) {
      return; // No change
    }

    setChangingRole(true);
    try {
      const res = await fetch(`/api/organizations/${org.slug}/members/${person.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Error: ${error.error || 'Failed to update role'}`);
        setRole(person.organizationRole);
      } else {
        alert('Role updated successfully');
        onRoleChanged?.();
      }
    } catch (err) {
      console.error('Failed to update role:', err);
      alert('Failed to update role');
      setRole(person.organizationRole);
    } finally {
      setChangingRole(false);
    }
  };

  const handleMessage = async () => {
    try {
      // Create or get direct conversation with this person
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'direct',
          participantIds: [person.id],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onConversationCreated?.();
      } else {
        const error = await res.json();
        console.error('Conversation creation error:', error);
        alert(`Error: ${error.details || error.error || 'Failed to start conversation'}`);
      }
    } catch (err) {
      console.error('Failed to start conversation:', err);
      alert('Failed to start conversation: ' + (err as any).message);
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
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ color: colors.text, fontSize: '24px', fontWeight: '700', margin: 0 }}>
              {person.name}
            </h2>
            <p style={{ color: colors.text2, fontSize: '14px', margin: '0.5rem 0 0 0' }}>
              {person.email}
            </p>
          </div>
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

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleMessage}
            style={{
              padding: '10px 16px',
              backgroundColor: colors.teal.bg,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
            }}
          >
            Send Message
          </button>
        </div>

        {/* Role Management */}
        <div style={{ marginBottom: '2rem', backgroundColor: colors.bg, padding: '1rem', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
          <h3 style={{ color: colors.text, fontSize: '13px', fontWeight: '600', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            Change Role
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={changingRole}
              style={{
                padding: '8px 12px',
                backgroundColor: colors.surface,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '13px',
              }}
            >
              <option value="SuperAdmin">SuperAdmin</option>
              <option value="Teacher">Teacher</option>
              <option value="Student">Student</option>
              <option value="Admin">Admin</option>
            </select>
            <button
              onClick={handleChangeRole}
              disabled={changingRole || role === person.organizationRole}
              style={{
                padding: '8px 16px',
                backgroundColor: role === person.organizationRole ? colors.text3 : colors.teal.accent,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: role === person.organizationRole ? 'default' : 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                opacity: changingRole || role === person.organizationRole ? 0.6 : 1,
              }}
            >
              {changingRole ? 'Updating...' : 'Update Role'}
            </button>
          </div>
        </div>

        {/* Notes Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '600', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            Notes
          </h3>
          {loadingNotes ? (
            <div style={{ color: colors.text2, fontSize: '13px' }}>Loading notes...</div>
          ) : (
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this person..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  backgroundColor: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  color: colors.text,
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={handleSaveNotes}
                disabled={saving}
                style={{
                  marginTop: '0.75rem',
                  padding: '8px 12px',
                  backgroundColor: colors.teal.accent,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          )}
        </div>

        {/* Placeholder sections for future features */}
        <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '2rem' }}>
          <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '600', marginBottom: '1rem', textTransform: 'uppercase' }}>
            Classes & Communities
          </h3>
          <p style={{ color: colors.text2, fontSize: '13px' }}>
            Soon: View classes they teach/attend and communities they're part of
          </p>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '600', marginBottom: '1rem', textTransform: 'uppercase' }}>
            Projects
          </h3>
          <p style={{ color: colors.text2, fontSize: '13px' }}>
            Soon: View and collaborate on projects together
          </p>
        </div>
      </div>
    </div>
  );
}
