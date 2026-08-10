'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './ParentDashboardMessagingWidget.module.css';

interface TeacherStatus {
  teacher: {
    id: string;
    name: string;
  };
  unreadCount: number;
  lastMessage?: {
    text: string;
    sentAt: string;
  };
}

interface Props {
  childId: string;
  childName: string;
}

export default function ParentDashboardMessagingWidget({
  childId,
  childName,
}: Props) {
  const [teachers, setTeachers] = useState<TeacherStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/k12/parents/children/${childId}/teachers`
        );
        if (!response.ok) throw new Error('Failed to load teachers');
        const data = await response.json();
        setTeachers(data.teachers.slice(0, 3) || []);
      } catch (err) {
        setError('Could not load messages');
        console.error('Error loading teachers:', err);
      } finally {
        setLoading(false);
      }
    };

    if (childId) {
      loadTeachers();
    }
  }, [childId]);

  const totalUnread = teachers.reduce((sum, t) => sum + t.unreadCount, 0);

  if (loading) return null;
  if (error) return null;
  if (teachers.length === 0) return null;

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h3 className={styles.title}>Messages</h3>
        {totalUnread > 0 && (
          <span className={styles.badge}>{totalUnread}</span>
        )}
      </div>

      <div className={styles.teachersList}>
        {teachers.map((tc) => (
          <Link
            key={tc.teacher.id}
            href="/parents/messages"
            className={styles.teacherItem}
          >
            <div className={styles.teacherInfo}>
              <p className={styles.teacherName}>{tc.teacher.name}</p>
              {tc.lastMessage && (
                <p className={styles.preview}>
                  {tc.lastMessage.text.substring(0, 35)}...
                </p>
              )}
            </div>
            {tc.unreadCount > 0 && (
              <span className={styles.unreadBadge}>{tc.unreadCount}</span>
            )}
          </Link>
        ))}
      </div>

      <Link href="/parents/messages" className={styles.viewAll}>
        View all messages →
      </Link>
    </div>
  );
}
