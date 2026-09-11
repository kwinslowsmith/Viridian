'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CurriculumDetail } from '@/app/components/polymath';
import { LoadingState } from '@/app/components/polymath';

interface Curriculum {
  id: string;
  title: string;
  description?: string;
  gradeLevel: string;
  subject: string;
  lessons: any[];
  status: 'draft' | 'published' | 'archived';
  isOwner?: boolean;
  createdBy?: string;
  createdDate?: string;
  sharedWith?: string[];
}

export default function CurriculumDetailPage() {
  const router = useRouter();
  const params = useParams();
  const curriculumId = params.id as string;

  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    // Mock data for now
    const mockCurriculum: Curriculum = {
      id: curriculumId,
      title: 'American Literature - Fall 2026',
      description: 'Comprehensive survey of American literary movements and authors',
      gradeLevel: '11',
      subject: 'English Language Arts',
      status: 'published',
      isOwner: true,
      createdBy: 'You',
      createdDate: '2026-09-01',
      sharedWith: ['teacher2@example.com', 'teacher3@example.com'],
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
            {
              id: 'mat-2',
              title: 'Symbolism Lecture',
              type: 'video',
              url: 'https://example.com/symbolism.mp4',
            },
          ],
        },
        {
          id: 'lesson-2',
          title: 'American Gothic Literature',
          description: 'Exploring gothic elements in American literature',
          materials: [
            {
              id: 'mat-3',
              title: 'Edgar Allan Poe Collection',
              type: 'document',
              url: 'https://example.com/poe.docx',
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

  const handleEdit = () => {
    router.push(`/polymath/curriculum/${curriculumId}/edit`);
  };

  const handleShare = () => {
    router.push(`/polymath/curriculum/${curriculumId}/share`);
  };

  const handlePublish = () => {
    // TODO: API call
    console.log('Publishing curriculum');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this curriculum?')) {
      // TODO: API call
      router.push('/polymath/curriculum');
    }
  };

  const handleComment = () => {
    // TODO: Implement comments modal
    console.log('Opening comments');
  };

  const handleFork = () => {
    // TODO: API call
    console.log('Forking curriculum');
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
      <CurriculumDetail
        curriculum={curriculum}
        onEdit={handleEdit}
        onShare={handleShare}
        onPublish={handlePublish}
        onDelete={handleDelete}
        onComment={handleComment}
        onFork={handleFork}
      />
    </div>
  );
}
