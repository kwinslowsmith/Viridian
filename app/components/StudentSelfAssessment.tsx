'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Skill {
  id: string;
  name: string;
  category: string;
  levelDefinitions: Record<string, string>;
}

interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  skills: Skill[];
}

export function StudentSelfAssessment({ classId, onComplete }: { classId: string; onComplete?: () => void }) {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch('/api/improv/skills');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories);
          
          // Load existing ratings from localStorage
          const saved = localStorage.getItem(`student-${classId}-ratings`);
          if (saved) {
            setRatings(JSON.parse(saved));
          }
        }
      } catch (error) {
        console.error('Failed to fetch skills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [classId]);

  const handleRate = (skillId: string, level: number) => {
    setRatings(prev => ({
      ...prev,
      [skillId]: level,
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Submit each rating to API
      for (const [skillId, level] of Object.entries(ratings)) {
        await fetch(`/api/improv/classes/${classId}/assessments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillId, level }),
        });
      }

      // Also save to localStorage as backup
      localStorage.setItem(`student-${classId}-ratings`, JSON.stringify(ratings));
      setSubmitted(true);
      setTimeout(() => onComplete?.(), 1500);
    } catch (error) {
      console.error('Failed to submit assessments:', error);
      alert('Failed to submit assessments');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', color: '#666' }}>Loading skills...</div>;
  }

  if (submitted) {
    return (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        backgroundColor: '#f0fdf4',
        borderRadius: '12px',
        border: '1px solid #86efac',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
        <h3 style={{ color: '#166534', marginBottom: '8px' }}>Assessment submitted!</h3>
        <p style={{ color: '#4b7c0f' }}>Your self-ratings have been saved. Great work!</p>
      </div>
    );
  }

  const levelLabels = ['Approaching', 'Developing', 'Proficient', 'Advanced'];
  const levelColors = ['#fff7ed', '#fefce8', '#f0fdf4', '#e0f2fe'];

  return (
    <div style={{ padding: '20px', backgroundColor: '#fafaf7', borderRadius: '12px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#000', marginBottom: '8px' }}>Rate Your Skills</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>
          For each skill, select the level that best describes your current proficiency.
        </p>
      </div>

      {categories.map(cat => (
        <div key={cat.id} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '8px', borderBottom: `2px solid ${cat.color}` }}>
            <span style={{ fontSize: '18px' }}>{cat.icon}</span>
            <h4 style={{ color: '#000', margin: 0 }}>{cat.name}</h4>
          </div>

          {cat.skills.map((skill, idx) => {
            const currentRating = ratings[skill.id];
            return (
              <div key={skill.id} style={{ marginBottom: '16px', backgroundColor: '#fff', borderRadius: '10px', padding: '16px', border: '1px solid #eae6de' }}>
                <div style={{ marginBottom: '12px' }}>
                  <h5 style={{ color: '#000', margin: '0 0 4px 0' }}>{skill.name}</h5>
                </div>

                {/* Level Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[1, 2, 3, 4].map(level => {
                    const isSelected = currentRating === level;
                    const levelDef = skill.levelDefinitions[levelLabels[level - 1].toLowerCase()];
                    return (
                      <button
                        key={level}
                        onClick={() => handleRate(skill.id, level)}
                        title={levelDef}
                        style={{
                          padding: '12px 8px',
                          backgroundColor: isSelected ? '#0D9488' : levelColors[level - 1],
                          color: isSelected ? 'white' : '#000',
                          border: `2px solid ${isSelected ? '#0D9488' : '#eae6de'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: isSelected ? '600' : '500',
                          fontSize: '12px',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        {level === 1 ? '1\nApp.' : level === 2 ? '2\nDev.' : level === 3 ? '3\nProf.' : '4\nAdv.'}
                      </button>
                    );
                  })}
                </div>

                {/* Level Definition */}
                {currentRating && (
                  <div style={{
                    marginTop: '10px',
                    padding: '10px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#666',
                    fontStyle: 'italic',
                    borderLeft: `3px solid #0D9488`,
                  }}>
                    {skill.levelDefinitions[levelLabels[currentRating - 1].toLowerCase()]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Submit Button */}
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          onClick={handleSubmit}
          disabled={saving || Object.keys(ratings).length === 0}
          style={{
            padding: '12px 24px',
            backgroundColor: Object.keys(ratings).length > 0 ? '#0D9488' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: Object.keys(ratings).length > 0 ? 'pointer' : 'default',
          }}
        >
          {saving ? 'Submitting...' : `Submit Assessment (${Object.keys(ratings).length} rated)`}
        </button>
      </div>
    </div>
  );
}
