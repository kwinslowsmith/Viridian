'use client';

import React, { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  const baseStyles =
    'fixed bottom-4 right-4 px-4 py-3 rounded-lg text-sm font-medium shadow-lg max-w-sm z-50 animate-fadeIn';

  const typeStyles = {
    success: 'bg-green-50 border border-green-200 text-green-700',
    error: 'bg-red-50 border border-red-200 text-red-700',
    info: 'bg-blue-50 border border-blue-200 text-blue-700',
    warning: 'bg-amber-50 border border-amber-200 text-amber-700',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type]} flex items-center gap-2`}>
      <span className="text-lg">{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
};

export default Toast;
