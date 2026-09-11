'use client';

import React from 'react';
import { colors } from '@/app/design/colors';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  className = '',
  id,
  ...props
}) => {
  const checkboxId = id || `checkbox-${Math.random()}`;

  return (
    <div className="flex items-center gap-2">
      <input
        id={checkboxId}
        type="checkbox"
        className={`w-5 h-5 accent-[${colors.teal.accent}] cursor-pointer rounded ${className}`}
        {...props}
      />
      {label && (
        <label htmlFor={checkboxId} className="text-sm text-[#3C3C3C] cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
};
