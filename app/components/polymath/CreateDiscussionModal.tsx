'use client';

import React, { useState } from 'react';
import { Modal, Button, TextInput, TextArea } from './index';

interface CreateDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (discussion: DiscussionFormData) => Promise<void>;
  communitySlug: string;
}

export interface DiscussionFormData {
  title: string;
  description: string;
  isPinned?: boolean;
}

export const CreateDiscussionModal: React.FC<CreateDiscussionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  communitySlug,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<DiscussionFormData>({
    title: '',
    description: '',
    isPinned: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
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
      setFormData({ title: '', description: '', isPinned: false });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create discussion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start a Discussion">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-[#7F1D1D] text-sm">
            {error}
          </div>
        )}

        <TextInput
          label="Discussion Title *"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="What's on your mind?"
          required
        />

        <TextArea
          label="Description *"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Share your thoughts, questions, or ideas..."
          rows={4}
          required
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPinned"
            name="isPinned"
            checked={formData.isPinned || false}
            onChange={handleChange}
            className="w-4 h-4 rounded border-[#E5E5E5]"
          />
          <label htmlFor="isPinned" className="text-sm text-[#666666]">
            Pin this discussion to the top (moderators only)
          </label>
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
            Start Discussion
          </Button>
        </div>
      </form>
    </Modal>
  );
};
