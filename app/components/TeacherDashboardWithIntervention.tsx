'use client';

import React, { useState } from 'react';
import { TeacherClassDashboard } from './TeacherClassDashboard';
import { EnhancedMasteryDashboard } from './EnhancedMasteryDashboard';
import { InterventionManager } from './InterventionManager';
import { GradingInbox } from './GradingInbox';
import { colors } from '@/app/design/colors';

interface TeacherDashboardWithInterventionProps {
  classId: string;
}

type TabType = 'dashboard' | 'mastery' | 'grading' | 'interventions';

export function TeacherDashboardWithIntervention({ classId }: TeacherDashboardWithInterventionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [quickCreateObjective, setQuickCreateObjective] = useState<{ id: string; text: string } | null>(null);

  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'mastery', label: 'Mastery Overview', icon: '📈' },
    { id: 'grading', label: 'Grading', icon: '✏️' },
    { id: 'interventions', label: 'Interventions', icon: '🎯' },
  ];

  if (!classId) {
    return <div style={{ color: colors.text2, padding: '2rem' }}>Error: Class ID not provided</div>;
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: '0',
          marginBottom: '24px',
          flexWrap: 'wrap',
          padding: '0',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 16px',
              backgroundColor: 'transparent',
              color: activeTab === tab.id ? colors.teal.accent : colors.text2,
              border: 'none',
              borderBottom: activeTab === tab.id ? `2px solid ${colors.teal.accent}` : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '600' : '500',
              transition: 'all 0.2s',
              fontSize: '14px',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: '24px' }}>
        {activeTab === 'dashboard' && <TeacherClassDashboard classId={classId} />}

        {activeTab === 'mastery' && (
          <EnhancedMasteryDashboard
            classId={classId}
            onCreateIntervention={(objectiveId, objectiveText) => {
              setQuickCreateObjective({ id: objectiveId, text: objectiveText });
              setActiveTab('interventions');
            }}
          />
        )}

        {activeTab === 'grading' && <GradingInbox classId={classId} />}

        {activeTab === 'interventions' && (
          <InterventionManager
            classId={classId}
            quickCreateObjective={quickCreateObjective}
            onQuickCreateCanceled={() => setQuickCreateObjective(null)}
          />
        )}
      </div>
    </div>
  );
}
