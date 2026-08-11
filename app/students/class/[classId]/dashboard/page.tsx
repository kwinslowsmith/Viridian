'use client';

import { useState } from 'react';
import { K12StudentProgressDashboard } from '@/app/components/K12StudentProgressDashboard';
import { StandardsObjectivesStudent } from '@/app/components/StandardsObjectivesStudent';

type TabType = 'progress' | 'standards';

export default function StudentClassDashboardPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const [activeTab, setActiveTab] = useState<TabType>('progress');
  const [classId, setClassId] = useState<string | null>(null);

  // Handle async params
  Promise.resolve(params).then((resolved) => {
    setClassId(resolved.classId);
  });

  if (!classId) {
    return <div style={{ padding: '20px', color: '#666' }}>Loading...</div>;
  }

  const tabs = [
    { id: 'progress' as TabType, label: 'Progress', icon: '📊' },
    { id: 'standards' as TabType, label: 'Standards & Objectives', icon: '📚' },
  ];

  return (
    <main style={{ backgroundColor: '#fafaf7', minHeight: '100vh' }}>
      {/* Tab Navigation */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e0d8', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', gap: '0' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '16px 24px',
                  fontSize: '14px',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  color: activeTab === tab.id ? '#1c1917' : '#666',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid #0d9488' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', minHeight: 'calc(100vh - 80px)' }}>
        {activeTab === 'progress' && (
          <div>
            <K12StudentProgressDashboard classId={classId} />
          </div>
        )}

        {activeTab === 'standards' && (
          <div>
            <StandardsObjectivesStudent classId={classId} />
          </div>
        )}
      </div>
    </main>
  );
}
