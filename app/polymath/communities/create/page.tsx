'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, TextInput, TextArea } from '@/app/components/polymath';

export default function CreateCommunityPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'name') {
      setFormData((prev) => ({
        ...prev,
        slug: value.toLowerCase().replace(/\s+/g, '-').slice(0, 50),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to create community');
      }

      const data = await res.json();
      router.push(`/polymath/communities/${data.community.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-[#3C3C3C] mb-8">
        Create a Community
      </h1>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-[#3C3C3C]">
            New Community Details
          </h2>
        </CardHeader>
        <CardBody>
          {error && (
            <div className="mb-6 p-4 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-[#7F1D1D]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
              label="Community Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Boston K-8 Curriculum"
              required
            />

            <div>
              <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
                Community Slug
              </label>
              <div className="px-4 py-2 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-[#666666]">
                {formData.slug || 'auto-generated-from-name'}
              </div>
              <p className="text-xs text-[#666666] mt-1">
                URL-friendly identifier (auto-generated)
              </p>
            </div>

            <TextArea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your community and its purpose..."
              rows={4}
            />

            <div className="flex gap-4 pt-6 border-t border-[#E5E5E5]">
              <Button
                type="button"
                variant="secondary"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!formData.name || isLoading}
                isLoading={isLoading}
              >
                Create Community
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
