'use client';

import { useState, useEffect } from 'react';
import { colors } from '@/app/modules/improv/design/colors';

interface Day {
  id: string;
  date: Date;
  dayOfWeek: number;
  title?: string;
  homework?: string;
  type: string;
  isMajor: boolean;
}

interface ClassScheduleManagerProps {
  classId: string;
  classType: 'improv' | 'k12';
  orgSlug: string;
  userRole: string;
  onDayEdit?: (day: Day) => void;
}

export function ClassScheduleManager({
  classId,
  classType,
  orgSlug,
  userRole,
  onDayEdit,
}: ClassScheduleManagerProps) {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);

  const isTeacher = userRole === 'Teacher' || userRole === 'SuperAdmin';

  useEffect(() => {
    fetchDays();
  }, [classId, currentDate]);

  const fetchDays = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const res = await fetch(
        `/api/classes/${classType}/${classId}/days?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`
      );

      if (res.ok) {
        const data = await res.json();
        setDays(
          data.days.map((d: any) => ({
            ...d,
            date: new Date(d.date),
          }))
        );
      }
    } catch (err) {
      console.error('Failed to fetch days:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDayForDate = (date: Date) => {
    return days.find(
      (d) =>
        d.date.getFullYear() === date.getFullYear() &&
        d.date.getMonth() === date.getMonth() &&
        d.date.getDate() === date.getDate()
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Month view
  if (viewMode === 'month') {
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

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
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
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setViewMode('week')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: colors.surface,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Week View
            </button>
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
        </div>

        {/* Day names header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '1rem' }}>
          {dayNames.map((name) => (
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
              const day = date ? getDayForDate(date) : null;
              const isToday =
                date &&
                date.getFullYear() === new Date().getFullYear() &&
                date.getMonth() === new Date().getMonth() &&
                date.getDate() === new Date().getDate();

              return (
                <div
                  key={`${weekIdx}-${dayIdx}`}
                  onClick={() => date && isTeacher && setSelectedDay(day || { date, dayOfWeek: date.getDay(), type: 'lesson', isMajor: false, id: '', title: '', homework: '' })}
                  style={{
                    minHeight: '100px',
                    padding: '0.5rem',
                    backgroundColor: isToday ? colors.teal.bg : colors.surface,
                    borderTop: `1px solid ${colors.border}`,
                    cursor: isTeacher ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (isTeacher) {
                      e.currentTarget.style.backgroundColor = colors.developing.bg;
                      e.currentTarget.style.boxShadow = `inset 0 0 0 2px ${colors.teal.accent}`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isToday ? colors.teal.bg : colors.surface;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {date && (
                    <>
                      <div style={{ color: colors.text2, fontSize: '12px', fontWeight: '600', marginBottom: '0.25rem' }}>
                        {date.getDate()}
                      </div>
                      {day && (
                        <div style={{ fontSize: '12px' }}>
                          <div
                            style={{
                              color: colors.text,
                              fontWeight: '500',
                              marginBottom: '0.25rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {day.title}
                          </div>
                          {day.isMajor && (
                            <div
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
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Day editor modal */}
        {selectedDay && isTeacher && (
          <DayEditorModal
            day={selectedDay}
            classId={classId}
            classType={classType}
            onClose={() => setSelectedDay(null)}
            onSave={() => {
              setSelectedDay(null);
              fetchDays();
            }}
          />
        )}
      </div>
    );
  }

  // Week view placeholder
  return (
    <div>
      <button
        onClick={() => setViewMode('month')}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: colors.teal.accent,
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '1rem',
        }}
      >
        Month View
      </button>
      <p style={{ color: colors.text2 }}>Week view coming soon</p>
    </div>
  );
}

interface DayEditorModalProps {
  day: Day;
  classId: string;
  classType: 'improv' | 'k12';
  onClose: () => void;
  onSave: () => void;
}

function DayEditorModal({ day, classId, classType, onClose, onSave }: DayEditorModalProps) {
  const [title, setTitle] = useState(day.title || '');
  const [homework, setHomework] = useState(day.homework || '');
  const [isMajor, setIsMajor] = useState(day.isMajor);
  const [googleDocUrl, setGoogleDocUrl] = useState(day.googleDocUrl || '');
  const [pdfFileName, setPdfFileName] = useState(day.pdfFileName || '');
  const [pdfFileKey, setPdfFileKey] = useState(day.pdfFileKey || '');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPdfFileKey(data.fileKey);
        setPdfFileName(file.name);
      }
    } catch (err) {
      console.error('Failed to upload PDF:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      const method = day.id ? 'PUT' : 'POST';
      const endpoint = day.id
        ? `/api/classes/${classType}/${classId}/days/${day.id}`
        : `/api/classes/${classType}/${classId}/days`;

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: day.date.toISOString(),
          dayOfWeek: day.dayOfWeek,
          title,
          homework,
          isMajor,
          type: day.type,
          googleDocUrl,
          pdfFileKey,
          pdfFileName,
        }),
      });

      if (res.ok) {
        onSave();
      } else {
        const errData = await res.json();
        setError(errData.error || `Failed to save (${res.status})`);
        console.error('Save failed:', errData);
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Failed to save day:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
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
      onClick={onClose}
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
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: colors.text, marginTop: 0 }}>
          {day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: colors.text, fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
            Topic/Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Unit 2: Critical Thinking"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box',
              color: colors.text,
              backgroundColor: colors.bg,
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: colors.text, fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
            Homework/Assignment
          </label>
          <textarea
            value={homework}
            onChange={(e) => setHomework(e.target.value)}
            placeholder="e.g., Read Chapter 5, Answer discussion questions"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              fontSize: '14px',
              minHeight: '100px',
              boxSizing: 'border-box',
              color: colors.text,
              backgroundColor: colors.bg,
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: colors.text, fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
            Google Doc (embed URL)
          </label>
          <input
            type="url"
            value={googleDocUrl}
            onChange={(e) => setGoogleDocUrl(e.target.value)}
            placeholder="https://docs.google.com/document/d/..."
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box',
              color: colors.text,
              backgroundColor: colors.bg,
            }}
          />
          <p style={{ color: colors.text2, fontSize: '12px', margin: '0.5rem 0 0 0' }}>
            Make sure sharing is enabled and link is set to "Anyone with link can view"
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: colors.text, fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
            PDF File
          </label>
          {pdfFileName ? (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: colors.developing.bg,
                border: `1px solid ${colors.developing.accent}`,
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: colors.text, fontSize: '14px' }}>✓ {pdfFileName}</span>
              <button
                onClick={() => {
                  setPdfFileKey('');
                  setPdfFileName('');
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: colors.text2,
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <label
              style={{
                display: 'block',
                padding: '1rem',
                border: `2px dashed ${colors.border}`,
                borderRadius: '6px',
                textAlign: 'center',
                cursor: uploading ? 'not-allowed' : 'pointer',
                backgroundColor: colors.bg,
              }}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              <span style={{ color: colors.text2, fontSize: '14px' }}>
                {uploading ? 'Uploading...' : 'Click to upload PDF'}
              </span>
            </label>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="checkbox"
            id="isMajor"
            checked={isMajor}
            onChange={(e) => setIsMajor(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <label htmlFor="isMajor" style={{ color: colors.text, cursor: 'pointer' }}>
            Mark as major assignment (shows on all student calendars)
          </label>
        </div>

        {error && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '0.75rem',
              backgroundColor: colors.critical.bg,
              border: `1px solid ${colors.critical.accent}`,
              borderRadius: '6px',
              color: colors.critical.accent,
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: colors.teal.accent,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
