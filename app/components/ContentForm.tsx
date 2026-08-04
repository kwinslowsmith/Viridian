'use client';

import React, { useRef } from 'react';
import { PolymathButton } from './PolymathButton';

interface ContentFormProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  maxLength?: number;
  minHeight?: string;
}

export const ContentForm: React.FC<ContentFormProps> = ({
  value,
  onChange,
  placeholder = 'Write your content here...',
  maxLength = 10000,
  minHeight = 'min-h-64',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkup = (before: string, after: string = '') => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-3 bg-[#F5F3F0] rounded-t-lg border border-[#B8A899]/20">
        <button
          onClick={() => insertMarkup('**', '**')}
          title="Bold"
          className="p-2 hover:bg-[#B8A899]/20 rounded transition-colors text-sm font-bold text-[#3C3C3C]"
          type="button"
        >
          B
        </button>
        <button
          onClick={() => insertMarkup('_', '_')}
          title="Italic"
          className="p-2 hover:bg-[#B8A899]/20 rounded transition-colors text-sm font-italic text-[#3C3C3C] italic"
          type="button"
        >
          I
        </button>
        <button
          onClick={() => insertMarkup('[', '](url)')}
          title="Link"
          className="p-2 hover:bg-[#B8A899]/20 rounded transition-colors text-sm text-[#8B3A3A]"
          type="button"
        >
          🔗
        </button>
        <div className="border-l border-[#B8A899]/30" />
        <button
          onClick={() => insertMarkup('\n- ')}
          title="Bullet list"
          className="p-2 hover:bg-[#B8A899]/20 rounded transition-colors text-sm text-[#3C3C3C]"
          type="button"
        >
          • List
        </button>
        <button
          onClick={() => insertMarkup('\n1. ')}
          title="Numbered list"
          className="p-2 hover:bg-[#B8A899]/20 rounded transition-colors text-sm text-[#3C3C3C]"
          type="button"
        >
          1. List
        </button>
        <button
          onClick={() => insertMarkup('\n```\n', '\n```\n')}
          title="Code block"
          className="p-2 hover:bg-[#B8A899]/20 rounded transition-colors text-sm text-[#3C3C3C] font-mono"
          type="button"
        >
          &lt;&gt;
        </button>
        <div className="border-l border-[#B8A899]/30" />
        <button
          onClick={() => insertMarkup('\n# ')}
          title="Heading"
          className="p-2 hover:bg-[#B8A899]/20 rounded transition-colors text-sm font-bold text-[#3C3C3C]"
          type="button"
        >
          H1
        </button>
        <button
          onClick={() => insertMarkup('\n## ')}
          title="Subheading"
          className="p-2 hover:bg-[#B8A899]/20 rounded transition-colors text-sm font-bold text-[#3C3C3C]"
          type="button"
        >
          H2
        </button>
        <button
          onClick={() => insertMarkup('\n> ')}
          title="Blockquote"
          className="p-2 hover:bg-[#B8A899]/20 rounded transition-colors text-sm text-[#3C3C3C]"
          type="button"
        >
          ❝
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full ${minHeight} p-4 border border-[#B8A899]/20 rounded-b-lg font-sans text-sm text-[#3C3C3C] placeholder-[#B8A899] focus:outline-none focus:ring-2 focus:ring-[#8B3A3A] focus:border-transparent resize-none`}
      />

      {/* Character count */}
      <div className="flex justify-end">
        <span className="text-xs text-[#B8A899]">
          {value.length} / {maxLength} characters
        </span>
      </div>

      {/* Helper text */}
      <div className="text-xs text-[#B8A899] space-y-1">
        <p>💡 Formatting: Use **bold**, _italic_, [links](url), and #Headings</p>
        <p>Markdown formatting is supported for rich text content</p>
      </div>
    </div>
  );
};
