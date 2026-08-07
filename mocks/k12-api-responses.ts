/**
 * Mock K12 API Responses for T2-T4 Component Development
 * These match the real API contracts that T1 will implement
 * Use these to build components in parallel while T1 builds backend
 */

// ============================================================================
// T2: STUDENT PROGRESS DASHBOARD
// ============================================================================

export const mockStudentProgress = {
  studentId: "student-123",
  studentName: "Alex Chen",
  classId: "class-456",
  className: "Biology 101",
  enrolledAt: "2026-08-01",
  standards: [
    {
      id: "std-001",
      name: "Cell Biology Fundamentals",
      code: "CCSS.SCIENCE.HS.LS1.A",
      masteryPercent: 85,
      status: "mastered", // "not-started" | "in-progress" | "mastered"
      trend: "up", // "up" | "stable" | "down"
      objectives: [
        {
          id: "obj-001",
          text: "Identify the major parts of a cell and their functions",
          status: "mastered",
          isMandatory: true,
          submittedAt: "2026-08-05",
          grade: 92,
        },
        {
          id: "obj-002",
          text: "Explain how cells divide and reproduce",
          status: "mastered",
          isMandatory: true,
          submittedAt: "2026-08-04",
          grade: 88,
        },
        {
          id: "obj-003",
          text: "Analyze differences between prokaryotic and eukaryotic cells",
          status: "in-progress",
          isMandatory: false,
          submittedAt: null,
          grade: null,
        },
      ],
      celebration: null,
    },
    {
      id: "std-002",
      name: "Photosynthesis & Energy Transfer",
      code: "CCSS.SCIENCE.HS.LS1.C",
      masteryPercent: 72,
      status: "in-progress",
      trend: "stable",
      objectives: [
        {
          id: "obj-004",
          text: "Describe the role of chloroplasts in photosynthesis",
          status: "mastered",
          isMandatory: true,
          submittedAt: "2026-08-06",
          grade: 95,
        },
        {
          id: "obj-005",
          text: "Trace the path of energy through cellular respiration",
          status: "in-progress",
          isMandatory: true,
          submittedAt: null,
          grade: null,
        },
      ],
      celebration: null,
    },
    {
      id: "std-003",
      name: "Genetics & Heredity",
      code: "CCSS.SCIENCE.HS.LS3.A",
      masteryPercent: 45,
      status: "not-started",
      trend: "down",
      objectives: [
        {
          id: "obj-006",
          text: "Explain Mendel's laws of inheritance",
          status: "not-started",
          isMandatory: true,
          submittedAt: null,
          grade: null,
        },
      ],
      celebration: null,
    },
  ],
  messageFromTeacher:
    "Great progress so far! Focus on photosynthesis next—it builds on what you've learned.",
};

// Celebration variant (shows when student just mastered something)
export const mockStudentProgressWithCelebration = {
  ...mockStudentProgress,
  standards: [
    {
      ...mockStudentProgress.standards[0],
      celebration: {
        objectiveId: "obj-002",
        objectiveText: "Explain how cells divide and reproduce",
        celebrationType: "mastered", // "mastered" | "first-submission" | "high-score"
        message: "🎉 You've mastered Cell Division! Your understanding has grown!",
        timestamp: "2026-08-06T14:32:00Z",
      },
    },
    ...mockStudentProgress.standards.slice(1),
  ],
};

// ============================================================================
// T3: PARENT DASHBOARD
// ============================================================================

export const mockParentProgress = {
  childId: "student-123",
  childName: "Alex Chen",
  gradeLevel: 9,
  classId: "class-456",
  className: "Biology 101",
  teacher: {
    name: "Ms. Johnson",
    email: "ms.johnson@school.edu",
  },
  standards: [
    {
      id: "std-001",
      name: "Cell Biology Fundamentals",
      code: "CCSS.SCIENCE.HS.LS1.A",
      masteryPercent: 85,
      status: "on-track", // "on-track" | "needs-support" | "not-started"
      description:
        "Understanding the structure and function of cells, the basic unit of life.",
      whatItMeans:
        "Mastery means Alex can identify cell parts, explain their functions, and describe how cells work. This is foundational for all biology.",
      howToHelp: [
        "Ask Alex to explain a cell part and why it's important",
        "Watch a Khan Academy video together on cell biology",
        "Quiz Alex on vocabulary: nucleus, mitochondria, chloroplast",
      ],
      objectives: [
        {
          text: "Identify the major parts of a cell and their functions",
          status: "mastered",
          isMandatory: true,
        },
        {
          text: "Explain how cells divide and reproduce",
          status: "mastered",
          isMandatory: true,
        },
        {
          text: "Analyze differences between prokaryotic and eukaryotic cells",
          status: "in-progress",
          isMandatory: false,
        },
      ],
      recommendedResources: [
        { title: "Khan Academy: Intro to Cells", type: "video", url: "#" },
        { title: "Cell Structure Guide", type: "article", url: "#" },
      ],
    },
    {
      id: "std-002",
      name: "Photosynthesis & Energy Transfer",
      code: "CCSS.SCIENCE.HS.LS1.C",
      masteryPercent: 72,
      status: "on-track",
      description: "How plants convert sunlight into chemical energy.",
      whatItMeans:
        "Mastery means Alex understands photosynthesis as the source of energy in food chains.",
      howToHelp: [
        "Discuss how plants use sunlight (relate to Alex's own energy needs)",
        "Explore outdoor plant examples together",
      ],
      objectives: [
        {
          text: "Describe the role of chloroplasts in photosynthesis",
          status: "mastered",
          isMandatory: true,
        },
        {
          text: "Trace the path of energy through cellular respiration",
          status: "in-progress",
          isMandatory: true,
        },
      ],
      recommendedResources: [],
    },
    {
      id: "std-003",
      name: "Genetics & Heredity",
      code: "CCSS.SCIENCE.HS.LS3.A",
      masteryPercent: 0,
      status: "not-started",
      description: "How traits are inherited through DNA.",
      whatItMeans:
        "Mastery means Alex can explain how genes work and predict inheritance patterns.",
      howToHelp: [
        "Start simple: discuss family traits (eye color, hair color)",
        "Explain dominant vs recessive genes using relatable examples",
      ],
      objectives: [
        {
          text: "Explain Mendel's laws of inheritance",
          status: "not-started",
          isMandatory: true,
        },
      ],
      recommendedResources: [],
    },
  ],
  masterCalendarEvents: [
    {
      id: "event-001",
      name: "Unit 1 Assessment (Cells & Division)",
      date: "2026-08-15",
      type: "major-assessment",
      standardsAssessed: ["std-001"],
    },
    {
      id: "event-002",
      name: "Midterm Exam",
      date: "2026-09-30",
      type: "high-stakes",
      standardsAssessed: ["std-001", "std-002", "std-003"],
    },
  ],
  lastUpdate: "2026-08-06T18:00:00Z",
};

