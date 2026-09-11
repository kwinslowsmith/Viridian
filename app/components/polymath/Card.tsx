'use client';

import React from 'react';
import { colors } from '@/app/design/colors';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  onClick,
  className = '',
  variant = 'default',
}) => {
  const baseClasses = 'rounded-lg transition-all duration-200';

  const variantClasses: Record<string, string> = {
    default: `bg-white border border-[${colors.border}] shadow-sm hover:shadow-md`,
    elevated: `bg-white shadow-lg hover:shadow-xl`,
    outlined: `bg-transparent border-2 border-[${colors.teal.accent}]`,
  };

  const cursorClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${cursorClass} ${className}`}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-[${colors.border}] ${className}`}>
    {children}
  </div>
);

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-[${colors.border}] flex gap-3 ${className}`}>
    {children}
  </div>
);
