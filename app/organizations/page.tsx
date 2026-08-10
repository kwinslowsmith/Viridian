import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function OrganizationsPage() {
  const session = await getServerSession(authOptions);

  // Redirect parents to their home page
  if ((session?.user as any)?.role === 'parent') {
    redirect('/app/parents');
  }

  // Redirect non-parents to dashboard
  redirect('/dashboard');
}
