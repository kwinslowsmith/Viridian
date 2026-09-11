'use client';

import React, { useState } from 'react';
import { colors } from '@/app/design/colors';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTabId?: string;
  onChange?: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTabId,
  onChange,
}) => {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
    onChange?.(tabId);
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div>
      {/* Tab Headers */}
      <div className="border-b border-[#E5E5E5]">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTabId === tab.id
                  ? `border-[${colors.teal.accent}] text-[${colors.teal.accent}]`
                  : `border-transparent text-[${colors.text2}] hover:text-[${colors.text}]`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab && activeTab.content}
      </div>
    </div>
  );
};
