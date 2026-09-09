'use client';

import React, { useState, useEffect } from 'react';
import styles from './ParentInterventionNotifications.module.css';
import ParentInterventionAlert from './ParentInterventionAlert';

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

interface Instructor {
  id: string;
  name: string;
  email: string;
}

interface InterventionNotification {
  groupId: string;
  group: InterventionGroup;
  instructor: Instructor;
  studentName: string;
  createdAt: string;
  acknowledged: boolean;
}

interface ParentInterventionNotificationsProps {
  childId: string;
  childName: string;
  classId: string;
}

export default function ParentInterventionNotifications({
  childId,
  childName,
  classId,
}: ParentInterventionNotificationsProps) {
  const [notifications, setNotifications] = useState<InterventionNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all intervention groups for this class
        const groupsResponse = await fetch(
          `/api/k12-classes/${classId}/intervention-groups`
        );
        if (!groupsResponse.ok) {
          throw new Error('Failed to fetch intervention groups');
        }
        const groups = await groupsResponse.json();

        // Filter groups that include this student
        const childGroups = (groups || []).filter((group: InterventionGroup) =>
          group.studentIds.includes(childId)
        );

        // For now, create notifications from intervention groups
        // In production, these would come from stored notification records
        const notifs: InterventionNotification[] = childGroups.map((group: InterventionGroup) => ({
          groupId: group.groupId,
          group,
          instructor: {
            id: '', // Would be populated from API
            name: 'Teacher 1 Rodriguez', // Default for demo
            email: 'teacher1@riverside.edu',
          },
          studentName: childName,
          createdAt: group.startDate || new Date().toISOString(),
          acknowledged: false, // Would be populated from notification records
        }));

        setNotifications(notifs);
      } catch (err) {
        console.error('Error fetching intervention notifications:', err);
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    if (childId && classId) {
      fetchNotifications();
    }
  }, [childId, classId, childName]);

  const handleAcknowledge = async (groupId: string) => {
    // Update local state
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.groupId === groupId ? { ...notif, acknowledged: true } : notif
      )
    );

    // In production, would call API to mark notification as read
    try {
      await fetch(`/api/parents/intervention-notifications/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledged: true }),
      });
    } catch (err) {
      console.error('Error acknowledging notification:', err);
    }
  };

  const displayNotifications = showUnreadOnly
    ? notifications.filter((n) => !n.acknowledged)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.acknowledged).length;

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.loading}>Loading intervention notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>⚠️ {error}</p>
      </div>
    );
  }

  // Don't show container if no notifications
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          📌 Intervention Notifications
          {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={styles.toggleBtn}
          >
            {showUnreadOnly ? 'Show all' : 'Show unread'}
          </button>
        )}
      </div>

      {displayNotifications.length === 0 ? (
        <p className={styles.empty}>
          {unreadCount === 0
            ? 'No intervention notifications'
            : 'No unread notifications'}
        </p>
      ) : (
        <div className={styles.notificationsList}>
          {displayNotifications.map((notif) => (
            <ParentInterventionAlert
              key={notif.groupId}
              alertId={notif.groupId}
              groupName={notif.group.name}
              objectiveLabel={notif.group.objectiveLabel}
              objectiveText={notif.group.objectiveText}
              standardName={notif.group.standardName}
              studentName={notif.studentName}
              meetingSchedule={notif.group.meetingSchedule}
              teacherName={notif.instructor.name}
              teacherEmail={notif.instructor.email}
              reason={`Your child is working on this skill and could benefit from additional support.`}
              onAcknowledge={handleAcknowledge}
              isRead={notif.acknowledged}
            />
          ))}
        </div>
      )}
    </div>
  );
}
