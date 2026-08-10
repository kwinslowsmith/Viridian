'use client';

import React, { useState, useEffect } from 'react';
import styles from './ParentMessagesView.module.css';
import ParentTeacherMessaging from './ParentTeacherMessaging';

interface Child {
  id: string;
  name: string;
  gradeLevel?: number;
}

interface Props {
  parentId: string;
}

export default function ParentMessagesView({ parentId }: Props) {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load parent's children
  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/parents/children');
        if (!response.ok) throw new Error('Failed to load children');
        const data = await response.json();
        setChildren(data.children || []);
        if (data.children && data.children.length > 0) {
          setSelectedChild(data.children[0]);
        }
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
          <p className={styles.loadingText}>Loading your messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>
          <p className={styles.errorText}>{error}</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyBox}>
          <p className={styles.emptyText}>
            You don't have any children linked to your account yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Messages</h1>
          <p className={styles.subtitle}>
            Communicate with your child's teachers
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Child Selector */}
        <div className={styles.childSelectorSection}>
          <h2 className={styles.sectionTitle}>Select a child</h2>
          <div className={styles.childGrid}>
            {children.map((child) => (
              <button
                key={child.id}
                className={`${styles.childButton} ${
                  selectedChild?.id === child.id
                    ? styles.childButtonActive
                    : ''
                }`}
                onClick={() => setSelectedChild(child)}
              >
                <p className={styles.childName}>{child.name}</p>
                {child.gradeLevel && (
                  <p className={styles.gradeLevel}>Grade {child.gradeLevel}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Messaging Panel */}
        {selectedChild && (
          <div className={styles.messagingSection}>
            <ParentTeacherMessaging
              childId={selectedChild.id}
              childName={selectedChild.name}
              parentId={parentId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
