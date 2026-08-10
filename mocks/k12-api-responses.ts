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

// ============================================================================
// T2: STUDENT STANDARDS & OBJECTIVES (Phase 2)
// ============================================================================

export const mockStudentStandardsObjectives: {
  standards: Array<{
    standardId: string;
    standardCode: string;
    standardName: string;
    unitId: string;
    unitName: string;
    description: string;
    requiredObjectiveCount: number;
    totalObjectiveCount: number;
    classPassPercentage: number;
    standardMasteryPercent: number;
    standardMasteryStatus: 'proficient' | 'developing' | 'approaching' | 'needs_support';
    objectives: Array<{
      objectiveId: string;
      label: string;
      text: string;
      description: string;
      sequenceNum: number;
      isMandatory: boolean;
      studentProgress: {
        masteryStatus: 'proficient' | 'developing' | 'approaching' | 'needs_support';
        masteryPercent: number;
        submittedAt: string | null;
        grade: string | null;
        submissions: Array<{
          id: string;
          score: number;
          feedback: string;
          submittedAt: string;
        }>;
      };
      materials: Array<{
        id: string;
        title: string;
        type: 'material' | 'assessment' | 'video' | 'link';
        url: string;
        uploadedAt: string;
      }>;
      teacherNotes: string;
      masterySummary: string;
    }>;
  }>;
} = {
  standards: [
    {
      standardId: "std_lit_001",
      standardCode: "CCSS.ELA-LITERACY.RL.9-10.2",
      standardName: "Analyze Literary Themes",
      unitId: "unit_002",
      unitName: "Unit 2: Literary Analysis",
      description: "Students analyze development of themes throughout a text",
      requiredObjectiveCount: 3,
      totalObjectiveCount: 8,
      classPassPercentage: 80,
      standardMasteryPercent: 82,
      standardMasteryStatus: "proficient", // proficient, developing, approaching, needs_support
      objectives: [
        {
          objectiveId: "obj_lit_001",
          label: "Obj 2.1.A",
          text: "Identify theme statements",
          description: "Students can articulate explicit and implicit themes",
          sequenceNum: 1,
          isMandatory: true,
          studentProgress: {
            masteryStatus: "proficient",
            masteryPercent: 85,
            submittedAt: "2026-08-08T10:30:00Z",
            grade: "A",
            submissions: [
              {
                id: "sub_001",
                score: 85,
                feedback: "Excellent analysis of character motivation",
                submittedAt: "2026-08-08T10:30:00Z",
              },
            ],
          },
          materials: [
            {
              id: "mat_001",
              title: "Theme Analysis Guide",
              type: "material",
              url: "https://example.com/theme-guide.pdf",
              uploadedAt: "2026-08-01T15:00:00Z",
            },
            {
              id: "mat_002",
              title: "Example Essay",
              type: "material",
              url: "https://example.com/example.pdf",
              uploadedAt: "2026-08-02T14:00:00Z",
            },
          ],
          teacherNotes: "Focus on symbolism when analyzing themes. Great work connecting author's intent to textual evidence.",
          masterySummary: "You've mastered this objective! Keep building on these strong analysis skills.",
        },
        {
          objectiveId: "obj_lit_002",
          label: "Obj 2.1.B",
          text: "Trace theme development across plot",
          description: "Students can track how themes evolve through major plot events",
          sequenceNum: 2,
          isMandatory: true,
          studentProgress: {
            masteryStatus: "developing",
            masteryPercent: 72,
            submittedAt: "2026-08-07T14:15:00Z",
            grade: "C+",
            submissions: [
              {
                id: "sub_002",
                score: 72,
                feedback: "Good effort tracking events. Need to explicitly connect each event to theme change.",
                submittedAt: "2026-08-07T14:15:00Z",
              },
            ],
          },
          materials: [
            {
              id: "mat_003",
              title: "Plot Mapping Template",
              type: "material",
              url: "https://example.com/plot-map.pdf",
              uploadedAt: "2026-08-01T15:00:00Z",
            },
          ],
          teacherNotes: "You're on the right track. Practice making explicit connections between plot events and theme shifts.",
          masterySummary: "You're developing this skill. Keep practicing connecting plot events to thematic meaning.",
        },
        {
          objectiveId: "obj_lit_003",
          label: "Obj 2.1.C",
          text: "Compare themes across texts",
          description: "Students can identify and analyze similar themes in different works",
          sequenceNum: 3,
          isMandatory: true,
          studentProgress: {
            masteryStatus: "proficient",
            masteryPercent: 88,
            submittedAt: "2026-08-09T11:00:00Z",
            grade: "A-",
            submissions: [
              {
                id: "sub_003",
                score: 88,
                feedback: "Sophisticated analysis. Love how you connected the modern film to the classic novel.",
                submittedAt: "2026-08-09T11:00:00Z",
              },
            ],
          },
          materials: [
            {
              id: "mat_004",
              title: "Comparative Analysis Rubric",
              type: "material",
              url: "https://example.com/compare-rubric.pdf",
              uploadedAt: "2026-08-01T15:00:00Z",
            },
          ],
          teacherNotes: "Excellent comparative work! This is exactly the level of analysis we're aiming for.",
          masterySummary: "Excellent work! Your comparative analysis shows sophisticated thinking.",
        },
        {
          objectiveId: "obj_lit_004",
          label: "Obj 2.1.D",
          text: "Analyze author's purpose in theme development (OPTIONAL)",
          description: "Students can infer author's underlying purpose when developing themes",
          sequenceNum: 4,
          isMandatory: false,
          studentProgress: {
            masteryStatus: "approaching",
            masteryPercent: 65,
            submittedAt: "2026-08-06T09:30:00Z",
            grade: "D+",
            submissions: [
              {
                id: "sub_004",
                score: 65,
                feedback: "Good attempt at inferring purpose. Remember to look for patterns across multiple theme instances.",
                submittedAt: "2026-08-06T09:30:00Z",
              },
            ],
          },
          materials: [
            {
              id: "mat_005",
              title: "Author's Purpose Guide",
              type: "material",
              url: "https://example.com/purpose.pdf",
              uploadedAt: "2026-08-01T15:00:00Z",
            },
          ],
          teacherNotes: "This is a challenging objective. Use examples from class discussions to strengthen your inferences.",
          masterySummary: "You're still working on this. Challenge objectives build deeper thinking—keep at it!",
        },
      ],
    },
    {
      standardId: "std_essay_001",
      standardCode: "CCSS.ELA-LITERACY.W.9-10.1",
      standardName: "Write Arguments",
      unitId: "unit_003",
      unitName: "Unit 3: Argumentative Writing",
      description: "Students write arguments to support claims with clear reasons and relevant evidence",
      requiredObjectiveCount: 2,
      totalObjectiveCount: 5,
      classPassPercentage: 75,
      standardMasteryPercent: 71,
      standardMasteryStatus: "developing",
      objectives: [
        {
          objectiveId: "obj_essay_001",
          label: "Obj 3.1.A",
          text: "Develop strong thesis statement",
          description: "Students can craft clear, arguable thesis statements",
          sequenceNum: 1,
          isMandatory: true,
          studentProgress: {
            masteryStatus: "developing",
            masteryPercent: 76,
            submittedAt: "2026-08-06T13:45:00Z",
            grade: "C",
            submissions: [
              {
                id: "sub_005",
                score: 76,
                feedback: "Your thesis is clear but could be more specific about your argument.",
                submittedAt: "2026-08-06T13:45:00Z",
              },
            ],
          },
          materials: [
            {
              id: "mat_006",
              title: "Thesis Checklist",
              type: "material",
              url: "https://example.com/thesis-check.pdf",
              uploadedAt: "2026-08-01T15:00:00Z",
            },
          ],
          teacherNotes: "Review the thesis examples we discussed in class. Make sure your statement is arguable, not factual.",
          masterySummary: "You're developing this skill. Your thesis needs to be more specific and debatable.",
        },
        {
          objectiveId: "obj_essay_002",
          label: "Obj 3.1.B",
          text: "Support claims with textual evidence",
          description: "Students can integrate relevant, accurate evidence to support argument",
          sequenceNum: 2,
          isMandatory: true,
          studentProgress: {
            masteryStatus: "approaching",
            masteryPercent: 58,
            submittedAt: "2026-08-05T10:20:00Z",
            grade: "D",
            submissions: [
              {
                id: "sub_006",
                score: 58,
                feedback: "Evidence is relevant but lacks analysis. Always explain how the quote supports your claim.",
                submittedAt: "2026-08-05T10:20:00Z",
              },
            ],
          },
          materials: [
            {
              id: "mat_007",
              title: "Evidence Integration Examples",
              type: "material",
              url: "https://example.com/evidence.pdf",
              uploadedAt: "2026-08-01T15:00:00Z",
            },
          ],
          teacherNotes: "Let's schedule office hours to review evidence integration strategies. This is critical for argumentative writing.",
          masterySummary: "You're approaching this standard. Your evidence needs stronger analysis and explanation.",
        },
      ],
    },
  ],
};

export const useStudentStandardsObjectives = (classId: string, studentId: string) => {
  return {
    data: mockStudentStandardsObjectives,
    loading: false,
    error: null,
  };
};
