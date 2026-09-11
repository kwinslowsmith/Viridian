'use client';

import React from 'react';
import { colors } from '@/app/design/colors';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isFullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isFullWidth = false,
  isLoading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'font-semibold rounded transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const variantClasses: Record<ButtonVariant, string> = {
    primary: `bg-[${colors.teal.accent}] text-white hover:opacity-90 active:opacity-80`,
    secondary: `bg-white text-[${colors.text}] border-2 border-[${colors.border}] hover:bg-[${colors.bg}]`,
    danger: `bg-[${colors.red.accent}] text-white hover:opacity-90 active:opacity-80`,
    ghost: `bg-transparent text-[${colors.text2}] hover:bg-[${colors.bg}]`,
    icon: `bg-transparent text-[${colors.text2}] hover:bg-[${colors.bg}]`,
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-2 text-sm h-9',
    md: 'px-6 py-2.5 text-base h-11',
    lg: 'px-8 py-3 text-lg h-12',
  };

  const widthClass = isFullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="animate-spin">⏳</span>}
      {children}
    </button>
  );
};
