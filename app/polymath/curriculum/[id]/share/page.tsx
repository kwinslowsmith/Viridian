'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CurriculumSharing, LoadingState } from '@/app/components/polymath';

interface SharedUser {
  id: string;
  email: string;
  name?: string;
  role: 'viewer' | 'editor' | 'owner';
  addedDate?: string;
}

export default function ShareCurriculumPage() {
  const router = useRouter();
  const params = useParams();
  const curriculumId = params.id as string;

  const [curriculumTitle, setCurriculumTitle] = useState('');
  const [visibilityStatus, setVisibilityStatus] = useState<'private' | 'organization' | 'public'>('private');
  const [sharedWith, setSharedWith] = useState<SharedUser[]>([
    {
      id: '1',
      email: 'teacher2@example.com',
      name: 'Sarah Johnson',
      role: 'editor',
      addedDate: '1 week ago',
    },
    {
      id: '2',
      email: 'teacher3@example.com',
      name: 'Michael Chen',
      role: 'viewer',
      addedDate: '3 days ago',
    },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    setTimeout(() => {
      setCurriculumTitle('American Literature - Fall 2026');
      setVisibilityStatus('organization');
      setIsLoading(false);
    }, 500);
  }, [curriculumId]);

  const handleStatusChange = (status: 'private' | 'organization' | 'public') => {
    setVisibilityStatus(status);
    // TODO: API call
    console.log('Updating visibility status:', status);
  };

  const handleAddUser = (email: string, role: 'viewer' | 'editor') => {
    const newUser: SharedUser = {
      id: `user-${Date.now()}`,
      email,
      role,
      addedDate: 'just now',
    };
    setSharedWith([...sharedWith, newUser]);
    // TODO: API call
    console.log('Adding user:', email, role);
  };

  const handleRemoveUser = (userId: string) => {
    setSharedWith(sharedWith.filter((u) => u.id !== userId));
    // TODO: API call
    console.log('Removing user:', userId);
  };

  const handleChangeRole = (userId: string, role: 'viewer' | 'editor') => {
    setSharedWith(
      sharedWith.map((u) => (u.id === userId ? { ...u, role } : u))
    );
    // TODO: API call
    console.log('Changing user role:', userId, role);
  };

  if (isLoading) {
    return <LoadingState message="Loading sharing settings..." />;
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <CurriculumSharing
        curriculumTitle={curriculumTitle}
        currentStatus={visibilityStatus}
        sharedWith={sharedWith}
        onStatusChange={handleStatusChange}
        onAddUser={handleAddUser}
        onRemoveUser={handleRemoveUser}
        onChangeRole={handleChangeRole}
        onCancel={() => router.back()}
      />
    </div>
  );
}
