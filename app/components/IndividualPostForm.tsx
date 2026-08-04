'use client';

import React, { useState } from 'react';
import { PolymathButton } from './PolymathButton';
import { StatusBadge } from './StatusBadge';
import { CredibilityBadge } from './CredibilityBadge';
import { ContentForm } from './ContentForm';

interface IndividualPostFormProps {
  userId: string;
  userName?: string;
  userAvatar?: string;
  userTier?: 'Expert' | 'Intermediate' | 'Beginner';
  userCredentials?: string[];
  onSuccess?: (postId: string) => void;
}

type TierType = 'introduction' | 'intermediate' | 'expert';

interface FormData {
  title: string;
  content: string;
  tier: TierType;
  tags: string[];
  tagInput: string;
}

export const IndividualPostForm: React.FC<IndividualPostFormProps> = ({
  userId,
  userName = 'You',
  userAvatar = '👤',
  userTier = 'Intermediate',
  userCredentials = [],
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    tier: 'introduction',
    tags: [],
    tagInput: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Determine which tiers are available based on user credentials
  const tierOptions: TierType[] = ['introduction', 'intermediate', 'expert'];
  const isTierAvailable = (tier: TierType) => {
    if (tier === 'introduction') return true;
    if (tier === 'intermediate' && userCredentials.length >= 1) return true;
    if (tier === 'expert' && userCredentials.length >= 2) return true;
    return false;
  };

  const handleAddTag = () => {
    if (formData.tagInput.trim() && formData.tags.length < 5) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: '',
      });
    }
  };

  const handleRemoveTag = (idx: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== idx),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setErrorMessage('Please fill in all required fields');
      setStatus('error');
      return;
    }

    try {
      setStatus('loading');
      setErrorMessage('');

      const response = await fetch('/api/polymath/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          authorType: 'user',
          authorId: userId,
          tier: formData.tier,
          tags: formData.tags,
          status: 'published',
          visibility: 'public',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to publish post');
      }

      const post = await response.json();
      setStatus('success');

      // Reset form
      setFormData({
        title: '',
        content: '',
        tier: 'introduction',
        tags: [],
        tagInput: '',
      });

      onSuccess?.(post.id);

      // Clear success message after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      setStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with credentials */}
      <div className="bg-[#F5F3F0] border border-[#B8A899]/20 rounded-lg p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{userAvatar}</span>
            <div>
              <h3 className="font-semibold text-[#3C3C3C]">{userName}</h3>
              <p className="text-xs text-[#B8A899]">Personal Article</p>
            </div>
          </div>
          <StatusBadge authorType="individual" size="sm" />
        </div>

        {/* Credentials info */}
        {userCredentials.length > 0 && (
          <div className="text-xs text-[#B8A899] space-y-1">
            <p className="font-medium">✓ {userCredentials.join(', ')}</p>
          </div>
        )}
      </div>

      {/* Credibility Badge */}
      <CredibilityBadge authorType="individual" authorId={userId} compact={false} />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-[#3C3C3C] mb-2">
            Article Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Give your article a compelling title"
            className="w-full px-4 py-2 border border-[#B8A899]/20 rounded-lg font-sans text-sm text-[#3C3C3C] placeholder-[#B8A899] focus:outline-none focus:ring-2 focus:ring-[#8B3A3A] focus:border-transparent"
            maxLength={200}
          />
          <p className="text-xs text-[#B8A899] mt-1">{formData.title.length}/200 characters</p>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-[#3C3C3C] mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <ContentForm
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder="Write your article content here. Support for markdown formatting..."
          />
        </div>

        {/* Tier Selector */}
        <div>
          <label htmlFor="tier" className="block text-sm font-medium text-[#3C3C3C] mb-2">
            Content Level <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {tierOptions.map((tier) => (
              <label key={tier} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="tier"
                  value={tier}
                  checked={formData.tier === tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value as TierType })}
                  disabled={!isTierAvailable(tier)}
                  className="w-4 h-4"
                />
                <span className="capitalize text-[#3C3C3C]">
                  {tier === 'introduction' && '🎯 Introduction'}
                  {tier === 'intermediate' && '📚 Intermediate'}
                  {tier === 'expert' && '⭐ Expert'}
                </span>
                {!isTierAvailable(tier) && (
                  <span className="text-xs text-[#B8A899] italic">(Need credentials)</span>
                )}
              </label>
            ))}
          </div>
          <p className="text-xs text-[#B8A899] mt-2">
            💡 Your tier determines visibility to relevant audiences
          </p>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-[#3C3C3C] mb-2">
            Tags (Max 5)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              id="tags"
              type="text"
              value={formData.tagInput}
              onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Type tag and press Enter"
              className="flex-1 px-4 py-2 border border-[#B8A899]/20 rounded-lg font-sans text-sm text-[#3C3C3C] placeholder-[#B8A899] focus:outline-none focus:ring-2 focus:ring-[#8B3A3A] focus:border-transparent"
            />
            <PolymathButton variant="secondary" size="md" onClick={handleAddTag} type="button">
              Add
            </PolymathButton>
          </div>

          {/* Tag list */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, idx) => (
                <div
                  key={idx}
                  className="bg-[#8B3A3A]/10 border border-[#8B3A3A]/30 text-[#8B3A3A] text-sm px-3 py-1.5 rounded-full flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Success Message */}
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg flex items-center gap-2">
            <span>✓ Published!</span>
            <span className="text-xs">Your article is now live.</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <PolymathButton
            type="submit"
            variant="primary"
            size="lg"
            isFullWidth
            disabled={status === 'loading'}
          >
            {status === 'loading' ? '⏳ Publishing...' : '✓ Publish Now'}
          </PolymathButton>
        </div>

        {/* Info text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
          <p className="font-medium mb-1">📋 Publishing your article:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-600">
            <li>Your article will be published immediately</li>
            <li>You can edit or delete it anytime</li>
            <li>It will be visible to the public based on your tier</li>
          </ul>
        </div>
      </form>
    </div>
  );
};
