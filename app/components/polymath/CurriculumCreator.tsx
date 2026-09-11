'use client';

import React, { useState } from 'react';
import { Button, TextInput, Card, CardBody, Modal } from './index';

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

interface CurriculumUnit {
  title: string;
  description?: string;
  gradeLevel: string;
  subject: string;
  lessons: Lesson[];
}

interface CurriculumCreatorProps {
  onSubmit: (curriculum: CurriculumUnit) => void;
  onCancel: () => void;
  initialData?: CurriculumUnit;
}

export function CurriculumCreator({
  onSubmit,
  onCancel,
  initialData,
}: CurriculumCreatorProps) {
  const [curriculum, setCurriculum] = useState<CurriculumUnit>(
    initialData || {
      title: '',
      description: '',
      gradeLevel: '',
      subject: '',
      lessons: [],
    }
  );

  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [editingLessonTitle, setEditingLessonTitle] = useState('');
  const [editingLessonDesc, setEditingLessonDesc] = useState('');
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    title: '',
    type: 'document' as const,
    url: '',
  });

  const addLesson = () => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: editingLessonTitle || 'Untitled Lesson',
      description: editingLessonDesc,
      materials: [],
    };
    setCurriculum((prev) => ({
      ...prev,
      lessons: [...prev.lessons, newLesson],
    }));
    setEditingLessonTitle('');
    setEditingLessonDesc('');
    setCurrentLessonId(null);
  };

  const removeLesson = (lessonId: string) => {
    setCurriculum((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((l) => l.id !== lessonId),
    }));
    setExpandedLessons((prev) => {
      const next = new Set(prev);
      next.delete(lessonId);
      return next;
    });
  };

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

  const addMaterialToLesson = (lessonId: string) => {
    setCurriculum((prev) => ({
      ...prev,
      lessons: prev.lessons.map((l) =>
        l.id === lessonId
          ? {
              ...l,
              materials: [
                ...l.materials,
                {
                  id: `material-${Date.now()}`,
                  ...materialForm,
                },
              ],
            }
          : l
      ),
    }));
    setMaterialForm({ title: '', type: 'document', url: '' });
    setShowMaterialModal(false);
  };

  const removeMaterial = (lessonId: string, materialId: string) => {
    setCurriculum((prev) => ({
      ...prev,
      lessons: prev.lessons.map((l) =>
        l.id === lessonId
          ? {
              ...l,
              materials: l.materials.filter((m) => m.id !== materialId),
            }
          : l
      ),
    }));
  };

  const handleSubmit = () => {
    if (!curriculum.title.trim()) {
      alert('Please enter a curriculum title');
      return;
    }
    if (!curriculum.gradeLevel.trim()) {
      alert('Please select a grade level');
      return;
    }
    if (!curriculum.subject.trim()) {
      alert('Please select a subject');
      return;
    }
    onSubmit(curriculum);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#3C3C3C] mb-2">
          {initialData ? 'Edit Curriculum' : 'Create New Curriculum'}
        </h1>
        <p className="text-[#666666]">
          Build a structured curriculum unit with lessons and materials
        </p>
      </div>

      <Card className="mb-6">
        <CardBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                Curriculum Title *
              </label>
              <TextInput
                type="text"
                placeholder="e.g., American Literature - Fall 2026"
                value={curriculum.title}
                onChange={(e) =>
                  setCurriculum((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B2AA]"
                placeholder="Describe the curriculum, learning goals, or key topics..."
                rows={3}
                value={curriculum.description || ''}
                onChange={(e) =>
                  setCurriculum((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                  Grade Level *
                </label>
                <select
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B2AA]"
                  value={curriculum.gradeLevel}
                  onChange={(e) =>
                    setCurriculum((prev) => ({
                      ...prev,
                      gradeLevel: e.target.value,
                    }))
                  }
                >
                  <option value="">Select grade level</option>
                  <option value="K">Kindergarten</option>
                  <option value="1">1st Grade</option>
                  <option value="2">2nd Grade</option>
                  <option value="3">3rd Grade</option>
                  <option value="4">4th Grade</option>
                  <option value="5">5th Grade</option>
                  <option value="6">6th Grade</option>
                  <option value="7">7th Grade</option>
                  <option value="8">8th Grade</option>
                  <option value="9">9th Grade</option>
                  <option value="10">10th Grade</option>
                  <option value="11">11th Grade</option>
                  <option value="12">12th Grade</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                  Subject *
                </label>
                <select
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B2AA]"
                  value={curriculum.subject}
                  onChange={(e) =>
                    setCurriculum((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                >
                  <option value="">Select subject</option>
                  <option value="English Language Arts">English Language Arts</option>
                  <option value="Math">Math</option>
                  <option value="Science">Science</option>
                  <option value="Social Studies">Social Studies</option>
                  <option value="History">History</option>
                  <option value="Science & Nature">Science & Nature</option>
                  <option value="Health">Health</option>
                  <option value="Physical Education">Physical Education</option>
                  <option value="Arts">Arts</option>
                  <option value="Music">Music</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Lessons Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#3C3C3C]">Lessons</h2>
          <Button
            onClick={() => {
              setCurrentLessonId(null);
              setEditingLessonTitle('');
              setEditingLessonDesc('');
            }}
          >
            + Add Lesson
          </Button>
        </div>

        {/* Add Lesson Form */}
        {currentLessonId === null && editingLessonTitle === '' && (
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                    Lesson Title
                  </label>
                  <TextInput
                    type="text"
                    placeholder="e.g., Introduction to Symbolism"
                    value={editingLessonTitle}
                    onChange={(e) => setEditingLessonTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                    Lesson Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B2AA]"
                    placeholder="What will students learn in this lesson?"
                    rows={2}
                    value={editingLessonDesc}
                    onChange={(e) => setEditingLessonDesc(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={addLesson}>Save Lesson</Button>
                  <button
                    onClick={() => {
                      setCurrentLessonId(null);
                      setEditingLessonTitle('');
                      setEditingLessonDesc('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-[#666666] border border-[#E5E5E5] rounded-lg hover:bg-[#F5F5F5]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Lessons List */}
        {curriculum.lessons.length === 0 ? (
          <div className="text-center py-8 bg-[#F9F9F9] rounded-lg border border-[#E5E5E5]">
            <p className="text-[#666666]">No lessons yet. Add your first lesson to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
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
                          <h3 className="text-base font-medium text-[#3C3C3C]">
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLesson(lesson.id);
                      }}
                      className="text-red-500 hover:text-red-700 font-medium text-sm ml-4"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {expandedLessons.has(lesson.id) && (
                    <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
                      {/* Materials */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-[#3C3C3C]">
                            Materials ({lesson.materials.length})
                          </h4>
                          <button
                            onClick={() => {
                              setCurrentLessonId(lesson.id);
                              setShowMaterialModal(true);
                            }}
                            className="text-xs font-medium text-[#20B2AA] hover:underline"
                          >
                            + Add Material
                          </button>
                        </div>

                        {lesson.materials.length === 0 ? (
                          <p className="text-sm text-[#999999]">No materials added yet</p>
                        ) : (
                          <div className="space-y-2">
                            {lesson.materials.map((material) => (
                              <div
                                key={material.id}
                                className="flex items-center justify-between p-2 bg-[#F9F9F9] rounded border border-[#E5E5E5] text-sm"
                              >
                                <div>
                                  <span className="font-medium text-[#3C3C3C]">
                                    {material.title}
                                  </span>
                                  <span className="ml-2 text-xs text-[#999999]">
                                    ({material.type})
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    removeMaterial(lesson.id, material.id)
                                  }
                                  className="text-red-500 hover:text-red-700 text-xs font-medium"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Material Modal */}
      {showMaterialModal && currentLessonId && (
        <Modal onClose={() => setShowMaterialModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-[#3C3C3C] mb-4">
              Add Material to Lesson
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                  Material Title
                </label>
                <TextInput
                  type="text"
                  placeholder="e.g., Chapter 3 Reading"
                  value={materialForm.title}
                  onChange={(e) =>
                    setMaterialForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                  Material Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B2AA]"
                  value={materialForm.type}
                  onChange={(e) =>
                    setMaterialForm((prev) => ({
                      ...prev,
                      type: e.target.value as any,
                    }))
                  }
                >
                  <option value="document">Document</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="link">Link</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                  URL / Link (optional)
                </label>
                <TextInput
                  type="text"
                  placeholder="https://example.com"
                  value={materialForm.url || ''}
                  onChange={(e) =>
                    setMaterialForm((prev) => ({
                      ...prev,
                      url: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => addMaterialToLesson(currentLessonId)}
              >
                Add Material
              </Button>
              <button
                onClick={() => setShowMaterialModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-[#666666] border border-[#E5E5E5] rounded-lg hover:bg-[#F5F5F5]"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Actions */}
      <div className="flex gap-4 justify-end pt-8 border-t border-[#E5E5E5]">
        <button
          onClick={onCancel}
          className="px-6 py-3 text-sm font-medium text-[#666666] border border-[#E5E5E5] rounded-lg hover:bg-[#F5F5F5]"
        >
          Cancel
        </button>
        <Button onClick={handleSubmit}>
          {initialData ? 'Update Curriculum' : 'Save Curriculum'}
        </Button>
      </div>
    </div>
  );
}
