'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CurriculumCreator } from '@/app/components/polymath';

interface CurriculumUnit {
  title: string;
  description?: string;
  gradeLevel: string;
  subject: string;
  lessons: any[];
}

export default function CreateCurriculumPage() {
  const router = useRouter();

  const handleSubmit = async (curriculum: CurriculumUnit) => {
    try {
      // TODO: Replace with actual API call
      console.log('Creating curriculum:', curriculum);

      // Mock success - would be replaced with API response
      alert('Curriculum created successfully!');
      router.push('/polymath/curriculum');
    } catch (error) {
      alert('Failed to create curriculum');
      console.error('Error creating curriculum:', error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <CurriculumCreator onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