// ============================================================================
// T4: TEACHER CLASS DASHBOARD
// ============================================================================

export const mockTeacherClassDashboard = {
  classId: "class-456",
  className: "Biology 101",
  gradeLevel: 9,
  period: "Period 3",
  enrollmentCount: 28,
  classMasteryByStandard: [
    {
      standardId: "std-001",
      standardName: "Cell Biology Fundamentals",
      classMasteryPercent: 78,
      studentsMasteredCount: 22,
      studentsInProgressCount: 5,
      studentsNotStartedCount: 1,
      trend: "up", // "up" | "stable" | "down"
    },
    {
      standardId: "std-002",
      standardName: "Photosynthesis & Energy Transfer",
      classMasteryPercent: 64,
      studentsMasteredCount: 18,
      studentsInProgressCount: 8,
      studentsNotStartedCount: 2,
      trend: "stable",
    },
    {
      standardId: "std-003",
      standardName: "Genetics & Heredity",
      classMasteryPercent: 15,
      studentsMasteredCount: 2,
      studentsInProgressCount: 4,
      studentsNotStartedCount: 22,
      trend: "down",
    },
  ],
  strugglingSkills: [
    {
      objectiveId: "obj-006",
      objectiveText: "Explain Mendel's laws of inheritance",
      standardId: "std-003",
      standardName: "Genetics & Heredity",
      studentCount: 22,
      percentageStuck: 79,
      severity: "critical",
    },
    {
      objectiveId: "obj-005",
      objectiveText: "Trace the path of energy through cellular respiration",
      standardId: "std-002",
      standardName: "Photosynthesis & Energy Transfer",
      studentCount: 8,
      percentageStuck: 29,
      severity: "moderate",
    },
  ],
  interventionGroups: [
    {
      id: "group-001",
      name: "Genetics Reteach (Period 3)",
      objectiveId: "obj-006",
      studentCount: 15,
      meetingSchedule: "Tuesday/Thursday after school",
      startDate: "2026-08-10",
    },
    {
      id: "group-002",
      name: "Photosynthesis Deep Dive",
      objectiveId: "obj-005",
      studentCount: 6,
      meetingSchedule: "Wednesday lunch",
      startDate: "2026-08-09",
    },
  ],
  masterCalendar: [
    {
      id: "event-001",
      date: "2026-08-15",
      type: "assessment",
      name: "Unit 1 Assessment (Cells & Division)",
      standardsAssessed: ["std-001"],
      studentCount: 28,
    },
    {
      id: "event-002",
      date: "2026-08-22",
      type: "lesson",
      name: "Photosynthesis Introduction",
      standardsAssessed: ["std-002"],
      studentCount: 28,
    },
  ],
  pendingSubmissionsCount: 12,
  classHealthScore: 72, // 0-100
  lastUpdate: "2026-08-06T18:00:00Z",
};

// ============================================================================
// HELPER: Use these mocks in components
// ============================================================================

export const useStudentProgress = (classId: string) => {
  // In development: return mock data
  // In production: fetch from /api/k12/classes/[classId]/student-progress
  return {
    data: mockStudentProgress,
    loading: false,
    error: null,
  };
};

export const useParentProgress = (childId: string) => {
  return {
    data: mockParentProgress,
    loading: false,
    error: null,
  };
};

export const useTeacherClassDashboard = (classId: string) => {
  return {
    data: mockTeacherClassDashboard,
    loading: false,
    error: null,
  };
};
