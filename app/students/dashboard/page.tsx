import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { K12StudentProgressDashboard } from '@/app/components/K12StudentProgressDashboard';

export default async function StudentDashboardPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/auth/login');
  }

  // Fetch student's K12 classes
  const enrollments = await prisma.k12Enrollment.findMany({
    where: { studentId: session.user.id },
    include: { class: true },
  });

  if (enrollments.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '12px' }}>No Classes Yet</h1>
        <p style={{ color: '#666' }}>You haven't been enrolled in any K12 classes yet.</p>
      </div>
    );
  }

  // For now, show progress for first class
  // In future, could add class selector
  const firstClass = enrollments[0];

  return (
    <div>
      <K12StudentProgressDashboard classId={firstClass.classId} />
    </div>
  );
}
