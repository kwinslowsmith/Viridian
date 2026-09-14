'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, TextInput, TextArea } from '@/app/components/polymath';
import { useCreateCommunity } from '@/hooks/usePolymath';

export default function CreateCommunityPage() {
  const router = useRouter();
  const { create, loading: isLoading, error: apiError } = useCreateCommunity();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scope: 'global' as const,
    isPublic: true,
    requiresApprovalToJoin: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const community = await create({
        name: formData.name,
        description: formData.description,
        scope: formData.scope,
        isPublic: formData.isPublic,
        requiresApprovalToJoin: formData.requiresApprovalToJoin,
      });
      router.push(`/polymath/communities/${community.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
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
          {(error || apiError) && (
            <div className="mb-6 p-4 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-[#7F1D1D]">
              {error || apiError}
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

            <TextArea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your community and its purpose..."
              rows={4}
            />

            <div className="space-y-3 p-4 bg-[#FAFAFA] rounded-lg border border-[#E5E5E5]">
              <h3 className="font-medium text-[#3C3C3C] text-sm">Visibility & Access</h3>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-[#3C3C3C]">Public (anyone can see)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="requiresApprovalToJoin"
                  checked={formData.requiresApprovalToJoin}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-[#3C3C3C]">Require approval to join</span>
              </label>
            </div>

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
                {isLoading ? 'Creating...' : 'Create Community'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
