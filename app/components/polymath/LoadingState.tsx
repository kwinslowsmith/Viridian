'use client';

import React from 'react';

interface LoadingStateProps {
  message?: string;
  variant?: 'skeleton' | 'spinner';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  variant = 'spinner',
}) => {
  if (variant === 'skeleton') {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 border-4 border-[#20B2AA] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-[#666666]">{message}</p>
    </div>
  );
};
