'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CurriculumCreator, LoadingState } from '@/app/components/polymath';

interface CurriculumUnit {
  title: string;
  description?: string;
  gradeLevel: string;
  subject: string;
  lessons: any[];
}

export default function EditCurriculumPage() {
  const router = useRouter();
  const params = useParams();
  const curriculumId = params.id as string;

  const [curriculum, setCurriculum] = useState<CurriculumUnit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    // Mock data for now
    const mockCurriculum: CurriculumUnit = {
      title: 'American Literature - Fall 2026',
      description: 'Comprehensive survey of American literary movements and authors',
      gradeLevel: '11',
      subject: 'English Language Arts',
      lessons: [
        {
          id: 'lesson-1',
          title: 'Introduction to Symbolism',
          description: 'Understanding symbolic language in literature',
          materials: [
            {
              id: 'mat-1',
              title: 'Chapter 3 Reading',
              type: 'pdf',
              url: 'https://example.com/chapter3.pdf',
            },
          ],
        },
      ],
    };

    // Simulate API call delay
    setTimeout(() => {
      setCurriculum(mockCurriculum);
      setIsLoading(false);
    }, 500);
  }, [curriculumId]);

  const handleSubmit = async (updatedCurriculum: CurriculumUnit) => {
    try {
      // TODO: Replace with actual API call
      console.log('Updating curriculum:', updatedCurriculum);

      // Mock success
      alert('Curriculum updated successfully!');
      router.push(`/polymath/curriculum/${curriculumId}`);
    } catch (error) {
      alert('Failed to update curriculum');
      console.error('Error updating curriculum:', error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return <LoadingState message="Loading curriculum..." />;
  }

  if (!curriculum) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center">
          <p className="text-[#666666] text-lg">Curriculum not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <CurriculumCreator
        initialData={curriculum}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
