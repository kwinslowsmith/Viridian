'use client';

import React, { useState, useEffect } from 'react';
import styles from './ParentDashboardK12.module.css';

interface ExpandedStandard {
  [key: string]: boolean;
}

interface ParentProgress {
  childId: string;
  childName: string;
  gradeLevel: number;
  classId: string;
  className: string;
  teacher: { name: string; email: string };
  standards: Array<{
    id: string;
    name: string;
    code: string;
    masteryPercent: number;
    status: string;
    description: string;
    whatItMeans: string;
    howToHelp: string[];
    objectives: Array<{
      text: string;
      status: string;
      isMandatory: boolean;
    }>;
    recommendedResources: Array<{
      title: string;
      type: string;
      url: string;
    }>;
  }>;
  masterCalendarEvents: Array<{
    id: string;
    name: string;
    date: string;
    type: string;
    standardsAssessed: string[];
  }>;
  lastUpdate: string;
}

export default function ParentDashboardK12({ childId }: { childId: string }) {
  const [data, setData] = useState<ParentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStandards, setExpandedStandards] = useState<ExpandedStandard>({});

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/k12/parents/children/${childId}/progress`
        );
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load progress data');
        console.error('Error fetching parent progress:', err);
      } finally {
        setLoading(false);
      }
    };

    if (childId) {
      fetchProgress();
    }
  }, [childId]);

  const toggleStandard = (standardId: string) => {
    setExpandedStandards((prev) => ({
      ...prev,
      [standardId]: !prev[standardId],
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return styles.statusOnTrack;
      case 'needs-support':
        return styles.statusNeedsSupport;
      case 'not-started':
        return styles.statusNotStarted;
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'On Track';
      case 'needs-support':
        return 'Needs Support';
      case 'not-started':
        return 'Not Started Yet';
      default:
        return status;
    }
  };

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: '#6b7280' }}>Loading learning progress...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: '#dc2626' }}>
              {error || 'Unable to load progress data. Please try again.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const lastUpdated = new Date(data.lastUpdate).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>
                {data.childName}'s Learning Progress
              </h1>
              <p className={styles.subtitle}>
                Grade {data.gradeLevel} • {data.className}
              </p>
            </div>
            <div className={styles.teacherInfo}>
              <p className={styles.label}>Teacher</p>
              <p className={styles.teacherName}>{data.teacher.name}</p>
              <a
                href={`mailto:${data.teacher.email}`}
                className={styles.emailLink}
              >
                {data.teacher.email}
              </a>
            </div>
          </div>
          <p className={styles.lastUpdate}>
            Updated {lastUpdated}
          </p>
        </div>

        {/* Standards Overview */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Learning Standards Overview
          </h2>
          <p className={styles.sectionSubtitle}>
            Here's how {data.childName} is progressing on the main skills for this class.
            Each standard builds important knowledge for success.
          </p>

          <div className={styles.standardsList}>
            {data.standards.map((standard) => (
              <div
                key={standard.id}
                className={styles.standardCard}
                onClick={() => toggleStandard(standard.id)}
                role="button"
                tabIndex={0}
              >
                <div className={styles.standardHeader}>
                  <div className={styles.standardLeft}>
                    <div
                      className={`${styles.statusPill} ${getStatusColor(
                        standard.status
                      )}`}
                    >
                      {getStatusLabel(standard.status)}
                    </div>
                    <div>
                      <h3 className={styles.standardName}>
                        {standard.name}
                      </h3>
                      <p className={styles.standardDescription}>
                        {standard.description}
                      </p>
                    </div>
                  </div>
                  <div className={styles.standardRight}>
                    <div className={styles.masteryPercent}>
                      {standard.masteryPercent}%
                    </div>
                    <div className={styles.progressBarContainer}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{
                            width: `${standard.masteryPercent}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className={styles.expandIcon}>
                      {expandedStandards[standard.id] ? '▼' : '▶'}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedStandards[standard.id] && (
                  <div className={styles.standardDetails}>
                    {/* What Is This? */}
                    <div className={styles.detailSection}>
                      <h4 className={styles.detailTitle}>What is this?</h4>
                      <p className={styles.detailText}>
                        {standard.description}
                      </p>
                    </div>

                    {/* What Does Mastery Mean? */}
                    <div className={styles.detailSection}>
                      <h4 className={styles.detailTitle}>
                        What does mastery mean?
                      </h4>
                      <p className={styles.detailText}>
                        {standard.whatItMeans}
                      </p>
                    </div>

                    {/* How Can I Help? */}
                    <div className={styles.detailSection}>
                      <h4 className={styles.detailTitle}>
                        How can I help at home?
                      </h4>
                      <ul className={styles.tipsList}>
                        {standard.howToHelp.map((tip, index) => (
                          <li key={index} className={styles.tipItem}>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Objectives */}
                    <div className={styles.detailSection}>
                      <h4 className={styles.detailTitle}>
                        What's {data.childName} learning?
                      </h4>
                      <div className={styles.objectivesList}>
                        {standard.objectives.map((obj, index) => (
                          <div
                            key={index}
                            className={styles.objectiveItem}
                          >
                            <div className={styles.objectiveStatus}>
                              {obj.status === 'mastered' && (
                                <span className={styles.masteredIcon}>
                                  ✓
                                </span>
                              )}
                              {obj.status === 'in-progress' && (
                                <span className={styles.inProgressIcon}>
                                  →
                                </span>
                              )}
                              {obj.status === 'not-started' && (
                                <span className={styles.notStartedIcon}>
                                  ○
                                </span>
                              )}
                            </div>
                            <div className={styles.objectiveText}>
                              {obj.text}
                            </div>
                            {obj.isMandatory && (
                              <span className={styles.coreBadge}>
                                Core Skill
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resources */}
                    {standard.recommendedResources.length > 0 && (
                      <div className={styles.detailSection}>
                        <h4 className={styles.detailTitle}>
                          Helpful resources
                        </h4>
                        <div className={styles.resourcesList}>
                          {standard.recommendedResources.map((resource, index) => (
                            <a
                              key={index}
                              href={resource.url}
                              className={styles.resourceItem}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <span className={styles.resourceIcon}>
                                {resource.type === 'video' && '📹'}
                                {resource.type === 'article' && '📄'}
                                {resource.type === 'interactive' && '🎮'}
                                {resource.type === 'practice' && '✏️'}
                              </span>
                              <span>{resource.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Master Calendar */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Upcoming Assessments</h2>
          <p className={styles.sectionSubtitle}>
            School-wide assessments that {data.childName} will participate in:
          </p>

          <div className={styles.calendarTable}>
            <div className={styles.calendarHeader}>
              <div className={styles.calendarCol}>Date</div>
              <div className={styles.calendarCol}>Assessment</div>
              <div className={styles.calendarCol}>Type</div>
              <div className={styles.calendarCol}>Standards Covered</div>
            </div>
            {data.masterCalendarEvents.map((event) => (
              <div key={event.id} className={styles.calendarRow}>
                <div className={styles.calendarCol}>
                  <strong>{formatDate(event.date)}</strong>
                </div>
                <div className={styles.calendarCol}>{event.name}</div>
                <div className={styles.calendarCol}>
                  <span className={styles.typeTag}>
                    {event.type === 'major-assessment' && 'Major Assessment'}
                    {event.type === 'high-stakes' && 'High Stakes'}
                    {event.type === 'quiz' && 'Quiz'}
                    {event.type === 'project' && 'Project'}
                  </span>
                </div>
                <div className={styles.calendarCol}>
                  {data.standards
                    .filter((s) => event.standardsAssessed.includes(s.id))
                    .map((s) => s.name)
                    .join(', ')}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaBox}>
            <h3 className={styles.ctaTitle}>Questions?</h3>
            <p className={styles.ctaText}>
              Reach out to {data.teacher.name} anytime.
            </p>
            <a
              href={`mailto:${data.teacher.email}`}
              className={styles.ctaButton}
            >
              Email {data.teacher.name}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
