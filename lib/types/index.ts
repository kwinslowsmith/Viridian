// Mastery Levels
export type MasteryLevel = "approaching" | "developing" | "proficient";

// Skill & Objectives
export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  isAnchorForUnit: boolean;
  levelDefinitions: {
    approaching: string;
    developing: string;
    proficient: string;
  };
}

export interface Objective {
  id: string;
  skillId: string;
  text: string;
  description: string;
  isActive: boolean;
}

// Class & Students
export interface Class {
  id: string;
  name: string;
  subtitle: string;
  numWeeks: number;
  instructorId: string;
  pedagogicalContext: "improv" | "k12";
}

export interface Student {
  id: string;
  name: string;
  email: string;
  classId: string;
  enrollmentDate: string;
  status: "active" | "inactive";
}

// Week
export interface Week {
  id: string;
  classId: string;
  weekNum: number;
  title: string;
  focusAreas: string[];
  notes: string;
}

// Ratings
export interface StudentRating {
  id: string;
  studentId: string;
  skillId: string;
  weekId: string;
  level: MasteryLevel;
  narrative: string; // Why student rated themselves here (optional)
  evidence: string; // What work supports this rating (optional)
  createdAt: Date;
  revisedAt?: Date; // Timestamp if student revised after teacher feedback
}

export interface TeacherRating {
  id: string;
  studentId: string;
  skillId: string;
  weekId: string;
  level: MasteryLevel;
  createdAt: Date;
}

// Feedback
export interface Feedback {
  id: string;
  studentId: string;
  skillId: string;
  weekId: string;
  instructorNote: string;
  date: Date;
  visible: boolean;
}

// Assessment Log
export interface AssessmentLog {
  id: string;
  studentId: string;
  skillId: string;
  weekId: string;
  method: string; // e.g., "verbal discussion", "written response", "performance"
  date: Date;
  context: string; // e.g., "Intervention Block", "Class Discussion"
  notes: string;
}

// API Response Shapes
export interface WeekDetailResponse {
  week: Week;
  anchorSkills: Skill[];
  allSkills: Skill[];
  studentRatings: Record<string, Record<string, StudentRating>>;
  teacherRatings: Record<string, Record<string, TeacherRating>>;
  feedback: Feedback[];
  assessmentLog: AssessmentLog[];
}

export interface RatingsComparisonResponse {
  student: Student;
  skillComparisons: {
    skillId: string;
    skillName: string;
    studentRating?: StudentRating;
    teacherRating?: TeacherRating;
    discrepancy: boolean;
    feedback: Feedback[];
  }[];
}
