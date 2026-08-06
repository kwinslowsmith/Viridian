'use client';

import React, { useState, useMemo } from 'react';
import { StudentMastery, MASTERY_LEVELS, MasteryLevel } from './K12StandardsInterface.types';

interface K12StudentGridProps {
  students: StudentMastery[];
  standardIds: string[];
  standardNames?: Record<string, string>;
  className?: string;
  onCellClick?: (studentId: string, standardId: string, masteryLevel: number) => void;
}

export function K12StudentGrid({
  students,
  standardIds,
  standardNames = {},
  className,
  onCellClick,
}: K12StudentGridProps): React.JSX.Element {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  // Calculate average mastery for each student
  const studentsWithStats = useMemo(() => {
    return students.map((student) => {
      const values = standardIds
        .map((sid) => student.masteryByStandard[sid])
        .filter((v) => v !== undefined && v !== null) as number[];
      const avg =
        values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
      return { ...student, avgMastery: avg };
    });
  }, [students, standardIds]);

  const handleCellClick = (studentId: string, standardId: string) => {
    const masteryLevel = students.find((s) => s.studentId === studentId)
      ?.masteryByStandard[standardId];
    if (masteryLevel !== undefined && masteryLevel !== null) {
      const cellId = `${studentId}-${standardId}`;
      setSelectedCell(cellId);
      if (onCellClick) {
        onCellClick(studentId, standardId, masteryLevel);
      }
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

  const getMasteryLabel = (level: number | undefined): string => {
    if (level === undefined || level === null) {
      return '—';
    }
    const normalized = Math.round(level) as MasteryLevel;
    if (normalized >= 1 && normalized <= 4) {
      return MASTERY_LEVELS[normalized].label;
    }
    return '—';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
          {className ? `${className} — Student Mastery Grid` : 'Student Mastery Grid'}
        </h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '1rem' }}>
          Click any cell to view details. Each color represents a mastery level.
        </p>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '12px' }}>
        {[1, 2, 3, 4].map((level) => (
          <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: MASTERY_LEVELS[level as MasteryLevel].bg,
                border: `2px solid ${MASTERY_LEVELS[level as MasteryLevel].color}`,
                borderRadius: '3px',
              }}
            />
            <span style={{ color: '#333' }}>{MASTERY_LEVELS[level as MasteryLevel].label}</span>
          </div>
        ))}
      </div>

      {/* Grid Container */}
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
            minWidth: standardIds.length > 4 ? '1200px' : '100%',
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
                  minWidth: '150px',
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
                    minWidth: '60px',
                    borderLeft: '1px solid #e0e0e0',
                    writingMode: idx > 5 ? 'vertical-rl' : 'horizontal-tb',
                    transform: idx > 5 ? 'rotate(180deg)' : 'none',
                  }}
                  title={standardNames[standardId] || standardId}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      whiteSpace: 'nowrap',
                      maxWidth: '60px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    S{standardId.split('-')[1]}
                  </div>
                </th>
              ))}
              <th
                style={{
                  padding: '12px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#333',
                  minWidth: '60px',
                  borderLeft: '1px solid #e0e0e0',
                }}
              >
                Avg
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {studentsWithStats.length === 0 ? (
              <tr>
                <td
                  colSpan={standardIds.length + 2}
                  style={{
                    padding: '32px',
                    textAlign: 'center',
                    color: '#999',
                  }}
                >
                  No students found.
                </td>
              </tr>
            ) : (
              studentsWithStats.map((student, studentIdx) => (
                <tr
                  key={student.studentId}
                  style={{
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor:
                      studentIdx % 2 === 0 ? '#fff' : '#fafafa',
                  }}
                >
                  {/* Student Name Cell */}
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
                    title={student.studentName}
                  >
                    <div>
                      <div style={{ fontSize: '13px' }}>{student.studentName}</div>
                      {student.cohort && (
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#999',
                            marginTop: '2px',
                          }}
                        >
                          {student.cohort}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Mastery Cells */}
                  {standardIds.map((standardId) => {
                    const masteryLevel =
                      student.masteryByStandard[standardId];
                    const colors = getCellColor(masteryLevel);
                    const cellId = `${student.studentId}-${standardId}`;
                    const isHovered = hoveredCell === cellId;
                    const isSelected = selectedCell === cellId;

                    return (
                      <td
                        key={standardId}
                        style={{
                          padding: '8px',
                          textAlign: 'center',
                          borderLeft: '1px solid #e0e0e0',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <div
                          onMouseEnter={() => setHoveredCell(cellId)}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => handleCellClick(student.studentId, standardId)}
                          style={{
                            padding: '6px',
                            backgroundColor: colors.bg,
                            borderRadius: '4px',
                            color: colors.text,
                            fontWeight: isSelected || isHovered ? '700' : '600',
                            fontSize: '13px',
                            border: isSelected
                              ? `2px solid ${colors.text}`
                              : `1px solid ${colors.text}33`,
                            transition: 'all 0.15s',
                            transform:
                              isHovered || isSelected
                                ? 'scale(1.05)'
                                : 'scale(1)',
                            boxShadow:
                              isSelected
                                ? `0 0 0 2px ${colors.text}33`
                                : 'none',
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`${student.studentName} - ${standardNames[standardId] || standardId}: ${getMasteryLabel(masteryLevel)}`}
                        >
                          {Math.round(masteryLevel || 0) || '—'}
                        </div>
                      </td>
                    );
                  })}

                  {/* Average Cell */}
                  <td
                    style={{
                      padding: '8px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#333',
                      borderLeft: '1px solid #ddd',
                      backgroundColor:
                        studentIdx % 2 === 0
                          ? '#f0f0f0'
                          : '#eeeeee',
                    }}
                  >
                    {student.avgMastery.toFixed(1)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div style={{ fontSize: '13px', color: '#666' }}>
        <p>
          Showing {studentsWithStats.length} students across{' '}
          {standardIds.length} standards
        </p>
      </div>
    </div>
  );
}
