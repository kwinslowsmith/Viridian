'use client';

import React, { useState } from 'react';
import { colors } from '@/app/modules/improv/design/colors';

interface Phase2DashboardProps {
  type: 'student' | 'teacher';
  children: React.ReactNode;
}

export function Phase2Dashboard({ type, children }: Phase2DashboardProps) {
  const [tab, setTab] = useState<string>(type === 'student' ? 'calendar' : 'classes');

  const studentTabs = ['calendar', 'progress', 'objectives', 'communities'] as const;
  const teacherTabs = ['classes', 'objectives', 'interventions'] as const;
  const tabs = type === 'student' ? studentTabs : teacherTabs;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b overflow-x-auto" style={{ borderColor: colors.border }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as string)}
            className="px-4 py-2 font-semibold text-sm transition-all border-b-2 whitespace-nowrap"
            style={{
              color: tab === t ? colors.teal.accent : colors.text2,
              borderColor: tab === t ? colors.teal.accent : "transparent",
            }}
          >
            {type === 'student'
              ? (t === 'calendar' ? '📅 Calendar' : t === 'progress' ? '📊 Progress' : t === 'objectives' ? '🎯 Objectives' : '🌍 Communities')
              : (t === 'classes' ? '📚 Classes' : t === 'objectives' ? '🎯 Objectives' : '📋 Sessions')}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === (type === 'student' ? 'progress' : 'classes') ? (
        children
      ) : (
        <div
          className="p-8 rounded-lg text-center"
          style={{ backgroundColor: colors.surface, border: `1px dashed ${colors.border}` }}
        >
          <h3 className="font-bold mb-2" style={{ color: colors.text }}>
            {tab === 'calendar' && '📅 Learning Calendar'}
            {tab === 'objectives' && '🎯 Learning Objectives'}
            {tab === 'communities' && '🌍 Learning Communities'}
            {tab === 'interventions' && '📋 Sessions & Interventions'}
          </h3>
          <p style={{ color: colors.text2 }}>
            {tab === 'calendar' && 'Weekly standards, objectives, and sessions coming soon'}
            {tab === 'objectives' && 'Browse and customize learning objectives coming soon'}
            {tab === 'communities' && 'Join learning communities and skill-building modules coming soon'}
            {tab === 'interventions' && 'Create and manage intervention blocks coming soon'}
          </p>
        </div>
      )}
    </div>
  );
}
