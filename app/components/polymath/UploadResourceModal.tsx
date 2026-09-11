'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { TextInput, TextArea } from './TextInput';
import { Select } from './Select';

interface UploadResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resource: ResourceFormData) => Promise<void>;
  communitySlug: string;
}

export interface ResourceFormData {
  title: string;
  type: 'lesson' | 'material' | 'article' | 'video' | 'rubric';
  description: string;
  file?: File;
  fileUrl?: string;
}

const typeOptions = [
  { value: 'lesson', label: 'Lesson Plan' },
  { value: 'material', label: 'Material' },
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
  { value: 'rubric', label: 'Rubric' },
];

export const UploadResourceModal: React.FC<UploadResourceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  communitySlug,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ResourceFormData>({
    title: '',
    type: 'lesson',
    description: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({
        ...prev,
        file: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ title: '', type: 'lesson', description: '' });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload resource');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Resource">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-[#7F1D1D] text-sm">
            {error}
          </div>
        )}

        <TextInput
          label="Resource Title *"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Romeo & Juliet Teaching Guide"
          required
        />

        <Select
          label="Resource Type *"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={typeOptions}
        />

        <TextArea
          label="Description *"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe what this resource contains..."
          rows={3}
          required
        />

        <div>
          <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
            Attach File (optional)
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg text-sm"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp4,.mov,.webm"
          />
          <p className="text-xs text-[#666666] mt-1">
            Supported: PDF, Word, Excel, PowerPoint, video files (max 50MB)
          </p>
        </div>

        <div className="flex gap-3 pt-4 border-t border-[#E5E5E5]">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !formData.title || !formData.description}
            isLoading={isLoading}
          >
            Upload Resource
          </Button>
        </div>
      </form>
    </Modal>
  );
};
