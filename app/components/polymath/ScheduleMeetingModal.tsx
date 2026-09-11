'use client';

import React, { useState } from 'react';
import { Modal, Button, TextInput, TextArea, Select } from './index';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (meeting: MeetingFormData) => Promise<void>;
  communitySlug: string;
}

export interface MeetingFormData {
  title: string;
  description: string;
  dateTime: string;
  durationMinutes: number;
  zoomUrl?: string;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  communitySlug,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<MeetingFormData>({
    title: '',
    description: '',
    dateTime: '',
    durationMinutes: 60,
    zoomUrl: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'durationMinutes' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Meeting title is required');
      return;
    }

    if (!formData.dateTime) {
      setError('Date and time are required');
      return;
    }

    if (formData.durationMinutes < 15 || formData.durationMinutes > 480) {
      setError('Duration must be between 15 and 480 minutes');
      return;
    }

    const meetingDateTime = new Date(formData.dateTime);
    const now = new Date();
    if (meetingDateTime < now) {
      setError('Meeting time must be in the future');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        title: '',
        description: '',
        dateTime: '',
        durationMinutes: 60,
        zoomUrl: '',
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule meeting');
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum datetime (now)
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule a Meeting">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-[#7F1D1D] text-sm">
            {error}
          </div>
        )}

        <TextInput
          label="Meeting Title *"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Curriculum Planning Session"
          required
        />

        <TextArea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the agenda or topics to discuss..."
          rows={3}
        />

        <TextInput
          label="Date & Time *"
          name="dateTime"
          type="datetime-local"
          value={formData.dateTime}
          onChange={handleChange}
          min={minDateTime}
          required
        />

        <Select
          label="Duration"
          name="durationMinutes"
          value={formData.durationMinutes.toString()}
          onChange={handleChange}
          options={[
            { value: '15', label: '15 minutes' },
            { value: '30', label: '30 minutes' },
            { value: '45', label: '45 minutes' },
            { value: '60', label: '1 hour' },
            { value: '90', label: '1.5 hours' },
            { value: '120', label: '2 hours' },
            { value: '180', label: '3 hours' },
          ]}
        />

        <TextInput
          label="Zoom URL (optional)"
          name="zoomUrl"
          type="url"
          value={formData.zoomUrl || ''}
          onChange={handleChange}
          placeholder="https://zoom.us/j/..."
          helperText="Participants will see this link"
        />

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
            disabled={isLoading || !formData.title || !formData.dateTime}
            isLoading={isLoading}
          >
            Schedule Meeting
          </Button>
        </div>
      </form>
    </Modal>
  );
};
