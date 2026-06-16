'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/app/modules/improv/design/colors';

interface Objective {
  id: string;
  label: string;
  text: string;
  description?: string;
  customText: string | null;
  isActive: boolean;
  classObjectiveId: string | null;
}

interface Standard {
  standardId: string;
  standardName: string;
  standardCode: string;
  objectives: Objective[];
}

interface ObjectivesGridProps {
  classId: string;
  className: string;
}

export function TeacherObjectivesGrid({ classId, className }: ObjectivesGridProps) {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Map<string, Objective>>(new Map());

  useEffect(() => {
    fetchObjectives();
  }, [classId]);

  const fetchObjectives = async () => {
    try {
      const res = await fetch(`/api/teacher/classes/${classId}/objectives`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStandards(data.standards || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch objectives:', err);
      setLoading(false);
    }
  };

  const updateObjectiveText = (objectiveId: string, newText: string) => {
    const newChanges = new Map(changes);
    const existing = newChanges.get(objectiveId);

    for (const standard of standards) {
      const obj = standard.objectives.find(o => o.id === objectiveId);
      if (obj) {
        newChanges.set(objectiveId, {
          ...obj,
          customText: newText || null,
        });
        break;
      }
    }

    setChanges(newChanges);
  };

  const toggleObjectiveActive = (objectiveId: string) => {
    const newChanges = new Map(changes);

    for (const standard of standards) {
      const obj = standard.objectives.find(o => o.id === objectiveId);
      if (obj) {
        newChanges.set(objectiveId, {
          ...obj,
          isActive: !obj.isActive,
        });
        break;
      }
    }

    setChanges(newChanges);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const updates = Array.from(changes.values()).map(obj => ({
        exampleObjectiveId: obj.id,
        customText: obj.customText,
        isActive: obj.isActive,
      }));

      const res = await fetch(`/api/teacher/classes/${classId}/objectives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objectiveUpdates: updates }),
      });

      if (res.ok) {
        setChanges(new Map());
        await fetchObjectives();
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: colors.text }}>Loading objectives...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
          {className} — Customize Objectives
        </h2>
        <p style={{ color: colors.text2 }}>
          Edit objective text or toggle to show/hide from students
        </p>
      </div>

      {standards.map((standard) => (
        <div key={standard.standardId} className="space-y-3">
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
          >
            <h3 className="font-bold text-lg" style={{ color: colors.text }}>
              {standard.standardCode}: {standard.standardName}
            </h3>
            <p className="text-sm mt-1" style={{ color: colors.text2 }}>
              {standard.objectives.length} objectives
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 ml-4">
            {standard.objectives.map((obj) => {
              const isEdited = changes.has(obj.id);
              const edited = changes.get(obj.id) || obj;

              return (
                <div
                  key={obj.id}
                  className="p-4 rounded border"
                  style={{
                    backgroundColor: !edited.isActive ? '#f5f5f5' : colors.surface,
                    borderColor: isEdited ? colors.teal.accent : colors.border,
                    opacity: !edited.isActive ? 0.6 : 1,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{ backgroundColor: colors.teal.bg, color: colors.text }}
                      >
                        {obj.label}
                      </div>
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs font-semibold mb-2" style={{ color: colors.text2 }}>
                        Objective {obj.label}
                      </label>
                      <textarea
                        value={edited.customText || obj.text}
                        onChange={(e) => updateObjectiveText(obj.id, e.target.value)}
                        className="w-full px-3 py-2 rounded border text-sm"
                        style={{ borderColor: colors.border, color: colors.text }}
                        rows={2}
                        placeholder={obj.text}
                      />
                      {obj.description && (
                        <p className="text-xs mt-2" style={{ color: colors.text2 }}>
                          Original: {obj.description}
                        </p>
                      )}
                    </div>

                    <div className="w-24 flex-shrink-0">
                      <button
                        onClick={() => toggleObjectiveActive(obj.id)}
                        className="w-full px-3 py-2 rounded font-semibold text-sm transition-all"
                        style={{
                          backgroundColor: edited.isActive ? colors.teal.bg : '#ccc',
                          color: colors.text,
                        }}
                      >
                        {edited.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </div>
                  </div>

                  {isEdited && (
                    <div className="text-xs mt-2" style={{ color: colors.teal.accent }}>
                      ✓ Modified
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {changes.size > 0 && (
        <div className="flex gap-3 p-4 rounded-lg" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
          <button
            onClick={saveChanges}
            disabled={saving}
            className="flex-1 px-4 py-2 rounded font-semibold"
            style={{ backgroundColor: colors.teal.bg, color: colors.text }}
          >
            {saving ? 'Saving...' : `Save ${changes.size} Change${changes.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
}
