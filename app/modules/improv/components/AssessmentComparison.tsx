'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/app/modules/improv/design/colors';

interface Objective {
  id: string;
  label: string;
  text: string;
  studentRating: string | null;
  teacherRating: string | null;
}

interface Standard {
  standardId: string;
  standardCode: string;
  standardName: string;
  objectives: Objective[];
}

interface AssessmentComparisonProps {
  classId: string;
  studentId: string;
}

const getLevelColor = (level: string | null) => {
  switch (level) {
    case 'approaching':
      return '#EF9F27';
    case 'developing':
      return '#1D4ED8';
    case 'proficient':
      return '#4DAB7E';
    default:
      return '#ccc';
  }
};

const getLevelLabel = (level: string | null) => {
  switch (level) {
    case 'approaching':
      return '◎ Approaching';
    case 'developing':
      return '◐ Developing';
    case 'proficient':
      return '✓ Proficient';
    default:
      return '○ Not Rated';
  }
};

export function AssessmentComparison({
  classId,
  studentId,
}: AssessmentComparisonProps) {
  const [className, setClassName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparison();
  }, [classId, studentId]);

  const fetchComparison = async () => {
    try {
      const res = await fetch(
        `/api/teacher/students/${studentId}/assessment-comparison?classId=${classId}`
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setClassName(data.className);
      setStudentName(data.studentName);
      setStandards(data.standards || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch comparison:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: colors.text }}>Loading assessment comparison...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
          Assessment Comparison
        </h2>
        <p style={{ color: colors.text2 }}>
          {studentName} in {className}
        </p>
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
            {standard.objectives.map((obj) => (
              <div
                key={obj.id}
                className="p-4 rounded border space-y-3"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
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

                <div className="grid grid-cols-2 gap-4">
                  {/* Student Assessment */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold" style={{ color: colors.text2 }}>
                      Student Rate
                    </p>
                    <div
                      className="p-3 rounded text-center font-semibold"
                      style={{
                        backgroundColor: getLevelColor(obj.studentRating),
                        color: obj.studentRating ? '#fff' : colors.text,
                      }}
                    >
                      {getLevelLabel(obj.studentRating)}
                    </div>
                  </div>

                  {/* Teacher Assessment */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold" style={{ color: colors.text2 }}>
                      Your Rating
                    </p>
                    <div
                      className="p-3 rounded text-center font-semibold"
                      style={{
                        backgroundColor: getLevelColor(obj.teacherRating),
                        color: obj.teacherRating ? '#fff' : colors.text,
                      }}
                    >
                      {getLevelLabel(obj.teacherRating)}
                    </div>
                  </div>
                </div>

                {/* Alignment indicator */}
                {obj.studentRating && obj.teacherRating && (
                  <div
                    className="p-2 rounded text-sm text-center"
                    style={{
                      backgroundColor:
                        obj.studentRating === obj.teacherRating ? '#E8F5EF' : '#FFF3E0',
                      color:
                        obj.studentRating === obj.teacherRating ? '#0F4C35' : '#BA7517',
                    }}
                  >
                    {obj.studentRating === obj.teacherRating
                      ? '✓ Aligned'
                      : '⚠ Different assessment'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
