'use client';

import React, { useState } from 'react';
import styles from './ParentInterventionAlert.module.css';

interface InterventionAlertProps {
  alertId: string;
  groupName: string;
  objectiveLabel: string;
  objectiveText: string;
  standardName: string;
  studentName: string;
  meetingSchedule: string;
  teacherName: string;
  teacherEmail: string;
  reason?: string;
  onAcknowledge?: (alertId: string) => void;
  isRead?: boolean;
}

export default function ParentInterventionAlert({
  alertId,
  groupName,
  objectiveLabel,
  objectiveText,
  standardName,
  studentName,
  meetingSchedule,
  teacherName,
  teacherEmail,
  reason,
  onAcknowledge,
  isRead = false,
}: InterventionAlertProps) {
  const [acknowledged, setAcknowledged] = useState(isRead);

  const handleAcknowledge = async () => {
    setAcknowledged(true);
    if (onAcknowledge) {
      onAcknowledge(alertId);
    }
  };

  return (
    <div className={`${styles.alert} ${!acknowledged ? styles.unread : styles.read}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.badge}>📌 SUPPORT</span>
          <span className={styles.groupName}>{groupName}</span>
        </div>
        {!acknowledged && <span className={styles.unreadDot} />}
      </div>

      <div className={styles.content}>
        <p className={styles.message}>
          {studentName} has been added to <strong>{groupName}</strong>
        </p>

        <div className={styles.section}>
          <h4>📚 Learning Focus</h4>
          <p>
            <strong>Objective:</strong> {objectiveLabel}
          </p>
          <p className={styles.objectiveText}>{objectiveText}</p>
          <p className={styles.standard}>In: {standardName}</p>
        </div>

        {reason && (
          <div className={styles.section}>
            <h4>❓ Why This Support?</h4>
            <p>{reason}</p>
          </div>
        )}

        <div className={styles.section}>
          <h4>📅 Meeting Details</h4>
          <p>
            <strong>Schedule:</strong> {meetingSchedule}
          </p>
        </div>

        <div className={styles.section}>
          <h4>👨‍🏫 Teacher Contact</h4>
          <p>{teacherName}</p>
          <a href={`mailto:${teacherEmail}`} className={styles.emailLink}>
            {teacherEmail}
          </a>
        </div>

        <p className={styles.supportText}>
          💡 This is a collaborative session designed to help {studentName} master this skill.
          Contact the teacher if you have any questions or concerns.
        </p>
      </div>

      <div className={styles.actions}>
        {!acknowledged ? (
          <button onClick={handleAcknowledge} className={styles.acknowledgeBtn}>
            ✓ Got it - Mark as read
          </button>
        ) : (
          <span className={styles.acknowledgedText}>✓ Acknowledged</span>
        )}
      </div>
    </div>
  );
}
