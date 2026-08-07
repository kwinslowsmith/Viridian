import { Metadata } from 'next';
import ParentDashboardK12 from '@/app/components/ParentDashboardK12';

export const metadata: Metadata = {
  title: "Child's Learning Progress | Viridian",
  description: 'View your child\'s mastery progress on key learning standards',
};

export default function ParentDashboardPage({
  params,
}: {
  params: { childId: string };
}) {
  return <ParentDashboardK12 />;
}
