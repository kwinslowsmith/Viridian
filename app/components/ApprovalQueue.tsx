'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PolymathButton } from './PolymathButton';
import { StatusBadge } from './StatusBadge';
import { ApprovalProgressBar } from './ApprovalProgressBar';

interface PendingItem {
  id: string;
  title: string;
  type: 'article' | 'module' | 'tool' | 'collection';
  submittedBy: {
    name: string;
    email: string;
  };
  submittedAt: string;
  status: 'pending_approval' | 'changes_requested';
  approvalChain?: string[];
  approvedBy?: string[];
  totalApprovers?: number;
  approvedCount?: number;
}

interface ApprovalQueueProps {
  organizationId?: string;
  communityId?: string;
  onApprove?: (itemId: string) => void;
  onReject?: (itemId: string, feedback: string) => void;
  pollingIntervalMs?: number;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  organizationId,
  communityId,
  onApprove,
  onReject,
  pollingIntervalMs = 5000,
}) => {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [rejectFeedback, setRejectFeedback] = useState<Record<string, string>>({});
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // Fetch approval queue
  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for now - replace with actual API call
      const mockItems: PendingItem[] = [
        {
          id: '1',
          title: 'Advanced Python Patterns',
          type: 'article',
          submittedBy: { name: 'John Doe', email: 'john@example.com' },
          submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'pending_approval',
          totalApprovers: 2,
          approvedCount: 1,
          approvedBy: ['Sarah Chen'],
          approvalChain: ['Sarah Chen', 'Tom Johnson'],
        },
        {
          id: '2',
          title: 'Machine Learning Fundamentals',
          type: 'module',
          submittedBy: { name: 'Jane Smith', email: 'jane@example.com' },
          submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: 'pending_approval',
          totalApprovers: 1,
          approvedCount: 0,
          approvalChain: ['Maria Garcia'],
        },
        {
          id: '3',
          title: 'Data Visualization Best Practices',
          type: 'article',
          submittedBy: { name: 'Bob Wilson', email: 'bob@example.com' },
          submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'changes_requested',
          totalApprovers: 2,
          approvedCount: 0,
          approvalChain: ['Sarah Chen', 'Tom Johnson'],
        },
      ];

      setItems(mockItems);
    } catch (err) {
      setError('Failed to load approval queue');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, communityId]);

  // Initial fetch
  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Polling
  useEffect(() => {
    const interval = setInterval(fetchQueue, pollingIntervalMs);
    return () => clearInterval(interval);
  }, [fetchQueue, pollingIntervalMs]);

  const handleApprove = async (itemId: string) => {
    try {
      setActionLoading({ ...actionLoading, [itemId]: true });

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local state
      setItems(items.map((item) => (item.id === itemId ? { ...item, status: 'pending_approval' } : item)));

      onApprove?.(itemId);

      // Refresh queue
      await fetchQueue();
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setActionLoading({ ...actionLoading, [itemId]: false });
    }
  };

  const handleReject = async (itemId: string, feedback: string) => {
    if (!feedback.trim()) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [itemId]: true });

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Remove from queue
      setItems(items.filter((item) => item.id !== itemId));

      onReject?.(itemId, feedback);

      setShowRejectModal(null);
      setRejectFeedback({ ...rejectFeedback, [itemId]: '' });

      // Refresh queue
      await fetchQueue();
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setActionLoading({ ...actionLoading, [itemId]: false });
    }
  };

  const toggleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const submitted = new Date(date);
    const diff = now.getTime() - submitted.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-[#B8A899]">Loading approval queue...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-lg text-center">
        ✓ All caught up! No pending items awaiting approval.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#3C3C3C]">
          Approval Queue ({items.length} pending)
        </h2>
        <PolymathButton
          variant="tertiary"
          size="sm"
          onClick={fetchQueue}
        >
          🔄 Refresh
        </PolymathButton>
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-[#B8A899]/20 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex gap-4">
              {/* Checkbox */}
              <div className="flex-shrink-0 pt-1">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleSelectItem(item.id)}
                  className="w-4 h-4 rounded"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#3C3C3C] text-sm">{item.title}</h3>
                    <p className="text-xs text-[#B8A899]">
                      Submitted by {item.submittedBy.name} {formatTimeAgo(item.submittedAt)}
                    </p>
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                {/* Type and submitted info */}
                <div className="text-xs text-[#B8A899] mb-3 space-y-1">
                  <p>
                    <span className="font-medium">Type:</span> {item.type}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {item.submittedBy.email}
                  </p>
                </div>

                {/* Approval progress */}
                {item.approvalChain && item.approvalChain.length > 0 && (
                  <div className="bg-[#F5F3F0] rounded p-3 mb-3">
                    <ApprovalProgressBar
                      totalApprovers={item.totalApprovers || item.approvalChain.length}
                      approvedCount={item.approvedCount || 0}
                      approverNames={item.approvalChain}
                    />
                  </div>
                )}

                {/* Reject feedback form (if showing) */}
                {showRejectModal === item.id && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-3 space-y-2">
                    <label className="block text-sm font-medium text-[#3C3C3C]">
                      Feedback for author
                    </label>
                    <textarea
                      value={rejectFeedback[item.id] || ''}
                      onChange={(e) =>
                        setRejectFeedback({ ...rejectFeedback, [item.id]: e.target.value })
                      }
                      placeholder="Explain what needs to be changed..."
                      className="w-full px-3 py-2 border border-red-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 ml-8">
              <PolymathButton
                variant="primary"
                size="sm"
                onClick={() => handleApprove(item.id)}
                disabled={actionLoading[item.id]}
              >
                {actionLoading[item.id] ? '⏳' : '✓'} Approve
              </PolymathButton>

              {showRejectModal === item.id ? (
                <>
                  <PolymathButton
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      handleReject(
                        item.id,
                        rejectFeedback[item.id] || ''
                      )
                    }
                    disabled={
                      actionLoading[item.id] ||
                      !rejectFeedback[item.id]?.trim()
                    }
                  >
                    {actionLoading[item.id] ? '⏳' : '✗'} Confirm Reject
                  </PolymathButton>
                  <PolymathButton
                    variant="tertiary"
                    size="sm"
                    onClick={() => setShowRejectModal(null)}
                  >
                    Cancel
                  </PolymathButton>
                </>
              ) : (
                <>
                  <PolymathButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowRejectModal(item.id)}
                  >
                    Request Changes
                  </PolymathButton>
                  <PolymathButton
                    variant="tertiary"
                    size="sm"
                  >
                    View
                  </PolymathButton>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bulk actions (if items selected) */}
      {selectedItems.size > 0 && (
        <div className="border-t border-[#B8A899]/20 pt-4 flex items-center gap-2">
          <span className="text-sm text-[#B8A899]">
            {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
          </span>
          <PolymathButton
            variant="secondary"
            size="sm"
            onClick={() => {
              selectedItems.forEach((id) => handleApprove(id));
              setSelectedItems(new Set());
            }}
          >
            Approve Selected
          </PolymathButton>
          <PolymathButton
            variant="tertiary"
            size="sm"
            onClick={() => setSelectedItems(new Set())}
          >
            Deselect All
          </PolymathButton>
        </div>
      )}
    </div>
  );
};
