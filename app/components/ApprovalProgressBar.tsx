'use client';

import React from 'react';

interface ApprovalProgressBarProps {
  totalApprovers: number;
  approvedCount: number;
  approverNames?: string[];
  approverDetails?: Array<{
    name: string;
    approved: boolean;
    approvedAt?: string;
  }>;
}

export const ApprovalProgressBar: React.FC<ApprovalProgressBarProps> = ({
  totalApprovers,
  approvedCount,
  approverNames = [],
  approverDetails = [],
}) => {
  const progressPercentage = totalApprovers > 0 ? (approvedCount / totalApprovers) * 100 : 0;
  const displayDetails = approverDetails.length > 0 ? approverDetails : approverNames.map((name) => ({ name, approved: false }));

  return (
    <div className="space-y-3">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#3C3C3C]">Approval Progress</h3>
        <span className="text-sm font-medium text-[#B8A899]">
          {approvedCount}/{totalApprovers}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Approver list */}
      {displayDetails.length > 0 && (
        <div className="space-y-2 mt-4">
          {displayDetails.map((approver, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <div className="flex-shrink-0">
                {approver.approved ? (
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 font-bold text-xs">
                    ✓
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-200 text-gray-600 font-bold text-xs">
                    ⏳
                  </span>
                )}
              </div>
              <span className="flex-grow text-[#3C3C3C]">{approver.name}</span>
              {approver.approved && (approver as any).approvedAt && (
                <span className="text-xs text-[#B8A899]">
                  {new Date((approver as any).approvedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
