'use client';

import React, { useEffect } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'md',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-lg ${sizeClasses[size]} w-full`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5]">
          <h2 className="text-lg font-semibold text-[#3C3C3C]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#999999] hover:text-[#3C3C3C] text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {actions && actions.length > 0 && (
          <div className="px-6 py-4 border-t border-[#E5E5E5] flex gap-3 justify-end">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'secondary'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
