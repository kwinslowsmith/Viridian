'use client';

import React from 'react';
import { colors } from '@/app/design/colors';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
}) => {
  const variantClasses: Record<BadgeVariant, string> = {
    default: `bg-[${colors.bg}] text-[${colors.text}]`,
    success: `bg-[${colors.green.bg}] text-[${colors.green.text}]`,
    warning: `bg-[${colors.amber.bg}] text-[${colors.amber.text}]`,
    error: `bg-[${colors.red.bg}] text-[${colors.red.text}]`,
    info: `bg-blue-100 text-blue-900`,
    primary: `bg-[${colors.teal.accent}]/20 text-[${colors.teal.accent}]`,
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
