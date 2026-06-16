'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Skill {
  id: string;
  name: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  description: string;
  levelDefinitions: Record<string, string>;
}

interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  skills: Skill[];
}

export function TeacherObjectivePicker({ classId, onComplete }: { classId: string; onComplete?: () => void }) {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [enabledSkills, setEnabledSkills] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch skills on mount
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch('/api/improv/skills');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch skills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const toggleSkill = (skillId: string) => {
    const newSet = new Set(enabledSkills);
    if (newSet.has(skillId)) {
      newSet.delete(skillId);
    } else {
      newSet.add(skillId);
    }
    setEnabledSkills(newSet);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // For now, we'll just save to localStorage as a demo
      // In Phase 2, this will call the API
      localStorage.setItem(`class-${classId}-objectives`, JSON.stringify(Array.from(enabledSkills)));
      alert('✅ Objectives saved! Students will see these skills.');
      onComplete?.();
    } catch (error) {
      console.error('Failed to save objectives:', error);
      alert('Failed to save objectives');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', color: '#666' }}>Loading skills...</div>;
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#fafaf7', borderRadius: '12px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#000', marginBottom: '8px' }}>Select Learning Objectives</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Choose which skills you want to track for this class. Students will self-assess on these objectives.
        </p>
      </div>

      {categories.map(cat => (
        <div key={cat.id} style={{ marginBottom: '20px', backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #eae6de' }}>
          {/* Category Header */}
          <div style={{ padding: '12px 16px', backgroundColor: cat.color || '#f0f0f0', borderBottom: '1px solid #eae6de' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>{cat.icon}</span>
              <span style={{ fontWeight: '600', color: '#000', fontSize: '16px' }}>{cat.name}</span>
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
                {cat.skills.filter(s => enabledSkills.has(s.id)).length} of {cat.skills.length} selected
              </span>
            </div>
          </div>

          {/* Skills in Category */}
          <div style={{ padding: '12px 16px' }}>
            {cat.skills.map((skill, idx) => {
              const isEnabled = enabledSkills.has(skill.id);
              return (
                <div
                  key={skill.id}
                  onClick={() => toggleSkill(skill.id)}
                  style={{
                    padding: '12px',
                    marginBottom: idx < cat.skills.length - 1 ? '8px' : '0',
                    backgroundColor: isEnabled ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                    border: `2px solid ${isEnabled ? '#0D9488' : '#eae6de'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => {}}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        marginTop: '2px',
                        flexShrink: 0,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#000', marginBottom: '4px' }}>{skill.name}</div>
                      <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>{skill.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Save Button */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          onClick={handleSave}
          disabled={saving || enabledSkills.size === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: enabledSkills.size > 0 ? '#0D9488' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: enabledSkills.size > 0 ? 'pointer' : 'default',
          }}
        >
          {saving ? 'Saving...' : `Save (${enabledSkills.size} selected)`}
        </button>
      </div>
    </div>
  );
}
