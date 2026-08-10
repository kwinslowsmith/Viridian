import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ParentHomePageClient from '@/app/components/ParentHomePage';

export const metadata: Metadata = {
  title: 'My Children | Viridian Parents',
  description: 'View your children\'s learning progress',
};

export default async function ParentHomeRoute() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return <ParentHomePageClient parentId={session.user.id} />;
}
