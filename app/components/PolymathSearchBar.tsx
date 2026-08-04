'use client';

import React, { useState } from 'react';

interface PolymathSearchBarProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: Record<string, string>) => void;
  placeholder?: string;
}

export const PolymathSearchBar: React.FC<PolymathSearchBarProps> = ({
  onSearch,
  onFilterChange,
  placeholder = 'Search expertise, resources, tools...',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({
    topic: 'all',
    level: 'all',
    type: 'all',
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleFilterChange = (filterName: string, value: string) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearch?.('');
  };

  const filterOptions = {
    topic: ['All Topics', 'Expertise Series', 'Tools', 'Resources', 'Spotlights'],
    level: ['All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Expert'],
    type: ['All Types', 'Video', 'Article', 'Lesson Plan', 'Tool', 'Guide'],
  };

  return (
    <div className="w-full bg-white border-b border-[#B8A899]/20 py-5 px-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="flex items-center border border-[#B8A899]/20 rounded bg-white focus-within:border-[#8B3A3A]">
            <svg
              className="w-4 h-4 text-[#B8A899] ml-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 px-4 py-3 bg-transparent outline-none text-sm text-[#3C3C3C] placeholder-[#B8A899]"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="pr-4 text-[#B8A899] hover:text-[#8B3A3A] transition-colors"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-col gap-2 md:flex-row md:gap-4">
          {Object.entries(filterOptions).map(([filterName, options]) => (
            <select
              key={filterName}
              value={filters[filterName]}
              onChange={(e) => handleFilterChange(filterName, e.target.value)}
              className="px-3 py-2 border border-[#B8A899]/20 rounded bg-white text-sm text-[#3C3C3C] focus:border-[#8B3A3A] outline-none cursor-pointer"
            >
              {options.map((option) => (
                <option key={option} value={option.toLowerCase().replace(/\s+/g, '-')}>
                  {option}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>
    </div>
  );
};
