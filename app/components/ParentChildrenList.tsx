'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './ParentChildrenList.module.css';

interface Child {
  id: string;
  name: string;
  email: string;
  currentClass: {
    id: string;
    name: string;
  } | null;
  overallMastery: number | null;
  status: 'excellent' | 'on-track' | 'needs-support' | 'no-active-class' | 'no-objectives';
}

interface ChildrenData {
  parentName: string;
  children: Child[];
}

export function ParentChildrenList() {
  const [data, setData] = useState<ChildrenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await fetch('/api/parents/my-children');
        if (!res.ok) {
          throw new Error('Failed to fetch children');
        }
        const childrenData = await res.json();
        setData(childrenData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

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
          {error || 'Unable to load children'}
        </div>
      </div>
    );
  }

  if (data.children.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{data.parentName}'s Children</h1>
        </div>
        <div className={styles.emptyState}>
          <p>No children linked to your account yet.</p>
          <p>Contact your child's teacher or school to add them.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{data.parentName}'s Children</h1>
        <p className={styles.subtitle}>View progress for each child</p>
      </div>

      {/* Children Grid */}
      <div className={styles.childrenGrid}>
        {data.children.map((child) => (
          <Link
            key={child.id}
            href={`/parents/child/${child.id}/dashboard`}
            className={styles.childCard}
          >
            <div className={styles.childCardContent}>
              <div className={styles.childInfo}>
                <h2 className={styles.childName}>{child.name}</h2>
                {child.currentClass && (
                  <p className={styles.className}>{child.currentClass.name}</p>
                )}
                {!child.currentClass && (
                  <p className={styles.classNameEmpty}>No active class</p>
                )}
              </div>

              <div className={styles.progressArea}>
                {child.status === 'no-active-class' || child.status === 'no-objectives' ? (
                  <div className={styles.noDataArea}>
                    <p className={styles.noDataText}>
                      {child.status === 'no-active-class'
                        ? 'Not enrolled in a class'
                        : 'Class setup in progress'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className={styles.masteryNumber}>
                      {child.overallMastery}%
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={`${styles.progressFill} ${styles[`status-${child.status}`]}`}
                        style={{ width: `${child.overallMastery}%` }}
                      />
                    </div>
                    <div className={styles.statusLabel}>
                      {child.status === 'excellent' && (
                        <span className={styles.statusExcellent}>Excellent Progress</span>
                      )}
                      {child.status === 'on-track' && (
                        <span className={styles.statusOnTrack}>On Track</span>
                      )}
                      {child.status === 'needs-support' && (
                        <span className={styles.statusNeedsSupport}>Needs Support</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.viewLink}>View Progress →</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>Click on any child to view their detailed progress dashboard</p>
      </div>
    </div>
  );
}
