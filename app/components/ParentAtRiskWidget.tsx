'use client';

import React, { useState, useEffect } from 'react';
import styles from './ParentAtRiskWidget.module.css';

interface Objective {
  objectiveId: string;
  label: string;
  text: string;
  isMandatory: boolean;
  score: number;
  complete: boolean;
}

interface Standard {
  standardId: string;
  standardCode: string;
  standardName: string;
  masteryPercent: number;
  passed: boolean;
  reason: string;
  objectives: Objective[];
}

interface InterventionGroup {
  groupId: string;
  name: string;
  objectiveId: string;
  objectiveLabel: string;
  objectiveText: string;
  standardName: string;
  studentCount: number;
  studentIds: string[];
  meetingSchedule: string;
  startDate: string;
  endDate: string;
}

interface ParentAtRiskWidgetProps {
  childId: string;
  classId: string;
  childName: string;
  passThreshold?: number;
}

export default function ParentAtRiskWidget({
  childId,
  classId,
  childName,
  passThreshold = 80,
}: ParentAtRiskWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [interventionGroups, setInterventionGroups] = useState<InterventionGroup[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch mastery data
        const masteryResponse = await fetch(
          `/api/k12-classes/${classId}/students/${childId}/mastery`
        );
        if (!masteryResponse.ok) {
          throw new Error('Failed to fetch mastery data');
        }
        const masteryData = await masteryResponse.json();
        setStandards(masteryData.standards || []);

        // Fetch intervention groups
        const groupsResponse = await fetch(
          `/api/k12-classes/${classId}/intervention-groups`
        );
        if (!groupsResponse.ok) {
          throw new Error('Failed to fetch intervention groups');
        }
        const groupsData = await groupsResponse.json();
        // Filter groups that include this student
        const childGroups = (groupsData || []).filter((group: InterventionGroup) =>
          group.studentIds.includes(childId)
        );
        setInterventionGroups(childGroups);
      } catch (err) {
        console.error('Error fetching at-risk data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load at-risk information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [childId, classId]);

  // Filter standards where student is below pass threshold
  const atRiskStandards = standards.filter(
    (s) => s.masteryPercent < passThreshold
  );

  // Calculate risk level
  const getRiskLevel = (): 'critical' | 'warning' | 'ok' => {
    if (atRiskStandards.length === 0) return 'ok';
    const avgMastery =
      atRiskStandards.reduce((sum, s) => sum + s.masteryPercent, 0) /
      atRiskStandards.length;
    if (avgMastery < 50) return 'critical';
    if (avgMastery < 70) return 'warning';
    return 'ok';
  };

  const riskLevel = getRiskLevel();
  const riskCount = atRiskStandards.length;

  if (loading) {
    return (
      <div className={`${styles.widget} ${styles.loading}`}>
        <p>Loading progress data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.widget} ${styles.error}`}>
        <p>⚠️ Unable to load progress information</p>
        <small>{error}</small>
      </div>
    );
  }

  // Hide widget if no risks
  if (riskCount === 0 && interventionGroups.length === 0) {
    return (
      <div className={`${styles.widget} ${styles.ok}`}>
        <div className={styles.summary}>
          <span className={styles.icon}>✓</span>
          <div className={styles.text}>
            <strong>On Track</strong>
            <p>{childName} is making great progress on all standards!</p>
          </div>
        </div>
      </div>
    );
  }

  const estimatedWeeks =
    riskCount > 0
      ? Math.ceil(
          (passThreshold -
            atRiskStandards.reduce((sum, s) => sum + s.masteryPercent, 0) /
              atRiskStandards.length) /
            5
        ) // Assume 5% improvement per week
      : 0;

  return (
    <div className={`${styles.widget} ${styles[riskLevel]}`}>
      {/* Summary Section */}
      <div className={styles.summary} onClick={() => setExpanded(!expanded)}>
        <span className={styles.icon}>
          {riskLevel === 'critical' && '🔴'}
          {riskLevel === 'warning' && '🟡'}
          {riskLevel === 'ok' && '🟢'}
        </span>

        <div className={styles.text}>
          <strong>
            {riskLevel === 'critical' && 'Needs Attention'}
            {riskLevel === 'warning' && 'Needs Support'}
            {riskLevel === 'ok' && 'On Track'}
          </strong>
          {riskCount > 0 && (
            <p>
              {childName} is working on {riskCount} {riskCount === 1 ? 'objective' : 'objectives'} below
              the {passThreshold}% goal.
            </p>
          )}
          {interventionGroups.length > 0 && (
            <p>
              Currently in {interventionGroups.length} support{' '}
              {interventionGroups.length === 1 ? 'group' : 'groups'}.
            </p>
          )}
          {estimatedWeeks > 0 && (
            <p>Estimated {estimatedWeeks} weeks to reach goal.</p>
          )}
        </div>

        <span className={styles.toggle}>
          {expanded ? '▼' : '▶'}
        </span>
      </div>

      {/* Details Section */}
      {expanded && (
        <div className={styles.details}>
          {/* Intervention Groups */}
          {interventionGroups.length > 0 && (
            <div className={styles.section}>
              <h4>📚 Support Groups</h4>
              <div className={styles.groupsList}>
                {interventionGroups.map((group) => (
                  <div key={group.groupId} className={styles.group}>
                    <strong>{group.name}</strong>
                    <p>{group.objectiveText}</p>
                    <div className={styles.groupInfo}>
                      <span>📅 {group.meetingSchedule}</span>
                      {group.studentCount && (
                        <span>👥 {group.studentCount} students</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* At-Risk Objectives */}
          {atRiskStandards.length > 0 && (
            <div className={styles.section}>
              <h4>🎯 Areas to Focus</h4>
              <div className={styles.objectivesList}>
                {atRiskStandards.map((standard) => {
                  const gap = passThreshold - standard.masteryPercent;
                  return (
                    <div key={standard.standardId} className={styles.objective}>
                      <div className={styles.header}>
                        <strong>{standard.standardName}</strong>
                        <span className={styles.progress}>{standard.masteryPercent}%</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.fill}
                          style={{
                            width: `${Math.min(standard.masteryPercent, 100)}%`,
                            backgroundColor:
                              standard.masteryPercent >= 70
                                ? '#fbbf24'
                                : standard.masteryPercent >= 50
                                  ? '#f97316'
                                  : '#ef4444',
                          }}
                        />
                      </div>
                      <p className={styles.gap}>
                        {gap.toFixed(0)}% below goal — Keep going! {standard.reason}
                      </p>
                      {/* Show struggling objectives within this standard */}
                      {standard.objectives
                        .filter((obj) => !obj.complete)
                        .slice(0, 2)
                        .map((obj) => (
                          <div key={obj.objectiveId} className={styles.miniObjective}>
                            <span className={styles.label}>{obj.label}</span>
                            <span className={styles.score}>{obj.score}%</span>
                          </div>
                        ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Encouragement */}
          <div className={styles.encouragement}>
            <p>
              💡 <strong>How to help:</strong> Ask {childName} about the material in their support
              groups, encourage practice, and contact the teacher with any questions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
