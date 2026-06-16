'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { colors } from '@/app/modules/improv/design/colors';

interface EnrolledClass {
  classId: string;
  classType: 'k12' | 'improv';
  className: string;
  isVisible: boolean;
}

interface CalendarItem {
  id: string;
  type: string;
  date: string;
  title: string;
  description?: string;
  classId?: string;
  className?: string;
  homework?: string;
  isMajor?: boolean;
}

export default function StudentCalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [enrolledClasses, setEnrolledClasses] = useState<EnrolledClass[]>([]);
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<CalendarItem[] | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchPreferences();
      fetchCalendarItems();
    }
  }, [session?.user?.id, currentDate]);

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/student-calendar/preferences');
      if (res.ok) {
        const data = await res.json();
        setEnrolledClasses(data.enrolledClasses);
      }
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    }
  };

  const fetchCalendarItems = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const res = await fetch(
        `/api/student-calendar?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`,
        {
          headers: {
            'User-Id': session?.user?.id || '',
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setCalendarItems(data.items);
      }
    } catch (err) {
      console.error('Failed to fetch calendar items:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleClass = async (classId: string, currentVisibility: boolean) => {
    try {
      const res = await fetch('/api/student-calendar/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, isVisible: !currentVisibility }),
      });

      if (res.ok) {
        setEnrolledClasses(prev =>
          prev.map(c => (c.classId === classId ? { ...c, isVisible: !c.isVisible } : c))
        );
        fetchCalendarItems();
      }
    } catch (err) {
      console.error('Failed to toggle class:', err);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  if (status === 'loading') {
    return <div style={{ padding: '2rem', color: colors.text }}>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  // Build calendar grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(year, month, i));
  }

  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const getDayItems = (date: Date) => {
    return calendarItems.filter(item => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getFullYear() === date.getFullYear() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getDate() === date.getDate()
      );
    });
  };

  const getClassColor = (classId?: string) => {
    const classIndex = enrolledClasses.findIndex(c => c.classId === classId);
    const hues = [220, 150, 30, 280, 160];
    const hue = hues[classIndex % hues.length];
    return `hsl(${hue}, 70%, 50%)`;
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem', backgroundColor: colors.bg, minHeight: '100vh' }}>
      {/* Left sidebar - class toggles */}
      <div style={{ width: '200px', flexShrink: 0 }}>
        <h3 style={{ color: colors.text, marginTop: 0 }}>My Classes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {enrolledClasses.map(klass => (
            <label
              key={klass.classId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '6px',
                backgroundColor: klass.isVisible ? colors.developing.bg : 'transparent',
                transition: 'background-color 0.2s',
              }}
            >
              <input
                type="checkbox"
                checked={klass.isVisible}
                onChange={() => toggleClass(klass.classId, klass.isVisible)}
                style={{ cursor: 'pointer' }}
              />
              <span
                style={{
                  color: colors.text,
                  fontSize: '14px',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {klass.className}
              </span>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: getClassColor(klass.classId),
                  borderRadius: '2px',
                  flexShrink: 0,
                }}
              />
            </label>
          ))}
        </div>

        {/* Major assignments note */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: colors.approaching.bg,
            borderRadius: '6px',
            borderLeft: `4px solid ${colors.approaching.accent}`,
          }}
        >
          <p
            style={{
              color: colors.approaching.text,
              fontSize: '12px',
              margin: 0,
              lineHeight: '1.4',
            }}
          >
            <strong>💡</strong> Major assignments show even if the class is toggled off
          </p>
        </div>
      </div>

      {/* Calendar */}
      <div style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button
            onClick={goToPreviousMonth}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: colors.teal.accent,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            ← Previous
          </button>
          <h2 style={{ color: colors.text, margin: 0 }}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={goToNextMonth}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: colors.teal.accent,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Next →
          </button>
        </div>

        {/* Day names header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '1rem' }}>
          {dayNames.map(name => (
            <div
              key={name}
              style={{
                padding: '0.75rem',
                backgroundColor: colors.surface,
                color: colors.text,
                fontWeight: '600',
                textAlign: 'center',
                borderBottom: `2px solid ${colors.border}`,
              }}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: colors.border }}>
          {weeks.map((week, weekIdx) =>
            week.map((date, dayIdx) => {
              const dayItems = date ? getDayItems(date) : [];
              const isToday =
                date &&
                date.getFullYear() === new Date().getFullYear() &&
                date.getMonth() === new Date().getMonth() &&
                date.getDate() === new Date().getDate();

              return (
                <div
                  key={`${weekIdx}-${dayIdx}`}
                  onClick={() => date && dayItems.length > 0 && setSelectedDay(dayItems)}
                  style={{
                    minHeight: '120px',
                    padding: '0.5rem',
                    backgroundColor: isToday ? colors.teal.bg : colors.surface,
                    borderTop: `1px solid ${colors.border}`,
                    cursor: dayItems.length > 0 ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (dayItems.length > 0) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = colors.developing.bg;
                      (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 0 0 2px ${colors.teal.accent}`;
                    }
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = isToday ? colors.teal.bg : colors.surface;
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  {date && (
                    <>
                      <div style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', marginBottom: '0.25rem' }}>
                        {date.getDate()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {dayItems.slice(0, 3).map(item => (
                          <div
                            key={item.id}
                            style={{
                              fontSize: '11px',
                              padding: '2px 4px',
                              backgroundColor: getClassColor(item.classId),
                              color: 'white',
                              borderRadius: '3px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              opacity: item.isMajor ? 1 : 0.8,
                              fontWeight: item.isMajor ? '600' : '500',
                            }}
                            title={item.title}
                          >
                            {item.isMajor && '📌 '}
                            {item.title}
                          </div>
                        ))}
                        {dayItems.length > 3 && (
                          <div style={{ fontSize: '10px', color: colors.text2, paddingLeft: '4px' }}>
                            +{dayItems.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Day detail modal */}
      {selectedDay && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedDay(null)}
        >
          <div
            style={{
              backgroundColor: colors.surface,
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              border: `1px solid ${colors.border}`,
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ color: colors.text, marginTop: 0 }}>
              {new Date(selectedDay[0].date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {selectedDay.map(item => (
                <div
                  key={item.id}
                  style={{
                    paddingBottom: '1.5rem',
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: getClassColor(item.classId),
                        borderRadius: '2px',
                      }}
                    />
                    <h3 style={{ color: colors.text, margin: 0, fontSize: '16px' }}>{item.title}</h3>
                    {item.isMajor && (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: colors.approaching.bg,
                          color: colors.approaching.accent,
                          borderRadius: '3px',
                          fontSize: '10px',
                          fontWeight: '600',
                        }}
                      >
                        MAJOR
                      </span>
                    )}
                  </div>
                  <p style={{ color: colors.text2, fontSize: '14px', margin: '0.5rem 0 0 0' }}>
                    {item.className}
                  </p>

                  {item.description && (
                    <p style={{ color: colors.text, fontSize: '14px', margin: '0.75rem 0 0 0' }}>
                      {item.description}
                    </p>
                  )}

                  {item.homework && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <p style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                        Homework:
                      </p>
                      <p style={{ color: colors.text, fontSize: '14px', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {item.homework}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: colors.teal.accent,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                marginTop: '1rem',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
