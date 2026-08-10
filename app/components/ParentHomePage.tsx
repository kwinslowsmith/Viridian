'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/parents/children', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        if (data.children && data.children.length > 0) {
          setChildren(data.children);
        } else {
          setError('No children linked to your account');
        }
      } catch (err) {
        console.error('Error loading children:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load children. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadChildren();
  }, [router]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Children</h1>
          <p className={styles.subtitle}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Children</h1>
          <p className={styles.subtitle}>Select a child to view their learning progress</p>
        </div>
        <div className={styles.content}>
          <div className={styles.errorBox}>
            <p>{error}</p>
            <p style={{ fontSize: '14px', marginTop: '10px', color: '#9ca3af' }}>
              Try refreshing the page or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Children</h1>
          <p className={styles.subtitle}>Select a child to view their learning progress</p>
        </div>
        <div className={styles.content}>
          <div className={styles.emptyBox}>
            <p>No children linked to your account yet.</p>
          </div>
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

        {/* Debug: Direct link to test child */}
        <div style={{ marginTop: '40px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: '#92400e' }}>Debug Link</p>
          <Link
            href="/app/parents/child/cmsjazbgb0003ugct0889inmo/dashboard-k12"
            style={{ color: '#b45309', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}
          >
            → View Student 1 Chen Dashboard (Test)
          </Link>
        </div>
      </div>
    </div>
  );
}
