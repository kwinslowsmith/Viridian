'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/app/modules/improv/design/colors';

interface Objective {
  id: string;
  label: string;
  text: string;
}

interface Standard {
  standardId: string;
  standardCode: string;
  standardName: string;
  objectives: Objective[];
}

interface AssessmentState {
  [objectiveId: string]: 'approaching' | 'developing' | 'proficient' | null;
}

interface StudentSelfAssessmentProps {
  classId: string;
  className: string;
  studentId: string;
}

const levelColors = {
  approaching: '#EF9F27',
  developing: '#1D4ED8',
  proficient: '#4DAB7E',
};

export function StudentSelfAssessment({
  classId,
  className,
  studentId,
}: StudentSelfAssessmentProps) {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assessments, setAssessments] = useState<AssessmentState>({});

  useEffect(() => {
    fetchAssessment();
  }, [classId, studentId]);

  const fetchAssessment = async () => {
    try {
      const res = await fetch(
        `/api/student/classes/${classId}/self-assessment?studentId=${studentId}`
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStandards(data.standards || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch assessment:', err);
      setLoading(false);
    }
  };

  const setAssessmentLevel = (
    objectiveId: string,
    level: 'approaching' | 'developing' | 'proficient'
  ) => {
    setAssessments({
      ...assessments,
      [objectiveId]: assessments[objectiveId] === level ? null : level,
    });
  };

  const saveAssessments = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/student/classes/${classId}/self-assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          assessments,
        }),
      });

      if (res.ok) {
        alert('Your self-assessment has been saved!');
      }
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ color: colors.text }}>Loading objectives...</div>;
  }

  const totalObjectives = standards.reduce(
    (sum, s) => sum + s.objectives.length,
    0
  );
  const ratedObjectives = Object.values(assessments).filter((v) => v !== null).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
          Self-Assessment: {className}
        </h2>
        <p style={{ color: colors.text2 }}>
          Rate yourself on each objective. {ratedObjectives} of {totalObjectives}{' '}
          completed.
        </p>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 rounded-full"
        style={{ backgroundColor: colors.surface }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            backgroundColor: colors.teal.accent,
            width: `${totalObjectives > 0 ? (ratedObjectives / totalObjectives) * 100 : 0}%`,
          }}
        />
      </div>

      {standards.map((standard) => (
        <div key={standard.standardId} className="space-y-3">
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
          >
            <h3 className="font-bold text-lg" style={{ color: colors.text }}>
              {standard.standardCode}: {standard.standardName}
            </h3>
          </div>

          <div className="space-y-4 ml-4">
            {standard.objectives.map((obj) => {
              const level = assessments[obj.id];

              return (
                <div
                  key={obj.id}
                  className="p-4 rounded border space-y-3"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor:
                      level && levelColors[level]
                        ? levelColors[level]
                        : colors.border,
                    borderWidth: level ? '2px' : '1px',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{ backgroundColor: colors.teal.bg, color: colors.text }}
                      >
                        {obj.label}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: colors.text }}>
                        {obj.text}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    {(['approaching', 'developing', 'proficient'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setAssessmentLevel(obj.id, lvl)}
                        className="px-3 py-2 rounded font-semibold text-sm transition-all"
                        style={{
                          backgroundColor:
                            level === lvl
                              ? levelColors[lvl]
                              : colors.surface,
                          color: level === lvl ? '#fff' : colors.text,
                          border: `1px solid ${
                            level === lvl ? levelColors[lvl] : colors.border
                          }`,
                        }}
                      >
                        {lvl === 'approaching' && '◎ Approaching'}
                        {lvl === 'developing' && '◐ Developing'}
                        {lvl === 'proficient' && '✓ Proficient'}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {ratedObjectives > 0 && (
        <div className="flex gap-3 p-4 rounded-lg sticky bottom-4" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
          <button
            onClick={saveAssessments}
            disabled={saving}
            className="flex-1 px-4 py-3 rounded font-semibold text-white"
            style={{ backgroundColor: colors.teal.accent }}
          >
            {saving ? 'Saving...' : 'Submit Self-Assessment'}
          </button>
        </div>
      )}
    </div>
  );
}
