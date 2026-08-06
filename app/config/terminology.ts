/**
 * Terminology & Copy Configuration
 * Centralized source of truth for user-facing text across all roles
 * Updated August 6, 2026 - Pre-Launch terminology improvements
 */

export const terminology = {
  student: {
    headers: {
      learningObjectives: 'What You\'ll Learn',
      submission: 'Your Work',
      selfAssessment: 'Your Reflection',
      teacherFeedback: 'Teacher Feedback',
    },
    labels: {
      objective: 'Learning Goal',
      standard: 'Skill',
      coreSkills: 'Core Skills to Master',
      challengeObjectives: 'Challenge Objectives',
      needThisOne: 'You need this one for mastery',
    },
    badges: {
      mandatory: {
        label: 'Core Skill',
        backgroundColor: '#3b82f6', // Blue instead of red
        color: 'white',
      },
      optional: {
        label: 'Challenge Skill',
        backgroundColor: '#8b5cf6', // Purple
        color: 'white',
      },
    },
    status: {
      notStarted: 'Not Yet Started',
      submitted: 'Submitted',
      graded: 'Graded',
      passed: 'Mastered',
      failed: 'Needs Improvement',
    },
    prompts: {
      submissionPlaceholder: 'Write your response here...',
      reflectionPlaceholder: 'How are you feeling about your work?',
      selfAssessmentPrompt: 'How are you feeling about your work?',
    },
    messages: {
      submissionSuccess: 'Great! Your work is submitted',
      masteredSuccess: '🎉 Well done! You\'ve mastered this skill',
      needsImprovement: 'You\'ve got this! Here\'s what to work on...',
      progressCta: 'Ready to begin? Click here to start',
    },
  },

  teacher: {
    headers: {
      gradingDashboard: 'Grading Inbox',
      feedback: 'Your Feedback & Guidance',
    },
    labels: {
      masterized: 'Student mastered this objective',
      status: {
        waitingForGrade: 'Waiting for grade',
        pending: 'Pending feedback',
      },
      masteryThreshold: 'Mastery Threshold',
      masteryRate: '% Mastered',
      requiresReteaching: 'Requires reteaching',
    },
    prompts: {
      feedbackPlaceholder: 'Help them improve: What went well? What\'s next?',
    },
    messages: {
      gradedSubmission: 'Your work has been reviewed!',
      submissionReceived: 'Work submitted',
    },
  },

  admin: {
    labels: {
      masteryPercentage: 'Mastery %',
      masteryRate: 'Mastery Rate',
      implementationHealth: 'Implementation Health',
      teacherHealthScore: 'Teacher Health Score',
      belowTarget: 'Below target',
      needsAttention: 'Needs attention',
      pendingSubmissions: 'Pending submissions',
      awaitingFeedback: 'Awaiting feedback',
    },
    trends: {
      progressTrend: 'Progress trend',
      onTrack: 'On track',
      rapidProgress: 'Rapid progress',
      atRisk: 'At risk',
    },
  },

  colors: {
    mandatory: '#3b82f6', // Blue (Core Skill)
    optional: '#8b5cf6', // Purple (Challenge)
    success: '#10b981', // Green
    pending: '#f59e0b', // Orange
    neutral: '#9ca3af', // Grey
    alert: '#ef4444', // Red (only for true alerts)
  },
};

/**
 * Helper function to get status label
 */
export function getStatusLabel(status: string, role: 'student' | 'teacher' = 'student'): string {
  if (role === 'student') {
    return terminology.student.status[status as keyof typeof terminology.student.status] || status;
  }
  return status;
}

/**
 * Helper function to get mandatory badge info
 */
export function getMandatoryBadgeInfo(isMandatory: boolean) {
  return isMandatory ? terminology.student.badges.mandatory : terminology.student.badges.optional;
}
