import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ParentMessagesView from '@/app/components/ParentMessagesView';

export const metadata: Metadata = {
  title: 'Messages | Viridian Parents',
  description: 'Communicate with your child\'s teachers',
};

export default async function ParentMessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return <ParentMessagesView parentId={session.user.id} />;
}
