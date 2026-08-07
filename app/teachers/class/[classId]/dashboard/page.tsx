import { TeacherClassDashboard } from '@/app/components/TeacherClassDashboard';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ClassDashboardPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  const { classId } = await params;

  return (
    <div style={{ padding: '2rem' }}>
      <TeacherClassDashboard classId={classId} />
    </div>
  );
}
