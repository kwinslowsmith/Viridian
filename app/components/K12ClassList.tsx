'use client';

import React, { useState } from 'react';
import { Class, MASTERY_LEVELS } from './K12StandardsInterface.types';

interface ClassListProps {
  classes: Class[];
  onSelectClass?: (classData: Class) => void;
  onDrill?: (classId: string) => void;
}

function getMasteryColor(level: number): { bg: string; text: string } {
  const normalized = Math.round(level) as 1 | 2 | 3 | 4;
  if (normalized >= 1 && normalized <= 4) {
    return {
      bg: MASTERY_LEVELS[normalized].bg,
      text: MASTERY_LEVELS[normalized].color,
    };
  }
  return { bg: '#f5f5f5', text: '#999' };
}

export function K12ClassList({
  classes,
  onSelectClass,
  onDrill,
}: ClassListProps): JSX.Element {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'students' | 'mastery'>('name');

  // Sort classes
  const sortedClasses = [...classes].sort((a, b) => {
    switch (sortBy) {
      case 'students':
        return b.studentCount - a.studentCount;
      case 'mastery':
        return b.avgMasteryLevel - a.avgMasteryLevel;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleClassClick = (classData: Class) => {
    if (onSelectClass) {
      onSelectClass(classData);
    }
    if (onDrill) {
      onDrill(classData.id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
          Classes
        </h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '1rem' }}>
          View mastery overview for all classes ({classes.length} total)
        </p>
      </div>

      {/* Sort Options */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
          Sort by:
        </label>
        <button
          onClick={() => setSortBy('name')}
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            backgroundColor: sortBy === 'name' ? '#1e88e5' : '#e0e0e0',
            color: sortBy === 'name' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
        >
          Name
        </button>
        <button
          onClick={() => setSortBy('students')}
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            backgroundColor: sortBy === 'students' ? '#1e88e5' : '#e0e0e0',
            color: sortBy === 'students' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
        >
          Students
        </button>
        <button
          onClick={() => setSortBy('mastery')}
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            backgroundColor: sortBy === 'mastery' ? '#1e88e5' : '#e0e0e0',
            color: sortBy === 'mastery' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
        >
          Avg. Mastery
        </button>
      </div>

      {/* Classes Grid/Table */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
          '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
          },
        } as React.CSSProperties}
      >
        {sortedClasses.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '32px 16px',
              textAlign: 'center',
              color: '#999',
            }}
          >
            No classes found.
          </div>
        ) : (
          sortedClasses.map((classData) => {
            const masteryColor = getMasteryColor(classData.avgMasteryLevel);
            return (
              <div
                key={classData.id}
                onMouseEnter={() => setHoveredRow(classData.id)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => handleClassClick(classData)}
                style={{
                  padding: '16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: hoveredRow === classData.id ? '#f9f9f9' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow:
                    hoveredRow === classData.id
                      ? '0 2px 8px rgba(0,0,0,0.1)'
                      : '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                {/* Class Header */}
                <div style={{ marginBottom: '12px' }}>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '4px',
                    }}
                  >
                    {classData.name}
                  </h3>
                  {classData.departmentName && (
                    <p style={{ fontSize: '12px', color: '#999' }}>
                      {classData.departmentName}
                    </p>
                  )}
                </div>

                {/* Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>Students:</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>
                      {classData.studentCount}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>Standards:</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>
                      {classData.standardCount}
                    </span>
                  </div>
                </div>

                {/* Mastery Badge */}
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: masteryColor.bg,
                    borderRadius: '6px',
                    textAlign: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Avg. Mastery
                  </p>
                  <p
                    style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: masteryColor.text,
                    }}
                  >
                    {classData.avgMasteryLevel.toFixed(1)}
                  </p>
                </div>

                {/* CTA Button */}
                <button
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    backgroundColor: '#1e88e5',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      '#1565c0';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      '#1e88e5';
                  }}
                >
                  View Students
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      <div style={{ fontSize: '13px', color: '#666' }}>
        <p>
          Showing {sortedClasses.length} classes with{' '}
          {classes.reduce((sum, c) => sum + c.studentCount, 0)} total students
        </p>
      </div>
    </div>
  );
}
