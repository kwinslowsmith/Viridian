import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { ParentChildrenList } from '@/app/components/ParentChildrenList';

export const metadata = {
  title: 'My Children | Viridian',
  description: 'View your children\'s learning progress dashboards',
};

export default async function MyChildrenPage() {
  const session = await getServerSession();

  // Require authentication
  if (!session?.user?.email) {
    redirect('/auth/signin?callbackUrl=/parents/my-children');
  }

  return (
    <main>
      <ParentChildrenList />
    </main>
  );
}
