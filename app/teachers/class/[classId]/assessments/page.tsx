import { AssessmentCreator } from '@/app/components/AssessmentCreator';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AssessmentsPage({
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
      <AssessmentCreator classId={classId} />
    </div>
  );
}
