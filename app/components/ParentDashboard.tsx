'use client';

import React, { useState, useEffect } from 'react';
import styles from './ParentDashboard.module.css';

interface Objective {
  id: string;
  label: string;
  text: string;
  isMandatory: boolean;
  completed: boolean;
  completedAt?: string;
}

interface Standard {
  id: string;
  name: string;
  code: string;
  description?: string;
  masteryPercent: number;
  status: 'mastered' | 'in-progress' | 'not-started';
  progressStatus: 'on-track' | 'needs-support';
  objectives: Objective[];
  skillsCount: number;
  completedCount: number;
  helpTips: string[];
}

interface ProgressData {
  childName: string;
  className: string;
  classId: string;
  standards: Standard[];
  lastActivity: string | null;
}

export function ParentDashboard({ childId }: { childId: string }) {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStandards, setExpandedStandards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/parents/children/${childId}/progress`);
        if (!res.ok) {
          throw new Error('Failed to fetch progress data');
        }
        const progressData = await res.json();
        setData(progressData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [childId]);

  const toggleStandard = (standardId: string) => {
    const newExpanded = new Set(expandedStandards);
    if (newExpanded.has(standardId)) {
      newExpanded.delete(standardId);
    } else {
      newExpanded.add(standardId);
    }
    setExpandedStandards(newExpanded);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {error || 'Unable to load progress data'}
        </div>
      </div>
    );
  }

  const overallMastery = data.standards.length > 0
    ? Math.round(
        data.standards.reduce((sum, s) => sum + s.masteryPercent, 0) /
          data.standards.length
      )
    : 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{data.childName}'s Learning Progress</h1>
        <p className={styles.subtitle}>{data.className}</p>
      </div>

      {/* Overall Progress Card */}
      <div className={styles.overallCard}>
        <div className={styles.overallContent}>
          <div className={styles.overallText}>
            <h2>Overall Progress</h2>
            <p className={styles.masteryLabel}>{overallMastery}% toward mastery</p>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${overallMastery}%` }}
            />
          </div>
        </div>
        <p className={styles.helpText}>
          Mastery means {data.childName} has demonstrated the skill in multiple assessments
          and shows consistent understanding.
        </p>
      </div>

      {/* What Does Mastery Mean Section */}
      <div className={styles.explainerCard}>
        <h3>What Does "Mastery" Mean?</h3>
        <p>
          In this learning system, mastery isn't just about getting the right answer on a test.
          It means {data.childName} has:
        </p>
        <ul>
          <li>Shown they understand the skill multiple times</li>
          <li>Demonstrated consistent understanding across different assignments</li>
          <li>Shown they can apply the skill in different contexts</li>
        </ul>
        <p>
          <strong>The percentage you see</strong> represents how many of the key skills in each
          area {data.childName} has mastered so far. Don't worry if it's not 100% yet—that's
          normal and expected as they're still learning!
        </p>
      </div>

      {/* Standards List */}
      <div className={styles.standardsList}>
        <h2>What {data.childName} Is Learning</h2>

        {data.standards.length === 0 ? (
          <p className={styles.noData}>No learning standards assigned yet.</p>
        ) : (
          data.standards.map((standard) => (
            <div key={standard.id} className={styles.standardCard}>
              {/* Standard Header */}
              <button
                className={styles.standardHeader}
                onClick={() => toggleStandard(standard.id)}
                aria-expanded={expandedStandards.has(standard.id)}
              >
                <div className={styles.standardInfo}>
                  <div className={styles.standardTitleArea}>
                    <h3>{standard.name}</h3>
                    {standard.progressStatus === 'needs-support' && (
                      <span className={styles.alertBadge}>Needs Support</span>
                    )}
                  </div>
                  {standard.description && (
                    <p className={styles.standardDescription}>{standard.description}</p>
                  )}
                </div>

                <div className={styles.standardMetrics}>
                  <div className={styles.statusIndicator}>
                    {standard.status === 'mastered' && (
                      <span className={styles.statusMastered}>✓ Mastered</span>
                    )}
                    {standard.status === 'in-progress' && (
                      <span className={styles.statusInProgress}>→ In Progress</span>
                    )}
                    {standard.status === 'not-started' && (
                      <span className={styles.statusNotStarted}>○ Not Started</span>
                    )}
                  </div>
                  <div className={styles.masteryInfo}>
                    <div className={styles.percentage}>{standard.masteryPercent}%</div>
                    <span className={styles.toggleIcon}>
                      {expandedStandards.has(standard.id) ? '▼' : '▶'}
                    </span>
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedStandards.has(standard.id) && (
                <div className={styles.expandedContent}>
                  {/* Objectives List */}
                  <div className={styles.objectivesSection}>
                    <h4>Skills to Master</h4>
                    <div className={styles.objectivesList}>
                      {standard.objectives.map((objective) => (
                        <div key={objective.id} className={styles.objectiveItem}>
                          <span className={styles.objectiveIcon}>
                            {objective.completed ? '✓' : '○'}
                          </span>
                          <div className={styles.objectiveContent}>
                            <span className={styles.objectiveText}>{objective.text}</span>
                            {objective.isMandatory && (
                              <span className={styles.coreBadge}>Core Skill</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* How to Help Section */}
                  <div className={styles.helpSection}>
                    <h4>How You Can Help</h4>
                    <div className={styles.helpTips}>
                      {standard.helpTips.map((tip, idx) => (
                        <div key={idx} className={styles.helpTip}>
                          <span className={styles.tipIcon}>→</span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>

                    {standard.progressStatus === 'needs-support' && (
                      <div className={styles.supportAlert}>
                        <p>
                          <strong>{data.childName} is working on this area.</strong> Consider:
                        </p>
                        <ul>
                          <li>Asking about what they're learning</li>
                          <li>Reviewing examples of their work together</li>
                          <li>Checking in with the teacher for specific support ideas</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Last Activity */}
      {data.lastActivity && (
        <div className={styles.activityCard}>
          <h3>Recent Activity</h3>
          <p>{data.lastActivity}</p>
        </div>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        <p>
          Questions? Reach out to the teacher. Remember: learning is a process, and progress
          looks different for every student.
        </p>
      </div>
    </div>
  );
}
