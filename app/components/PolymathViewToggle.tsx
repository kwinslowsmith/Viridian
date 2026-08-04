'use client';

import React, { useState, useEffect } from 'react';

interface PolymathViewToggleProps {
  onChange?: (isPersonalized: boolean) => void;
  initialState?: boolean;
}

export const PolymathViewToggle: React.FC<PolymathViewToggleProps> = ({
  onChange,
  initialState = false,
}) => {
  const [isPersonalized, setIsPersonalized] = useState(initialState);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('polymath-view-mode');
    if (saved !== null) {
      const personalized = saved === 'personalized';
      setIsPersonalized(personalized);
    }
  }, []);

  const handleToggle = () => {
    const newState = !isPersonalized;
    setIsPersonalized(newState);
    localStorage.setItem('polymath-view-mode', newState ? 'personalized' : 'professional');
    onChange?.(newState);
  };

  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs font-semibold uppercase tracking-wider ${!isPersonalized ? 'text-[#3C3C3C]' : 'text-[#B8A899]'}`}>
        Professional
      </span>
      <button
        onClick={handleToggle}
        aria-label={isPersonalized ? 'Switch to professional view' : 'Switch to personalized view'}
        className={`relative w-20 h-9 rounded-full transition-all duration-300 ${
          isPersonalized
            ? 'bg-[#8B3A3A]/40'
            : 'bg-[#B8A899]/20'
        }`}
      >
        <div
          className={`absolute top-0.5 w-8 h-8 bg-white rounded-full shadow transition-all duration-300 ${
            isPersonalized ? 'translate-x-10' : 'translate-x-0.5'
          }`}
        />
      </button>
      <span className={`text-xs font-semibold uppercase tracking-wider ${isPersonalized ? 'text-[#3C3C3C]' : 'text-[#B8A899]'}`}>
        Personalized
      </span>
    </div>
  );
};
