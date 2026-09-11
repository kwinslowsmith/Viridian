'use client';

import React from 'react';
import { colors } from '@/app/design/colors';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#3C3C3C] mb-2">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-2 border rounded-lg text-base transition-colors appearance-none bg-white ${
          error
            ? `border-[${colors.red.accent}] focus:ring-2 focus:ring-[${colors.red.accent}]`
            : `border-[${colors.border}] focus:ring-2 focus:ring-[${colors.teal.accent}]`
        } focus:outline-none ${className}`}
        {...props}
      >
        <option value="">Select an option...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-[#DC2626]">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-[#666666]">{helperText}</p>
      )}
    </div>
  );
};
