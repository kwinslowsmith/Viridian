'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody, Badge } from './index';

interface Material {
  id: string;
  title: string;
  type: 'document' | 'pdf' | 'video' | 'link';
  url?: string;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  materials: Material[];
}

interface Curriculum {
  id: string;
  title: string;
  description?: string;
  gradeLevel: string;
  subject: string;
  lessons: Lesson[];
  status: 'draft' | 'published' | 'archived';
  isOwner?: boolean;
  createdBy?: string;
  createdDate?: string;
  sharedWith?: string[];
}

interface CurriculumDetailProps {
  curriculum: Curriculum;
  isLoading?: boolean;
  onEdit?: () => void;
  onShare?: () => void;
  onPublish?: () => void;
  onDelete?: () => void;
  onComment?: () => void;
  onFork?: () => void;
}

export function CurriculumDetail({
  curriculum,
  isLoading,
  onEdit,
  onShare,
  onPublish,
  onDelete,
  onComment,
  onFork,
}: CurriculumDetailProps) {
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  const toggleLessonExpanded = (lessonId: string) => {
    setExpandedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return '#DCFCE7 text-#166534';
      case 'draft':
        return '#FEF3C7 text-#92400E';
      case 'archived':
        return '#F3F4F6 text-#4B5563';
      default:
        return '#F3F4F6 text-#4B5563';
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'document':
        return '📄';
      case 'pdf':
        return '📕';
      case 'video':
        return '🎥';
      case 'link':
        return '🔗';
      default:
        return '📎';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-[#3C3C3C] mb-3">
              {curriculum.title}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-[#${getStatusColor(
                  curriculum.status
                )}]`}
              >
                {curriculum.status.charAt(0).toUpperCase() +
                  curriculum.status.slice(1)}
              </span>
              <span className="text-sm text-[#666666]">
                {curriculum.subject} • Grade {curriculum.gradeLevel}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 ml-6">
            {curriculum.isOwner ? (
              <>
                <Button onClick={onEdit}>Edit</Button>
                <Button
                  onClick={onPublish}
                  variant="secondary"
                >
                  {curriculum.status === 'published' ? 'Unpublish' : 'Publish'}
                </Button>
                <Button onClick={onShare} variant="secondary">
                  Share
                </Button>
                <button
                  onClick={onDelete}
                  className="px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition border border-red-200"
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <Button onClick={onFork}>Fork This</Button>
                <Button onClick={onComment} variant="secondary">
                  Comment
                </Button>
              </>
            )}
          </div>
        </div>

        {curriculum.description && (
          <p className="text-base text-[#666666]">{curriculum.description}</p>
        )}
      </div>

      {/* Meta Info */}
      <Card className="mb-8">
        <CardBody>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold text-[#20B2AA]">
                {curriculum.lessons.length}
              </div>
              <div className="text-sm text-[#666666]">Lessons</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#20B2AA]">
                {curriculum.lessons.reduce((sum, l) => sum + l.materials.length, 0)}
              </div>
              <div className="text-sm text-[#666666]">Total Materials</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#20B2AA]">
                {curriculum.sharedWith?.length || 0}
              </div>
              <div className="text-sm text-[#666666]">Shared With</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Lessons */}
      <div>
        <h2 className="text-2xl font-bold text-[#3C3C3C] mb-6">Lessons</h2>

        {curriculum.lessons.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-center text-[#666666]">
                No lessons in this curriculum yet
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {curriculum.lessons.map((lesson, idx) => (
              <Card key={lesson.id}>
                <CardBody>
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleLessonExpanded(lesson.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {expandedLessons.has(lesson.id) ? '▼' : '▶'}
                        </span>
                        <div>
                          <h3 className="text-lg font-medium text-[#3C3C3C]">
                            Lesson {idx + 1}: {lesson.title}
                          </h3>
                          {lesson.description && (
                            <p className="text-sm text-[#666666] mt-1">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-[#999999] ml-4">
                      {lesson.materials.length} materials
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedLessons.has(lesson.id) && (
                    <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
                      <h4 className="text-sm font-medium text-[#3C3C3C] mb-3">
                        Materials
                      </h4>

                      {lesson.materials.length === 0 ? (
                        <p className="text-sm text-[#999999]">
                          No materials in this lesson
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {lesson.materials.map((material) => (
                            <div
                              key={material.id}
                              className="flex items-center gap-3 p-3 bg-[#F9F9F9] rounded border border-[#E5E5E5]"
                            >
                              <span className="text-xl">
                                {getMaterialIcon(material.type)}
                              </span>
                              <div className="flex-1">
                                <div className="font-medium text-[#3C3C3C] text-sm">
                                  {material.title}
                                </div>
                                <div className="text-xs text-[#999999]">
                                  {material.type.charAt(0).toUpperCase() +
                                    material.type.slice(1)}
                                </div>
                              </div>
                              {material.url && (
                                <a
                                  href={material.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-medium text-[#20B2AA] hover:underline"
                                >
                                  Open
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
