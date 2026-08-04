'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface PolymathButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isFullWidth?: boolean;
  children: React.ReactNode;
}

export const PolymathButton: React.FC<PolymathButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isFullWidth = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-sans font-semibold rounded transition-all duration-200 cursor-pointer flex items-center justify-center gap-2';

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-[#8B3A3A] text-white hover:bg-[#75302D] active:bg-[#6B2828] disabled:bg-[#B8A899] disabled:cursor-not-allowed',
    secondary: 'bg-white text-[#8B3A3A] border-2 border-[#8B3A3A] hover:bg-[#8B3A3A]/10 active:bg-[#8B3A3A]/20 disabled:border-[#B8A899] disabled:text-[#B8A899]',
    tertiary: 'bg-[#B8A899]/40 text-[#3C3C3C] hover:bg-[#B8A899]/70 active:text-white disabled:bg-[#B8A899]/20 disabled:text-[#B8A899] disabled:cursor-not-allowed',
    icon: 'bg-transparent text-[#B8A899] hover:bg-[#F5F3F0] hover:text-[#8B3A3A] active:bg-[#8B3A3A] active:text-white disabled:text-[#B8A899]/40',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-2 text-xs h-9 min-h-9',
    md: 'px-6 py-2.5 text-sm h-11 min-h-11',
    lg: 'px-8 py-3 text-base h-12 min-h-12',
  };

  const widthClass = isFullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      {...props}
    />
  );
};
