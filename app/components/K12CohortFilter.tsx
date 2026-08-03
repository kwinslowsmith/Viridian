'use client';

import React, { useState, useMemo } from 'react';
import { StudentMastery, CohortGroup, MASTERY_LEVELS, MasteryLevel } from './K12StandardsInterface.types';

interface K12CohortFilterProps {
  cohorts: CohortGroup[];
  students: StudentMastery[];
  standardIds: string[];
  standardNames?: Record<string, string>;
  onSelectCohort?: (cohortId: string) => void;
}

export function K12CohortFilter({
  cohorts,
  students,
  standardIds,
  standardNames = {},
  onSelectCohort,
}: K12CohortFilterProps): JSX.Element {
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(
    cohorts.length > 0 ? cohorts[0].id : null
  );
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const selectedCohort = cohorts.find((c) => c.id === selectedCohortId);

  // Filter students by selected cohort
  const cohortStudents = useMemo(() => {
    if (!selectedCohort) return [];
    return students.filter((s) => {
      const cohortMatch = s.cohort === selectedCohort.name || s.cohort === selectedCohort.id;
      return cohortMatch;
    });
  }, [students, selectedCohort]);

  // Calculate cohort stats
  const cohortStats = useMemo(() => {
    if (cohortStudents.length === 0) {
      return { avgMastery: 0, totalAssessed: 0 };
    }

    let totalMastery = 0;
    let assessmentCount = 0;

    cohortStudents.forEach((student) => {
      standardIds.forEach((stdId) => {
        const level = student.masteryByStandard[stdId];
        if (level !== undefined && level !== null) {
          totalMastery += level;
          assessmentCount += 1;
        }
      });
    });

    return {
      avgMastery:
        assessmentCount > 0 ? totalMastery / assessmentCount : 0,
      totalAssessed: assessmentCount,
    };
  }, [cohortStudents, standardIds]);

  const handleCohortSelect = (cohortId: string) => {
    setSelectedCohortId(cohortId);
    if (onSelectCohort) {
      onSelectCohort(cohortId);
    }
  };

  const getCellColor = (masteryLevel: number | undefined): { bg: string; text: string } => {
    if (masteryLevel === undefined || masteryLevel === null) {
      return { bg: '#f5f5f5', text: '#999' };
    }
    const normalized = Math.round(masteryLevel) as MasteryLevel;
    if (normalized >= 1 && normalized <= 4) {
      return {
        bg: MASTERY_LEVELS[normalized].bg,
        text: MASTERY_LEVELS[normalized].color,
      };
    }
    return { bg: '#f5f5f5', text: '#999' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
          Student Cohorts
        </h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '1rem' }}>
          Filter and view mastery by student subgroups
        </p>
      </div>

      {/* Cohort Selector */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {cohorts.map((cohort) => {
          const isSelected = selectedCohortId === cohort.id;
          return (
            <button
              key={cohort.id}
              onClick={() => handleCohortSelect(cohort.id)}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                backgroundColor: isSelected ? '#1e88e5' : '#e0e0e0',
                color: isSelected ? '#fff' : '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s',
                boxShadow: isSelected ? '0 2px 8px rgba(30, 136, 229, 0.3)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#c0c0c0';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#e0e0e0';
                }
              }}
            >
              <div>{cohort.name}</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>
                ({cohort.studentCount})
              </div>
            </button>
          );
        })}
      </div>

      {/* Cohort Stats Card */}
      {selectedCohort && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                Cohort
              </p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                {selectedCohort.name}
              </p>
              {selectedCohort.description && (
                <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  {selectedCohort.description}
                </p>
              )}
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                Students
              </p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                {cohortStudents.length}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                Avg. Mastery
              </p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                {cohortStats.avgMastery.toFixed(2)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                Assessments
              </p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                {cohortStats.totalAssessed}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div
        style={{
          overflowX: 'auto',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          backgroundColor: '#fff',
        }}
      >
        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            minWidth: standardIds.length > 4 ? '1000px' : '100%',
            fontSize: '13px',
          }}
        >
          {/* Table Header */}
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <th
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#333',
                  minWidth: '140px',
                  position: 'sticky',
                  left: 0,
                  backgroundColor: '#f5f5f5',
                  zIndex: 10,
                }}
              >
                Student
              </th>
              {standardIds.map((standardId, idx) => (
                <th
                  key={standardId}
                  style={{
                    padding: '12px 8px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#333',
                    minWidth: '50px',
                    borderLeft: '1px solid #e0e0e0',
                    writingMode: idx > 4 ? 'vertical-rl' : 'horizontal-tb',
                    transform: idx > 4 ? 'rotate(180deg)' : 'none',
                  }}
                  title={standardNames[standardId] || standardId}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      whiteSpace: 'nowrap',
                      maxWidth: '50px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    S{standardId.split('-')[1]}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {cohortStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={standardIds.length + 1}
                  style={{
                    padding: '32px',
                    textAlign: 'center',
                    color: '#999',
                  }}
                >
                  No students in this cohort.
                </td>
              </tr>
            ) : (
              cohortStudents.map((student, studentIdx) => (
                <tr
                  key={student.studentId}
                  style={{
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor:
                      studentIdx % 2 === 0 ? '#fff' : '#fafafa',
                  }}
                >
                  {/* Student Name */}
                  <td
                    style={{
                      padding: '12px',
                      fontWeight: '500',
                      color: '#333',
                      position: 'sticky',
                      left: 0,
                      backgroundColor:
                        studentIdx % 2 === 0 ? '#fff' : '#fafafa',
                      zIndex: 9,
                      borderRight: '1px solid #e0e0e0',
                    }}
                  >
                    {student.studentName}
                  </td>

                  {/* Mastery Cells */}
                  {standardIds.map((standardId) => {
                    const masteryLevel =
                      student.masteryByStandard[standardId];
                    const colors = getCellColor(masteryLevel);
                    const cellId = `${student.studentId}-${standardId}`;
                    const isHovered = hoveredCell === cellId;

                    return (
                      <td
                        key={standardId}
                        style={{
                          padding: '8px',
                          textAlign: 'center',
                          borderLeft: '1px solid #e0e0e0',
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          onMouseEnter={() => setHoveredCell(cellId)}
                          onMouseLeave={() => setHoveredCell(null)}
                          style={{
                            padding: '6px',
                            backgroundColor: colors.bg,
                            borderRadius: '4px',
                            color: colors.text,
                            fontWeight: isHovered ? '700' : '600',
                            fontSize: '12px',
                            border: `1px solid ${colors.text}33`,
                            transition: 'all 0.15s',
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                          }}
                        >
                          {Math.round(masteryLevel || 0) || '—'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div style={{ fontSize: '13px', color: '#666' }}>
        <p>
          Showing {cohortStudents.length} students in "{selectedCohort?.name || 'Selected Cohort'}"
        </p>
      </div>
    </div>
  );
}
