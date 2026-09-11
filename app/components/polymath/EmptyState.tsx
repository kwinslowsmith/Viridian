'use client';

import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-[#3C3C3C] mb-2">{title}</h3>
      {description && (
        <p className="text-[#666666] text-center max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
