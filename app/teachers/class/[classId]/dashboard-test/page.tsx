import { TeacherClassDashboard } from '@/app/components/TeacherClassDashboard';

export default async function DashboardTestPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  // Use the seeded test class ID
  const testClassId = 'cmsjazbw0000augct6nyutf9e';

  return (
    <div>
      <div style={{ padding: '20px', backgroundColor: '#f0f0f0', marginBottom: '20px', borderRadius: '8px' }}>
        <h1 style={{ margin: '0 0 10px 0' }}>🧪 Teacher Dashboard Test</h1>
        <p style={{ margin: '0 0 5px 0' }}>
          <strong>Test Class:</strong> American Literature, Period 3
        </p>
        <p style={{ margin: '0 0 5px 0' }}>
          <strong>Class ID:</strong> {testClassId}
        </p>
        <p style={{ margin: '0 0 5px 0' }}>
          <strong>Enrollment:</strong> 3 students
        </p>
        <p style={{ margin: '0 0 5px 0' }}>
          <strong>Standards:</strong> 2 (Analyze Literary Themes, Essay Writing & Argument)
        </p>
        <p style={{ margin: '0' }}>
          <strong>Status:</strong> ✅ Ready - Component loads live API data below
        </p>
      </div>

      <TeacherClassDashboard classId={testClassId} />
    </div>
  );
}
