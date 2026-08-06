'use client';

import React, { useState, useEffect } from 'react';
import { PolymathButton } from './PolymathButton';
import { StatusBadge } from './StatusBadge';
import { CredibilityBadge } from './CredibilityBadge';
import { ContentForm } from './ContentForm';
import { Toast } from './Toast';
import { validateIndividualArticle, hasErrors, FormErrors } from '@/lib/polymath/form-validation';

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
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Determine which tiers are available based on user credentials
  const tierOptions: TierType[] = ['introduction', 'intermediate', 'expert'];
  const isTierAvailable = (tier: TierType) => {
    if (tier === 'introduction') return true;
    if (tier === 'intermediate' && userCredentials.length >= 1) return true;
    if (tier === 'expert' && userCredentials.length >= 2) return true;
    return false;
  };

  // Validate form on field change
  const validateForm = (data: FormData) => {
    return validateIndividualArticle({
      title: data.title,
      content: data.content,
      tier: data.tier,
      tags: data.tags,
    });
  };

  // Handle field blur - validate and mark as touched
  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields((prev) => new Set(prev).add(fieldName));
    const newErrors = validateForm(formData);
    setErrors(newErrors);
  };

  // Handle field change with debounced validation
  const handleFieldChange = (field: keyof FormData, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Validate only if field has been touched
    if (touchedFields.has(field)) {
      const newErrors = validateForm(newFormData);
      setErrors(newErrors);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = formData.tagInput.trim();

    if (!trimmedTag) {
      setToast({ message: 'Tag cannot be empty', type: 'error' });
      return;
    }

    if (formData.tags.length >= 5) {
      setToast({ message: 'Maximum 5 tags allowed', type: 'error' });
      return;
    }

    if (formData.tags.includes(trimmedTag)) {
      setToast({ message: 'This tag is already added', type: 'error' });
      return;
    }

    handleFieldChange('tags', [...formData.tags, trimmedTag]);
    handleFieldChange('tagInput', '');
  };

  const handleRemoveTag = (idx: number) => {
    handleFieldChange('tags', formData.tags.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouchedFields(new Set(['title', 'content', 'tier']));

    // Validate form
    const formErrors = validateForm(formData);
    setErrors(formErrors);

    if (hasErrors(formErrors)) {
      setToast({
        message: 'Please fix validation errors before submitting',
        type: 'error',
      });
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmedSubmit = async () => {
    setShowConfirmDialog(false);

    try {
      setStatus('loading');
      setErrorMessage('');

      const response = await fetch('/api/polymath/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-User-Id': userId,
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          authorType: 'individual',
          authorId: userId,
          tier: formData.tier,
          tags: formData.tags,
          visibility: 'public',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to publish post');
      }

      const post = await response.json();
      setStatus('success');

      // Show success toast
      setToast({
        message: 'Article published successfully!',
        type: 'success',
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        tier: 'introduction',
        tags: [],
        tagInput: '',
      });
      setErrors({});
      setTouchedFields(new Set());

      onSuccess?.(post.id);

      // Clear success message after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An error occurred while publishing';
      setErrorMessage(errorMsg);
      setStatus('error');
      setToast({
        message: errorMsg,
        type: 'error',
      });
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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
            onChange={(e) => handleFieldChange('title', e.target.value)}
            onBlur={() => handleFieldBlur('title')}
            placeholder="Give your article a compelling title"
            className={`w-full px-4 py-2 border rounded-lg font-sans text-sm text-[#3C3C3C] placeholder-[#B8A899] focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
              touchedFields.has('title') && errors.title
                ? 'border-red-300 focus:ring-red-300 bg-red-50'
                : 'border-[#B8A899]/20 focus:ring-[#8B3A3A]'
            }`}
            maxLength={200}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-[#B8A899]">{formData.title.length}/200 characters</p>
            {touchedFields.has('title') && errors.title && (
              <p className="text-xs text-red-600 font-medium">✕ {errors.title}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-[#3C3C3C] mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <div className={`rounded-lg overflow-hidden border ${
            touchedFields.has('content') && errors.content
              ? 'border-red-300 bg-red-50'
              : 'border-[#B8A899]/20'
          }`}>
            <ContentForm
              value={formData.content}
              onChange={(content) => handleFieldChange('content', content)}
              onBlur={() => handleFieldBlur('content')}
              placeholder="Write your article content here. Support for markdown formatting..."
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-[#B8A899]">{formData.content.length} characters</p>
            {touchedFields.has('content') && errors.content && (
              <p className="text-xs text-red-600 font-medium">✕ {errors.content}</p>
            )}
          </div>
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
                  onChange={(e) => {
                    handleFieldChange('tier', e.target.value as TierType);
                    handleFieldBlur('tier');
                  }}
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
          {touchedFields.has('tier') && errors.tier && (
            <p className="text-xs text-red-600 font-medium mt-2">✕ {errors.tier}</p>
          )}
          <p className="text-xs text-[#B8A899] mt-2">
            💡 Your tier determines visibility to relevant audiences
          </p>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-[#3C3C3C] mb-2">
            Tags <span className="text-[#B8A899] font-normal">({formData.tags.length}/5)</span>
          </label>
          <div className="flex gap-2 mb-3">
            <input
              id="tags"
              type="text"
              value={formData.tagInput}
              onChange={(e) => handleFieldChange('tagInput', e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              disabled={formData.tags.length >= 5}
              placeholder={formData.tags.length >= 5 ? 'Maximum tags reached' : 'Type tag and press Enter'}
              className={`flex-1 px-4 py-2 border rounded-lg font-sans text-sm text-[#3C3C3C] placeholder-[#B8A899] focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                formData.tags.length >= 5
                  ? 'border-[#B8A899]/20 bg-gray-50 cursor-not-allowed'
                  : 'border-[#B8A899]/20 focus:ring-[#8B3A3A]'
              }`}
            />
            <PolymathButton
              variant="secondary"
              size="md"
              onClick={handleAddTag}
              type="button"
              disabled={formData.tags.length >= 5}
            >
              Add
            </PolymathButton>
          </div>

          {/* Tag list */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, idx) => (
                <div
                  key={idx}
                  className="bg-[#8B3A3A]/10 border border-[#8B3A3A]/30 text-[#8B3A3A] text-sm px-3 py-1.5 rounded-full flex items-center gap-2 hover:border-[#8B3A3A]/50 transition-colors"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="hover:text-red-600 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {status === 'error' && errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg flex items-start gap-2">
            <span className="text-lg">✕</span>
            <div className="flex-1">
              <p className="font-medium mb-1">Error Publishing Article</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <PolymathButton
            type="submit"
            variant="primary"
            size="lg"
            isFullWidth
            disabled={status === 'loading' || hasErrors(errors)}
          >
            {status === 'loading' ? '⏳ Publishing...' : '✓ Publish Now'}
          </PolymathButton>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[#3C3C3C] mb-2">Publish Article?</h3>
                <p className="text-sm text-[#B8A899]">
                  Your article will be published immediately and visible to the public based on your selected tier.
                </p>
              </div>

              <div className="bg-[#F5F3F0] rounded-lg p-3 text-sm text-[#3C3C3C]">
                <p className="font-medium mb-2">Preview:</p>
                <p className="line-clamp-2">{formData.title}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-4 py-2 border border-[#B8A899]/20 rounded-lg text-[#3C3C3C] font-medium hover:bg-[#F5F3F0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmedSubmit}
                  className="flex-1 px-4 py-2 bg-[#8B3A3A] text-white rounded-lg font-medium hover:bg-[#6B2A2A] transition-colors"
                >
                  Publish
                </button>
              </div>
            </div>
          </div>
        )}

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
    </>
  );
};
