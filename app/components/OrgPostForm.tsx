'use client';

import React, { useState, useEffect } from 'react';
import { PolymathButton } from './PolymathButton';
import { StatusBadge } from './StatusBadge';
import { ApprovalProgressBar } from './ApprovalProgressBar';
import { ContentForm } from './ContentForm';
import { Toast } from './Toast';
import { validateOrgArticle, hasErrors, FormErrors } from '@/lib/polymath/form-validation';

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
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  // Validate form on field change
  const validateForm = (data: FormData) => {
    return validateOrgArticle({
      title: data.title,
      content: data.content,
      tier: data.tier,
      organizationId: organizationId,
      selectedApprovers: data.selectedApprovers,
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

  const handleToggleApprover = (adminId: string) => {
    const newApprovers = formData.selectedApprovers.includes(adminId)
      ? formData.selectedApprovers.filter((id) => id !== adminId)
      : [...formData.selectedApprovers, adminId];

    handleFieldChange('selectedApprovers', newApprovers);
    handleFieldBlur('selectedApprovers');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouchedFields(new Set(['title', 'content', 'tier', 'selectedApprovers']));

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
          authorType: 'organization',
          authorId: organizationId,
          organizationId: organizationId,
          tier: formData.tier,
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

      // Show success toast
      setToast({
        message: 'Article submitted for approval!',
        type: 'success',
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        tier: 'introduction',
        selectedApprovers: [],
      });
      setErrors({});
      setTouchedFields(new Set());

      onSuccess?.(post.id);

      // Clear success message after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An error occurred while submitting';
      setErrorMessage(errorMsg);
      setStatus('error');
      setToast({
        message: errorMsg,
        type: 'error',
      });
    }
  };

  const selectedApproverDetails = admins.filter((admin) =>
    formData.selectedApprovers.includes(admin.id)
  );

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
            onChange={(e) => handleFieldChange('title', e.target.value)}
            onBlur={() => handleFieldBlur('title')}
            placeholder="Give your organization article a compelling title"
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
              placeholder="Write your organization article content here..."
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
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="tier"
                value="introduction"
                checked={formData.tier === 'introduction'}
                onChange={(e) => {
                  handleFieldChange('tier', e.target.value as TierType);
                  handleFieldBlur('tier');
                }}
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
                onChange={(e) => {
                  handleFieldChange('tier', e.target.value as TierType);
                  handleFieldBlur('tier');
                }}
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
                onChange={(e) => {
                  handleFieldChange('tier', e.target.value as TierType);
                  handleFieldBlur('tier');
                }}
                className="w-4 h-4"
              />
              <span className="text-[#3C3C3C]">⭐ Expert</span>
            </label>
          </div>
          {touchedFields.has('tier') && errors.tier && (
            <p className="text-xs text-red-600 font-medium mt-2">✕ {errors.tier}</p>
          )}
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

          {touchedFields.has('selectedApprovers') && errors.selectedApprovers && (
            <p className="text-xs text-red-600 font-medium mt-2">✕ {errors.selectedApprovers}</p>
          )}
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
        {status === 'error' && errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg flex items-start gap-2">
            <span className="text-lg">✕</span>
            <div className="flex-1">
              <p className="font-medium mb-1">Error Submitting Article</p>
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
            {status === 'loading' ? '⏳ Submitting...' : 'Submit for Approval'}
          </PolymathButton>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[#3C3C3C] mb-2">Submit for Approval?</h3>
                <p className="text-sm text-[#B8A899]">
                  Your article will be submitted to {formData.selectedApprovers.length} approver{formData.selectedApprovers.length !== 1 ? 's' : ''} for review.
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
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

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
    </>
  );
};
