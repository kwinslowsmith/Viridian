import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { ParentDashboard } from '@/app/components/ParentDashboard';

export const metadata = {
  title: 'Child Progress Dashboard | Viridian',
  description: 'View your child\'s learning progress and mastery toward standards',
};

export default async function ParentDashboardPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const session = await getServerSession();

  // Require authentication
  if (!session?.user?.email) {
    redirect('/auth/signin?callbackUrl=/parents');
  }

  const { childId } = await params;

  return (
    <main>
      <ParentDashboard childId={childId} />
    </main>
  );
}
