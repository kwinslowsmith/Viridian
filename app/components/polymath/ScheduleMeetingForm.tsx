'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody, TextInput } from './index';

interface MeetingFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  zoomUrl: string;
  location: string;
}

interface ScheduleMeetingFormProps {
  onSubmit: (data: MeetingFormData) => void;
  onCancel: () => void;
}

export function ScheduleMeetingForm({
  onSubmit,
  onCancel,
}: ScheduleMeetingFormProps) {
  const [formData, setFormData] = useState<MeetingFormData>({
    title: '',
    description: '',
    date: getDefaultDate(),
    time: getDefaultTime(),
    zoomUrl: '',
    location: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function getDefaultDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  function getDefaultTime() {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Meeting title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    if (formData.zoomUrl && !isValidUrl(formData.zoomUrl)) {
      newErrors.zoomUrl = 'Please enter a valid URL or Zoom link';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function isValidUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSubmit(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          title: '',
          description: '',
          date: getDefaultDate(),
          time: getDefaultTime(),
          zoomUrl: '',
          location: '',
        });
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#3C3C3C] mb-2">
          Schedule Meeting
        </h1>
        <p className="text-[#666666]">
          Create a new meeting for your community
        </p>
      </div>

      <Card>
        <CardBody>
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                Meeting Title *
              </label>
              <TextInput
                type="text"
                placeholder="Meeting title"
                value={formData.title}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, title: e.target.value }));
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                }}
                maxLength={100}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-[#999999]">
                  {formData.title.length}/100
                </p>
                {errors.title && (
                  <p className="text-xs text-red-500">{errors.title}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B2AA] resize-none"
                placeholder="Describe the meeting..."
                rows={3}
                value={formData.description}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }));
                  if (errors.description)
                    setErrors((prev) => ({ ...prev, description: '' }));
                }}
                maxLength={500}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-[#999999]">
                  {formData.description.length}/500
                </p>
                {errors.description && (
                  <p className="text-xs text-red-500">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B2AA]"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B2AA]"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, time: e.target.value }))
                  }
                  step="900"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                Location
              </label>
              <TextInput
                type="text"
                placeholder="Conference room or address"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>

            {/* Zoom URL */}
            <div>
              <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                Zoom URL
              </label>
              <TextInput
                type="text"
                placeholder="https://zoom.us/j/..."
                value={formData.zoomUrl}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    zoomUrl: e.target.value,
                  }));
                  if (errors.zoomUrl)
                    setErrors((prev) => ({ ...prev, zoomUrl: '' }));
                }}
              />
              {errors.zoomUrl && (
                <p className="text-xs text-red-500 mt-1">{errors.zoomUrl}</p>
              )}
            </div>

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-[#DCFCE7] border border-[#86EFAC] rounded">
                <p className="text-sm text-[#166534] font-medium">
                  ✓ Meeting scheduled successfully!
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-end pt-4 border-t border-[#E5E5E5]">
              <button
                onClick={onCancel}
                className="px-6 py-2.5 text-sm font-medium text-[#666666] border border-[#E5E5E5] rounded-lg hover:bg-[#F5F5F5]"
              >
                Cancel
              </button>
              <Button onClick={handleSubmit} disabled={loading || success}>
                {success ? '✓ Scheduled!' : loading ? 'Scheduling...' : 'Schedule Meeting'}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
