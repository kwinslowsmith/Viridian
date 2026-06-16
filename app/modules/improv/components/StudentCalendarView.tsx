'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/app/modules/improv/design/colors';

interface Objective {
  id: string;
  label: string;
  text: string;
  standardName: string;
  standardCode: string;
}

interface Week {
  weekNumber: number;
  startDate: string;
  endDate: string;
  skills: Array<{ skillId: string; skillName: string }>;
}

interface StudentCalendarViewProps {
  classId: string;
  studentId: string;
}

export function StudentCalendarView({
  classId,
  studentId,
}: StudentCalendarViewProps) {
  const [className, setClassName] = useState('');
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  useEffect(() => {
    fetchCalendar();
  }, [classId, studentId]);

  const fetchCalendar = async () => {
    try {
      const res = await fetch(
        `/api/student/classes/${classId}/calendar?studentId=${studentId}`
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setClassName(data.className);
      setWeeks(data.weeks || []);
      setObjectives(data.objectives || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch calendar:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: colors.text }}>Loading calendar...</div>;
  }

  const currentWeek = weeks.find((w) => w.weekNumber === selectedWeek);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
          Learning Calendar: {className}
        </h2>
        <p style={{ color: colors.text2 }}>
          Track your objectives throughout the class
        </p>
      </div>

      {/* Week selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {weeks.map((week) => (
          <button
            key={week.weekNumber}
            onClick={() => setSelectedWeek(week.weekNumber)}
            className="px-4 py-2 rounded font-semibold whitespace-nowrap transition-all"
            style={{
              backgroundColor:
                selectedWeek === week.weekNumber
                  ? colors.teal.bg
                  : colors.surface,
              color:
                selectedWeek === week.weekNumber
                  ? colors.text
                  : colors.text2,
              border: `1px solid ${colors.border}`,
            }}
          >
            Week {week.weekNumber}
          </button>
        ))}
      </div>

      {/* Current week details */}
      {currentWeek && (
        <div
          className="p-4 rounded-lg space-y-3"
          style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
        >
          <div>
            <h3 className="font-bold" style={{ color: colors.text }}>
              Week {currentWeek.weekNumber}
            </h3>
            <p className="text-sm" style={{ color: colors.text2 }}>
              {new Date(currentWeek.startDate).toLocaleDateString()} —{' '}
              {new Date(currentWeek.endDate).toLocaleDateString()}
            </p>
          </div>

          {currentWeek.skills.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text2 }}>
                Focus Areas:
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentWeek.skills.map((skill) => (
                  <span
                    key={skill.skillId}
                    className="px-3 py-1 rounded text-sm font-semibold"
                    style={{
                      backgroundColor: colors.teal.bg,
                      color: colors.text,
                    }}
                  >
                    {skill.skillName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Objectives for current week */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg" style={{ color: colors.text }}>
          Objectives to Work On
        </h3>

        {objectives.length === 0 ? (
          <div
            className="p-4 rounded text-center"
            style={{ backgroundColor: colors.surface, color: colors.text2 }}
          >
            No objectives assigned yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {objectives.map((obj) => (
              <div
                key={obj.id}
                className="p-4 rounded border space-y-2"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs"
                    style={{ backgroundColor: colors.teal.bg, color: colors.text }}
                  >
                    {obj.label}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: colors.text }}>
                      {obj.text}
                    </p>
                    <p className="text-xs mt-1" style={{ color: colors.text2 }}>
                      {obj.standardCode} • {obj.standardName}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All objectives reference */}
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
      >
        <h4 className="font-semibold mb-2" style={{ color: colors.text }}>
          All Learning Objectives
        </h4>
        <div className="space-y-2">
          {objectives.map((obj) => (
            <div
              key={obj.id}
              className="text-sm flex items-start gap-2"
              style={{ color: colors.text }}
            >
              <span className="font-bold flex-shrink-0">{obj.label}.</span>
              <span>{obj.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
