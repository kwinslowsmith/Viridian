import { StandardsObjectivesTeacher } from '@/app/components/StandardsObjectivesTeacher';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function StandardsObjectivesPage({
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
    <div>
      <StandardsObjectivesTeacher classId={classId} />
    </div>
  );
}
