'use client';

import React from 'react';
import Link from 'next/link';
import { CurriculumLibrary } from '@/app/components/polymath';
import { useRouter } from 'next/navigation';

export default function CurriculumPage() {
  const router = useRouter();

  const handleEdit = (id: string) => {
    router.push(`/polymath/curriculum/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete API call
    console.log('Delete curriculum:', id);
  };

  const handleDuplicate = (id: string) => {
    // TODO: Implement duplicate API call
    console.log('Duplicate curriculum:', id);
  };

  const handleShare = (id: string) => {
    router.push(`/polymath/curriculum/${id}/share`);
  };

  const handleCreateNew = () => {
    router.push('/polymath/curriculum/create');
  };

  return (
    <CurriculumLibrary
      onEdit={handleEdit}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onShare={handleShare}
      onCreateNew={handleCreateNew}
    />
  );
}
