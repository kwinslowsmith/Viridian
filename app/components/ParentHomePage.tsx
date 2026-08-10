'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './ParentHomePage.module.css';

interface Child {
  id: string;
  name: string;
  gradeLevel?: number;
}

interface Props {
  parentId: string;
}

export default function ParentHomePage({ parentId }: Props) {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/parents/children');
        if (!response.ok) throw new Error('Failed to load children');
        const data = await response.json();
        setChildren(data.children || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load children'
        );
        console.error('Error loading children:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChildren();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingBox}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyBox}>
          <p>No children linked to your account yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>My Children</h1>
        <p className={styles.subtitle}>
          Select a child to view their learning progress
        </p>
      </div>

      {/* Children Grid */}
      <div className={styles.content}>
        <div className={styles.childrenGrid}>
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/app/parents/child/${child.id}/dashboard-k12`}
              className={styles.childCard}
            >
              <div className={styles.childCardContent}>
                <h2 className={styles.childName}>{child.name}</h2>
                {child.gradeLevel && (
                  <p className={styles.gradeLevel}>Grade {child.gradeLevel}</p>
                )}
              </div>
              <div className={styles.arrowIcon}>→</div>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className={styles.quickLinks}>
          <h3 className={styles.quickLinksTitle}>Quick Links</h3>
          <div className={styles.linksList}>
            <Link href="/parents/messages" className={styles.quickLink}>
              📧 Messages with Teachers
            </Link>
            <a href="#" className={styles.quickLink} style={{ opacity: 0.5 }}>
              📚 Resources (coming soon)
            </a>
            <a href="#" className={styles.quickLink} style={{ opacity: 0.5 }}>
              ⚙️ Settings (coming soon)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
