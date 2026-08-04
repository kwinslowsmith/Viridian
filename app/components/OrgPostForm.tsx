'use client';

import React, { useState, useEffect } from 'react';
import { PolymathButton } from './PolymathButton';
import { StatusBadge } from './StatusBadge';
import { ApprovalProgressBar } from './ApprovalProgressBar';
import { ContentForm } from './ContentForm';

interface OrgAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface OrgPostFormProps {
  organizationId: string;
  organizationName?: string;
  organizationLogo?: string;
  isVerified?: boolean;
  userId: string;
  onSuccess?: (postId: string) => void;
}

type TierType = 'introduction' | 'intermediate' | 'expert';

interface FormData {
  title: string;
  content: string;
  tier: TierType;
  selectedApprovers: string[];
}

export const OrgPostForm: React.FC<OrgPostFormProps> = ({
  organizationId,
  organizationName = 'Organization',
  organizationLogo = '🏢',
  isVerified = false,
  userId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    tier: 'introduction',
    selectedApprovers: [],
  });

  const [admins, setAdmins] = useState<OrgAdmin[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showApproverDropdown, setShowApproverDropdown] = useState(false);

  // Fetch org admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoadingAdmins(true);
        // Mock data for now - replace with actual API call
        const mockAdmins: OrgAdmin[] = [
          { id: '1', name: 'Sarah Chen', email: 'sarah@org.com', role: 'org_admin' },
          { id: '2', name: 'Tom Johnson', email: 'tom@org.com', role: 'org_admin' },
          { id: '3', name: 'Maria Garcia', email: 'maria@org.com', role: 'org_owner' },
        ];
        setAdmins(mockAdmins);
      } catch (error) {
        console.error('Failed to fetch admins:', error);
      } finally {
        setLoadingAdmins(false);
      }
    };

    fetchAdmins();
  }, [organizationId]);

  const handleToggleApprover = (adminId: string) => {
    setFormData({
      ...formData,
      selectedApprovers: formData.selectedApprovers.includes(adminId)
        ? formData.selectedApprovers.filter((id) => id !== adminId)
        : [...formData.selectedApprovers, adminId],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setErrorMessage('Please fill in all required fields');
      setStatus('error');
      return;
    }

    if (formData.selectedApprovers.length === 0) {
      setErrorMessage('Please select at least one approver');
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
          authorType: 'organization',
          authorId: organizationId,
          organizationId: organizationId,
          tier: formData.tier,
          status: 'pending_approval',
          visibility: 'organization',
          approvalChain: formData.selectedApprovers,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit post');
      }

      const post = await response.json();
      setStatus('success');

      // Reset form
      setFormData({
        title: '',
        content: '',
        tier: 'introduction',
        selectedApprovers: [],
      });

      onSuccess?.(post.id);

      // Clear success message after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      setStatus('error');
    }
  };

  const selectedApproverDetails = admins.filter((admin) =>
    formData.selectedApprovers.includes(admin.id)
  );

  return (
    <div className="space-y-6">
      {/* Header with org branding */}
      <div className="bg-[#F5F3F0] border border-[#B8A899]/20 rounded-lg p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{organizationLogo}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[#3C3C3C]">{organizationName}</h3>
                {isVerified && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-[#B8A899]">Organization Content</p>
            </div>
          </div>
          <StatusBadge authorType="organization" status="pending_approval" size="sm" />
        </div>
      </div>

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
            placeholder="Give your organization article a compelling title"
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
            placeholder="Write your organization article content here..."
          />
        </div>

        {/* Tier Selector */}
        <div>
          <label htmlFor="tier" className="block text-sm font-medium text-[#3C3C3C] mb-2">
            Content Level <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="tier"
                value="introduction"
                checked={formData.tier === 'introduction'}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value as TierType })}
                className="w-4 h-4"
              />
              <span className="text-[#3C3C3C]">🎯 Introduction</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="tier"
                value="intermediate"
                checked={formData.tier === 'intermediate'}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value as TierType })}
                className="w-4 h-4"
              />
              <span className="text-[#3C3C3C]">📚 Intermediate</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="tier"
                value="expert"
                checked={formData.tier === 'expert'}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value as TierType })}
                className="w-4 h-4"
              />
              <span className="text-[#3C3C3C]">⭐ Expert</span>
            </label>
          </div>
        </div>

        {/* Approver Selector */}
        <div>
          <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
            Select Approvers <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowApproverDropdown(!showApproverDropdown)}
              className="w-full px-4 py-2 border border-[#B8A899]/20 rounded-lg font-sans text-sm text-[#3C3C3C] bg-white hover:bg-[#F5F3F0] text-left flex items-center justify-between"
            >
              <span>
                {formData.selectedApprovers.length === 0
                  ? 'Choose approvers...'
                  : `${formData.selectedApprovers.length} approver${formData.selectedApprovers.length !== 1 ? 's' : ''} selected`}
              </span>
              <span className={`transition-transform ${showApproverDropdown ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {/* Dropdown */}
            {showApproverDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B8A899]/20 rounded-lg shadow-lg z-10">
                {loadingAdmins ? (
                  <div className="p-3 text-sm text-[#B8A899] text-center">Loading admins...</div>
                ) : admins.length === 0 ? (
                  <div className="p-3 text-sm text-[#B8A899] text-center">No admins available</div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {admins.map((admin) => (
                      <label
                        key={admin.id}
                        className="flex items-center gap-3 p-3 hover:bg-[#F5F3F0] cursor-pointer border-b border-[#B8A899]/10 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={formData.selectedApprovers.includes(admin.id)}
                          onChange={() => handleToggleApprover(admin.id)}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#3C3C3C]">{admin.name}</p>
                          <p className="text-xs text-[#B8A899]">{admin.email}</p>
                        </div>
                        <span className="text-xs text-[#B8A899] bg-[#F5F3F0] px-2 py-1 rounded">
                          {admin.role === 'org_owner' ? 'Owner' : 'Admin'}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-[#B8A899] mt-2">
            💡 Selected approvers will review and approve your content
          </p>
        </div>

        {/* Approval Progress */}
        {formData.selectedApprovers.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <ApprovalProgressBar
              totalApprovers={formData.selectedApprovers.length}
              approvedCount={0}
              approverDetails={selectedApproverDetails.map((admin) => ({
                name: admin.name,
                approved: false,
              }))}
            />
          </div>
        )}

        {/* Error Message */}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Success Message */}
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg flex items-center gap-2">
            <span>⏳ Pending Approval</span>
            <span className="text-xs">Your article has been submitted for review.</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <PolymathButton
            type="submit"
            variant="primary"
            size="lg"
            isFullWidth
            disabled={status === 'loading' || formData.selectedApprovers.length === 0}
          >
            {status === 'loading' ? '⏳ Submitting...' : 'Submit for Approval'}
          </PolymathButton>
        </div>

        {/* Info text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
          <p className="font-medium mb-1">📋 Approval Process:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-600">
            <li>Your article will be submitted to selected approvers</li>
            <li>Approvers will review and approve or request changes</li>
            <li>Once all approvals are received, your article will be published</li>
            <li>You can edit it while pending approval</li>
          </ul>
        </div>
      </form>
    </div>
  );
};
