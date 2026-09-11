'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextInput, Card, CardBody, LoadingState, EmptyState } from './index';

interface Curriculum {
  id: string;
  title: string;
  description?: string;
  subject: string;
  gradeLevel: string;
  lessonCount: number;
  materialCount: number;
  lastEdited?: string;
  status: 'draft' | 'published' | 'archived';
  isOwner?: boolean;
}

interface CurriculumLibraryProps {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onShare?: (id: string) => void;
  onCreateNew?: () => void;
  loading?: boolean;
}

const subjectOptions = [
  'English Language Arts',
  'Math',
  'Science',
  'Social Studies',
  'History',
  'Health',
  'Arts',
  'Music',
  'Physical Education',
];

const gradeOptions = [
  'K',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
];

export function CurriculumLibrary({
  onEdit,
  onDelete,
  onDuplicate,
  onShare,
  onCreateNew,
  loading = false,
}: CurriculumLibraryProps) {
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [filteredCurricula, setFilteredCurricula] = useState<Curriculum[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    // Mock data - would be replaced with API call
    const mockCurricula: Curriculum[] = [
      {
        id: 'curr-1',
        title: 'American Literature - Fall 2026',
        description: 'Comprehensive survey of American literary movements and authors',
        subject: 'English Language Arts',
        gradeLevel: '11',
        lessonCount: 12,
        materialCount: 45,
        lastEdited: '2 days ago',
        status: 'published',
        isOwner: true,
      },
      {
        id: 'curr-2',
        title: 'Introduction to Algebra',
        description: 'Fundamentals of algebraic equations and problem solving',
        subject: 'Math',
        gradeLevel: '8',
        lessonCount: 15,
        materialCount: 62,
        lastEdited: '1 week ago',
        status: 'published',
        isOwner: true,
      },
      {
        id: 'curr-3',
        title: 'World History - Enlightenment Era',
        description: 'Exploration of the Enlightenment period and its impact',
        subject: 'History',
        gradeLevel: '10',
        lessonCount: 8,
        materialCount: 32,
        lastEdited: '3 weeks ago',
        status: 'draft',
        isOwner: true,
      },
    ];
    setCurricula(mockCurricula);
  }, []);

  useEffect(() => {
    let filtered = curricula;

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedSubject) {
      filtered = filtered.filter((c) => c.subject === selectedSubject);
    }

    if (selectedGrade) {
      filtered = filtered.filter((c) => c.gradeLevel === selectedGrade);
    }

    if (selectedStatus) {
      filtered = filtered.filter((c) => c.status === selectedStatus);
    }

    setFilteredCurricula(filtered);
  }, [searchTerm, selectedSubject, selectedGrade, selectedStatus, curricula]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return dateStr;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-[#DCFCE7] text-[#166534]';
      case 'draft':
        return 'bg-[#FEF3C7] text-[#92400E]';
      case 'archived':
        return 'bg-[#F3F4F6] text-[#4B5563]';
      default:
        return 'bg-[#F3F4F6] text-[#4B5563]';
    }
  };

  if (loading) {
    return <LoadingState message="Loading curricula..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#3C3C3C] mb-2">
            My Curriculum
          </h1>
          <p className="text-[#666666]">
            Create and manage your curriculum units
          </p>
        </div>
        <Button onClick={onCreateNew}>+ Create Curriculum</Button>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                Search
              </label>
              <TextInput
                type="text"
                placeholder="Search curricula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                Subject
              </label>
              <select
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B2AA]"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjectOptions.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                Grade Level
              </label>
              <select
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B2AA]"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
              >
                <option value="">All Grades</option>
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    Grade {grade === 'K' ? 'K' : grade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B2AA]"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Results Count */}
      {filteredCurricula.length > 0 && (
        <div className="text-sm text-[#666666] mb-6">
          Showing {filteredCurricula.length} of {curricula.length} curricula
        </div>
      )}

      {/* Curricula List */}
      {filteredCurricula.length === 0 ? (
        <EmptyState
          icon="📚"
          title={curricula.length === 0 ? "No curricula yet" : "No matching curricula"}
          description={
            curricula.length === 0
              ? "Create your first curriculum to get started"
              : "Try adjusting your filters"
          }
          actionLabel={curricula.length === 0 ? "Create Curriculum" : undefined}
          onAction={curricula.length === 0 ? onCreateNew : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filteredCurricula.map((curriculum) => (
            <Card key={curriculum.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-[#3C3C3C]">
                        {curriculum.title}
                      </h3>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          curriculum.status
                        )}`}
                      >
                        {curriculum.status.charAt(0).toUpperCase() +
                          curriculum.status.slice(1)}
                      </span>
                    </div>

                    {curriculum.description && (
                      <p className="text-sm text-[#666666] mb-3">
                        {curriculum.description}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-[#666666]">
                      <div>
                        <span className="font-medium">{curriculum.subject}</span>
                        {' • '}
                        <span>Grade {curriculum.gradeLevel}</span>
                      </div>
                      <div>
                        <span className="font-medium">{curriculum.lessonCount}</span> Lessons
                      </div>
                      <div>
                        <span className="font-medium">{curriculum.materialCount}</span> Materials
                      </div>
                      {curriculum.lastEdited && (
                        <div>Edited {formatDate(curriculum.lastEdited)}</div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {curriculum.isOwner && (
                    <div className="flex gap-2 ml-6">
                      {/* Dropdown menu would go here for more actions */}
                      <button
                        onClick={() => onEdit?.(curriculum.id)}
                        className="px-3 py-1.5 text-sm font-medium text-[#20B2AA] hover:bg-[#20B2AA]/10 rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDuplicate?.(curriculum.id)}
                        className="px-3 py-1.5 text-sm font-medium text-[#666666] hover:bg-[#F5F5F5] rounded-lg transition border border-[#E5E5E5]"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() => onShare?.(curriculum.id)}
                        className="px-3 py-1.5 text-sm font-medium text-[#666666] hover:bg-[#F5F5F5] rounded-lg transition border border-[#E5E5E5]"
                      >
                        Share
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              'Are you sure you want to delete this curriculum?'
                            )
                          ) {
                            onDelete?.(curriculum.id);
                          }
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition border border-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
