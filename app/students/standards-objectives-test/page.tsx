'use client';

import { StandardsObjectivesStudent } from '@/app/components/StandardsObjectivesStudent';

// Test page for Standards & Objectives student view
// Shows component with mock data
export default function StandardsObjectivesTestPage() {
  // Using mock class ID from test data (American Literature)
  const mockClassId = 'cmsjazbw0000augct6nyutf9e';

  return (
    <main style={{ backgroundColor: '#fafaf7', minHeight: '100vh', paddingBottom: '40px' }}>
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e0d8', paddingBottom: '20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1c1917' }}>
            Standards & Objectives - Test View
          </h1>
          <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>
            This is a test view of the student Standards & Objectives component with mock data.
          </p>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
            Component uses mock API response from `mockStudentStandardsObjectives`.
            When T1 provides the backend API, switch from mock to live fetch.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '20px' }}>
        <StandardsObjectivesStudent classId={mockClassId} />
      </div>
    </main>
  );
}
