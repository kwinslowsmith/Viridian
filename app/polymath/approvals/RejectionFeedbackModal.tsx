'use client';

import React, { useState } from 'react';
import { PolymathButton } from '@/app/components/PolymathButton';

interface RejectionFeedbackModalProps {
  articleTitle: string;
  onSubmit: (feedback: string) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
}

export default function RejectionFeedbackModal({
  articleTitle,
  onSubmit,
  onClose,
  isSubmitting = false,
}: RejectionFeedbackModalProps) {
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedback.trim()) {
      setError('Please provide feedback before rejecting');
      return;
    }

    try {
      setError(null);
      await onSubmit(feedback);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject article');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="border-b border-[#B8A899]/20 px-6 py-4">
          <h2 className="text-lg font-bold text-[#3C3C3C]">Reject Article</h2>
          <p className="text-sm text-[#B8A899] mt-1 line-clamp-1">{articleTitle}</p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#3C3C3C] mb-2">
              Feedback for Author
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Explain why this article needs revision or why it doesn't meet the criteria..."
              className="w-full px-4 py-3 border border-[#B8A899]/20 rounded-lg text-sm text-[#3C3C3C] placeholder-[#B8A899]/50 focus:outline-none focus:border-[#8B3A3A] focus:ring-1 focus:ring-[#8B3A3A]/20 resize-none"
              rows={6}
              disabled={isSubmitting}
            />
            <p className="text-xs text-[#B8A899] mt-2">
              This feedback will be sent to the author to help them improve their submission.
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-3">
            <PolymathButton
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </PolymathButton>
            <PolymathButton
              variant="primary"
              size="sm"
              type="submit"
              disabled={isSubmitting || !feedback.trim()}
              className="flex-1"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Rejecting...
                </span>
              ) : (
                'Reject'
              )}
            </PolymathButton>
          </div>
        </form>
      </div>
    </div>
  );
}
