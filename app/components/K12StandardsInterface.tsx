'use client';

import React, { useState, useEffect } from 'react';
import { K12StandardsList } from './K12StandardsList';
import { K12ClassList } from './K12ClassList';
import { K12StudentGrid } from './K12StudentGrid';
import { K12CohortFilter } from './K12CohortFilter';
import { K12StandardsData, Standard, Class, StudentMastery } from './K12StandardsInterface.types';
import { mockK12Data } from './K12StandardsInterface.mockData';
import {
  fetchStandardsByDomain,
  fetchClassMasterySummary,
  fetchStudents,
  StandardResponse,
  ClassMasterySummaryResponse,
  StudentData,
} from '@/lib/api/k12-standards';

type ViewType = 'standards' | 'classes' | 'students' | 'cohorts';

interface K12StandardsInterfaceProps {
  orgId?: string;
  data?: K12StandardsData;
}

const colors = {
  bg: '#fafafa',
  text: '#333',
  text2: '#666',
  border: '#e0e0e0',
  teal: {
    accent: '#00897b',
    bg: '#00897b',
    light: '#e0f2f1',
  },
};

type LoadingState = 'idle' | 'loading' | 'error';

export function K12StandardsInterface({
  orgId,
  data = mockK12Data,
}: K12StandardsInterfaceProps): JSX.Element {
  const [currentView, setCurrentView] = useState<ViewType>('standards');
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedStandardId, setSelectedStandardId] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  // API state
  const [apiStandards, setApiStandards] = useState<StandardResponse[]>([]);
  const [classMasteryData, setClassMasteryData] = useState<ClassMasterySummaryResponse | null>(null);
  const [apiStudents, setApiStudents] = useState<StudentData[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [useRealData, setUseRealData] = useState(false);

  // Fetch standards when component mounts or orgId changes
  useEffect(() => {
    if (useRealData && orgId) {
      loadStandards();
    }
  }, [useRealData, orgId]);

  // Fetch class mastery data when class is selected
  useEffect(() => {
    if (useRealData && selectedClass && orgId) {
      loadClassMasteryData(selectedClass.id);
    }
  }, [useRealData, selectedClass, orgId]);

  const loadStandards = async () => {
    if (!orgId) return;
    setLoadingState('loading');
    setErrorMessage(null);
    try {
      const standards = await fetchStandardsByDomain(orgId);
      setApiStandards(standards);
      setLoadingState('idle');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to load standards';
      setErrorMessage(msg);
      setLoadingState('error');
      console.error('Error loading standards:', error);
    }
  };

  const loadClassMasteryData = async (classId: string) => {
    if (!orgId) return;
    setLoadingState('loading');
    setErrorMessage(null);
    try {
      const data = await fetchClassMasterySummary(classId, orgId);
      setClassMasteryData(data);
      setLoadingState('idle');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to load class data';
      setErrorMessage(msg);
      setLoadingState('error');
      console.error('Error loading class mastery data:', error);
    }
  };

  // Determine which data source to use (real API or mock)
  const standardsToDisplay = useRealData && apiStandards.length > 0
    ? apiStandards.map((std) => ({
        id: std.id,
        name: std.name,
        domain: 'api',
        description: std.description,
        classCount: std.stats?.studentsTracked || 0,
        studentCount: std.stats?.studentsTracked || 0,
      }))
    : data.standards;

  const classesToDisplay = useRealData && classMasteryData
    ? [{
        id: classMasteryData.class.id,
        name: classMasteryData.class.name,
        departmentName: classMasteryData.class.subject,
        studentCount: classMasteryData.summary.totalStudents,
        standardCount: classMasteryData.summary.totalStandards,
        avgMasteryLevel: classMasteryData.summary.averageMastery,
      }]
    : data.classes;

  // Filter students for selected class
  const classStudents: StudentMastery[] = selectedClass
    ? (useRealData && classMasteryData
        ? classMasteryData.matrix.map((row) => ({
            studentId: row.studentId,
            studentName: row.studentName,
            email: row.studentEmail,
            masteryByStandard: Object.fromEntries(
              row.masteryByStandard.map((m) => [m.standardId, m.masteryLevel])
            ),
            cohort: '',
          }))
        : data.studentProgress.slice(0, 8))
    : [];

  // Get unique standard names map
  const standardNameMap: Record<string, string> = {};
  if (useRealData && classMasteryData) {
    classMasteryData.standards.forEach((std) => {
      standardNameMap[std.id] = std.name;
    });
  } else {
    data.standards.forEach((std) => {
      standardNameMap[std.id] = std.name;
    });
  }

  // Determine standard IDs for grid view
  const standardIdsForGrid = selectedClass
    ? (useRealData && classMasteryData
        ? classMasteryData.standards.slice(0, 8).map((s) => s.id)
        : data.standards.slice(0, Math.min(8, data.standards.length)).map((s) => s.id))
    : [];

  const handleBackClick = () => {
    if (currentView === 'students' && selectedClass) {
      setCurrentView('classes');
      setSelectedClass(null);
    } else if (currentView === 'classes' && selectedStandard) {
      setCurrentView('standards');
      setSelectedStandard(null);
    }
  };

  const canGoBack =
    (currentView === 'students' && selectedClass) ||
    (currentView === 'classes' && selectedStandard);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title & Navigation */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: '700',
                color: colors.text,
                marginBottom: '0.25rem',
              }}
            >
              Learning Standards
            </h1>
            <p style={{ fontSize: '14px', color: colors.text2 }}>
              Track mastery progression across all students and standards
              {useRealData && ' (Live Data)'}
            </p>
          </div>

          {/* Data Source Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setUseRealData(!useRealData)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: useRealData ? '#22c55e' : '#e0e0e0',
                color: useRealData ? '#fff' : '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
            >
              {useRealData ? 'Using Real Data' : 'Using Mock Data'}
            </button>
          </div>

          {/* View Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              borderBottom: `2px solid ${colors.border}`,
              paddingBottom: '0.5rem',
              minWidth: '100%',
            }}
          >
            <button
              onClick={() => setCurrentView('standards')}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: currentView === 'standards' ? '600' : '500',
                color: currentView === 'standards' ? colors.teal.accent : colors.text2,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: currentView === 'standards' ? `3px solid ${colors.teal.accent}` : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Standards
            </button>
            <button
              onClick={() => setCurrentView('classes')}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: currentView === 'classes' ? '600' : '500',
                color: currentView === 'classes' ? colors.teal.accent : colors.text2,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: currentView === 'classes' ? `3px solid ${colors.teal.accent}` : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Classes
            </button>
            <button
              onClick={() => setCurrentView('students')}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: currentView === 'students' ? '600' : '500',
                color: currentView === 'students' ? colors.teal.accent : colors.text2,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: currentView === 'students' ? `3px solid ${colors.teal.accent}` : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Students
            </button>
            <button
              onClick={() => setCurrentView('cohorts')}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: currentView === 'cohorts' ? '600' : '500',
                color: currentView === 'cohorts' ? colors.teal.accent : colors.text2,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: currentView === 'cohorts' ? `3px solid ${colors.teal.accent}` : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Cohorts
            </button>
          </div>
        </div>

        {/* Breadcrumb & Back Button */}
        {canGoBack && (
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={handleBackClick}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                color: colors.teal.accent,
                backgroundColor: colors.teal.light,
                border: `1px solid ${colors.teal.accent}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = colors.teal.accent;
                (e.target as HTMLButtonElement).style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = colors.teal.light;
                (e.target as HTMLButtonElement).style.color = colors.teal.accent;
              }}
            >
              ← Back
            </button>
            {selectedStandard && (
              <p style={{ fontSize: '13px', color: colors.text2, marginTop: '0.5rem' }}>
                Viewing classes for: <strong>{selectedStandard.name}</strong>
              </p>
            )}
            {selectedClass && (
              <p style={{ fontSize: '13px', color: colors.text2, marginTop: '0.5rem' }}>
                Viewing students in: <strong>{selectedClass.name}</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '6px',
            color: '#991b1b',
            fontSize: '13px',
          }}
        >
          <strong>Error:</strong> {errorMessage}
          <button
            onClick={() => setErrorMessage(null)}
            style={{
              marginLeft: '12px',
              padding: '2px 8px',
              fontSize: '12px',
              backgroundColor: 'transparent',
              color: '#991b1b',
              border: '1px solid #fca5a5',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: `1px solid ${colors.border}`,
          padding: '24px',
          position: 'relative',
        }}
      >
        {/* Loading Overlay */}
        {loadingState === 'loading' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              zIndex: 10,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  border: '3px solid #e0e0e0',
                  borderTop: '3px solid #1e88e5',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 8px',
                }}
              />
              <p style={{ fontSize: '13px', color: '#666' }}>Loading...</p>
            </div>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {currentView === 'standards' && (
          <K12StandardsList
            standards={standardsToDisplay}
            onSelectStandard={setSelectedStandard}
            onDrill={(id) => {
              setSelectedStandardId(id);
              setCurrentView('classes');
            }}
            selectedDomain={selectedDomain}
            onDomainChange={setSelectedDomain}
          />
        )}

        {currentView === 'classes' && (
          <K12ClassList
            classes={classesToDisplay}
            onSelectClass={setSelectedClass}
            onDrill={(id) => {
              const cls = classesToDisplay.find((c) => c.id === id);
              if (cls) {
                setSelectedClass(cls);
              }
              setCurrentView('students');
            }}
          />
        )}

        {currentView === 'students' && selectedClass && (
          <K12StudentGrid
            students={classStudents}
            standardIds={standardIdsForGrid}
            standardNames={standardNameMap}
            className={selectedClass.name}
            onCellClick={(studentId, standardId, masteryLevel) => {
              console.log(
                `Clicked: ${studentId} on ${standardId}, mastery: ${masteryLevel}`
              );
            }}
          />
        )}

        {currentView === 'cohorts' && (
          <K12CohortFilter
            cohorts={data.cohorts}
            students={data.studentProgress}
            standardIds={standardIdsForGrid}
            standardNames={standardNameMap}
            onSelectCohort={(cohortId) => {
              console.log(`Selected cohort: ${cohortId}`);
            }}
          />
        )}
      </div>

      {/* Quick Stats Footer */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          fontSize: '13px',
        }}
      >
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: `1px solid ${colors.border}`,
          }}
        >
          <p style={{ color: colors.text2, marginBottom: '4px' }}>Total Standards</p>
          <p style={{ fontSize: '20px', fontWeight: '700', color: colors.text }}>
            {useRealData && classMasteryData
              ? classMasteryData.summary.totalStandards
              : data.standards.length}
          </p>
        </div>
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: `1px solid ${colors.border}`,
          }}
        >
          <p style={{ color: colors.text2, marginBottom: '4px' }}>Total Classes</p>
          <p style={{ fontSize: '20px', fontWeight: '700', color: colors.text }}>
            {classesToDisplay.length}
          </p>
        </div>
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: `1px solid ${colors.border}`,
          }}
        >
          <p style={{ color: colors.text2, marginBottom: '4px' }}>Total Students</p>
          <p style={{ fontSize: '20px', fontWeight: '700', color: colors.text }}>
            {useRealData && classMasteryData
              ? classMasteryData.summary.totalStudents
              : data.studentProgress.length}
          </p>
        </div>
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: `1px solid ${colors.border}`,
          }}
        >
          <p style={{ color: colors.text2, marginBottom: '4px' }}>
            {useRealData ? 'Avg Mastery' : 'Student Cohorts'}
          </p>
          <p style={{ fontSize: '20px', fontWeight: '700', color: colors.text }}>
            {useRealData && classMasteryData
              ? classMasteryData.summary.averageMastery.toFixed(2)
              : data.cohorts.length}
          </p>
        </div>
      </div>
    </div>
  );
}
