'use client';

import React from 'react';
import { colors } from '@/app/design/colors';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
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
      <input
        className={`w-full px-4 py-2 border rounded-lg text-base transition-colors ${
          error
            ? `border-[${colors.red.accent}] focus:ring-2 focus:ring-[${colors.red.accent}]`
            : `border-[${colors.border}] focus:ring-2 focus:ring-[${colors.teal.accent}]`
        } focus:outline-none ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[#DC2626]">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-[#666666]">{helperText}</p>
      )}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
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
      <textarea
        className={`w-full px-4 py-2 border rounded-lg text-base transition-colors ${
          error
            ? `border-[${colors.red.accent}] focus:ring-2 focus:ring-[${colors.red.accent}]`
            : `border-[${colors.border}] focus:ring-2 focus:ring-[${colors.teal.accent}]`
        } focus:outline-none ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[#DC2626]">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-[#666666]">{helperText}</p>
      )}
    </div>
  );
};
