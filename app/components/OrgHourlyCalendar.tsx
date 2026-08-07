'use client';

import { useState, useEffect } from 'react';
import { colors } from '@/app/design/colors';

interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  startTime?: string;
  endTime?: string;
  className?: string;
  createdBy?: { name: string };
}

interface OrgHourlyCalendarProps {
  orgSlug: string;
  userRole?: string;
  userId?: string;
  enrolledClasses?: any[];
  events?: CalendarEvent[];
  onEventDragEnd?: (eventId: string, newTime: string) => void;
}

export function OrgHourlyCalendar({
  orgSlug,
  userRole,
  userId,
  enrolledClasses = [],
  events = [],
  onEventDragEnd,
}: OrgHourlyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    classes: true,
    events: true,
    communities: true,
    interventions: true,
  });

  const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8am-5pm

  const getEventColor = (type: string) => {
    switch (type) {
      case 'class':
        return colors.teal;
      case 'event':
        return colors.amber;
      case 'intervention':
        return colors.developing;
      case 'community':
        return colors.green;
      default:
        return colors.proficient;
    }
  };

  const toggleFilter = (key: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    setDraggedEvent(eventId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    if (draggedEvent && onEventDragEnd) {
      const newTime = `${String(hour).padStart(2, '0')}:00`;
      onEventDragEnd(draggedEvent, newTime);
      setDraggedEvent(null);
    }
  };

  const goToPreviousDay = () => {
    setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000));
  };

  const goToNextDay = () => {
    setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday =
    selectedDate.getFullYear() === new Date().getFullYear() &&
    selectedDate.getMonth() === new Date().getMonth() &&
    selectedDate.getDate() === new Date().getDate();

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={goToPreviousDay}
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
          <h2 style={{ color: colors.text, margin: 0, minWidth: '150px' }}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            {isToday && <span style={{ color: colors.teal.accent, marginLeft: '0.5rem' }}>(Today)</span>}
          </h2>
          <button
            onClick={goToToday}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Today
          </button>
          <button
            onClick={goToNextDay}
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

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', padding: '1rem', backgroundColor: colors.surface, borderRadius: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={filters.classes}
            onChange={() => toggleFilter('classes')}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ color: colors.text, fontSize: '14px' }}>Classes</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={filters.events}
            onChange={() => toggleFilter('events')}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ color: colors.text, fontSize: '14px' }}>Events</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={filters.communities}
            onChange={() => toggleFilter('communities')}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ color: colors.text, fontSize: '14px' }}>Communities</span>
        </label>
        {userRole && ['Admin', 'SuperAdmin'].includes(userRole) && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filters.interventions}
              onChange={() => toggleFilter('interventions')}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ color: colors.text, fontSize: '14px' }}>Interventions</span>
          </label>
        )}
      </div>

      {/* Hourly grid */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <tbody>
            {hours.map(hour => (
              <tr key={hour} style={{ borderBottom: `1px solid ${colors.border}` }}>
                <td
                  style={{
                    padding: '1rem',
                    minWidth: '80px',
                    backgroundColor: colors.bg,
                    fontWeight: '600',
                    color: colors.text,
                    fontSize: '14px',
                  }}
                >
                  {String(hour).padStart(2, '0')}:00
                </td>
                <td
                  style={{
                    padding: '1rem',
                    minHeight: '60px',
                    position: 'relative',
                  }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, hour)}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {/* Render events/classes for this hour */}
                    {/* This would be populated with actual events */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1rem', fontSize: '12px', color: colors.text2 }}>
        💡 Drag events to reschedule them
      </div>
    </div>
  );
}
