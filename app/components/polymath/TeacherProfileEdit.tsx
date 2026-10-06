'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody, TextInput, Checkbox } from './index';

interface TeacherProfileEditData {
  name: string;
  bio: string;
  expertise: string[];
}

interface TeacherProfileEditProps {
  initialData: TeacherProfileEditData;
  onSubmit: (data: TeacherProfileEditData) => void;
  onCancel: () => void;
}

const expertiseOptions = [
  'English Language Arts',
  'Mathematics',
  'Science',
  'Social Studies',
  'History',
  'Foreign Language',
  'Arts & Music',
  'Physical Education',
  'STEM',
  'Special Education',
  'Early Childhood',
  'Secondary',
];

export function TeacherProfileEdit({
  initialData,
  onSubmit,
  onCancel,
}: TeacherProfileEditProps) {
  const [formData, setFormData] = useState<TeacherProfileEditData>(initialData);
  const [saving, setSaving] = useState(false);

  const toggleExpertise = (expertise: string) => {
    setFormData((prev) => {
      const newExpertise = prev.expertise.includes(expertise)
        ? prev.expertise.filter((e) => e !== expertise)
        : [...prev.expertise, expertise];
      return { ...prev, expertise: newExpertise };
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Please enter your name');
      return;
    }

    setSaving(true);
    try {
      onSubmit(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#3C3C3C] mb-2">
          Edit Profile
        </h1>
        <p className="text-[#666666]">
          Update your information and teaching expertise
        </p>
      </div>

      {/* Basic Info */}
      <Card className="mb-6">
        <CardBody>
          <h2 className="text-lg font-bold text-[#3C3C3C] mb-4">
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                Full Name *
              </label>
              <TextInput
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                Bio
              </label>
              <textarea
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B2AA]"
                placeholder="Tell the community about yourself, your teaching philosophy, or focus areas..."
                rows={4}
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
              />
              <p className="text-xs text-[#999999] mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Expertise */}
      <Card className="mb-6">
        <CardBody>
          <h2 className="text-lg font-bold text-[#3C3C3C] mb-4">
            Teaching Expertise
          </h2>
          <p className="text-sm text-[#666666] mb-4">
            Select the subjects and grade levels you teach
          </p>

          <div className="grid grid-cols-2 gap-4">
            {expertiseOptions.map((expertise) => (
              <label
                key={expertise}
                className="flex items-center gap-3 p-3 border border-[#E5E5E5] rounded-lg cursor-pointer hover:bg-[#F9F9F9]"
              >
                <input
                  type="checkbox"
                  checked={formData.expertise.includes(expertise)}
                  onChange={() => toggleExpertise(expertise)}
                  className="w-4 h-4 rounded border-[#E5E5E5]"
                />
                <span className="text-sm text-[#3C3C3C]">{expertise}</span>
              </label>
            ))}
          </div>

          {formData.expertise.length === 0 && (
            <div className="mt-4 p-3 bg-[#FEF3C7] border border-[#FBBF24] rounded">
              <p className="text-sm text-[#92400E]">
                Select at least one area of expertise so other teachers can find
                you
              </p>
            </div>
          )}

          {formData.expertise.length > 0 && (
            <div className="mt-4 p-3 bg-[#DBEAFE] border border-[#BFDBFE] rounded">
              <p className="text-sm text-[#1E40AF] font-medium">
                ✓ {formData.expertise.length} expertise area
                {formData.expertise.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={onCancel}
          className="px-6 py-3 text-sm font-medium text-[#666666] border border-[#E5E5E5] rounded-lg hover:bg-[#F5F5F5]"
        >
          Cancel
        </button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
}
