// Mastery Levels
export type MasteryLevel = "approaching" | "developing" | "proficient";

// Skill & Objectives
export interface LevelDefinitions {
  approaching: string;
  developing: string;
  proficient: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  isAnchorForUnit: boolean;
  levelDefinitions: LevelDefinitions;
  classId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Objective {
  id: string;
  skillId: string;
  text: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Class & Students
export interface Class {
  id: string;
  name: string;
  subtitle?: string;
  numWeeks: number;
  instructorId: string;
  pedagogicalContext: "improv" | "k12";
  students?: Student[];
  weeks?: Week[];
  skills?: Skill[];
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  name: string;
  email?: string;
  classId: string;
  enrollmentDate: string;
  status: "active" | "inactive";
  studentRatings?: StudentRating[];
  teacherRatings?: TeacherRating[];
  feedback?: Feedback[];
  assessmentLogs?: AssessmentLog[];
  createdAt: string;
  updatedAt: string;
}

// Week
export interface Week {
  id: string;
  classId: string;
  weekNum: number;
  title?: string;
  focusAreas?: string;
  notes?: string;
  studentRatings?: StudentRating[];
  teacherRatings?: TeacherRating[];
  feedback?: Feedback[];
  assessmentLogs?: AssessmentLog[];
  createdAt: string;
  updatedAt: string;
}

// Ratings
export interface StudentRating {
  id: string;
  studentId: string;
  skillId: string;
  weekId: string;
  level: MasteryLevel;
  narrative?: string;
  evidence?: string;
  createdAt: string;
  revisedAt?: string;
  updatedAt: string;
  student?: Student;
  skill?: Skill;
  week?: Week;
}

export interface TeacherRating {
  id: string;
  studentId: string;
  skillId: string;
  weekId: string;
  level: MasteryLevel;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  skill?: Skill;
  week?: Week;
}

// Feedback
export interface Feedback {
  id: string;
  studentId: string;
  skillId: string;
  weekId: string;
  instructorNote: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  skill?: Skill;
  week?: Week;
}

// Assessment Log
export interface AssessmentLog {
  id: string;
  studentId: string;
  skillId: string;
  weekId: string;
  method: string; // e.g., "verbal discussion", "written response", "performance"
  date: string;
  context: string; // e.g., "Intervention Block", "Class Discussion"
  notes?: string;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  skill?: Skill;
  week?: Week;
}

// API Request/Response Shapes
export interface WeekDetailResponse {
  week: Week;
  anchorSkills: Skill[];
  allSkills: Skill[];
  students: Student[];
  studentRatings: StudentRating[];
  teacherRatings: TeacherRating[];
  feedback: Feedback[];
  assessmentLogs: AssessmentLog[];
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

export interface CreateStudentRatingRequest {
  skillId: string;
  weekId: string;
  level: MasteryLevel;
  narrative?: string;
  evidence?: string;
}

export interface UpdateStudentRatingRequest {
  level?: MasteryLevel;
  narrative?: string;
  evidence?: string;
}

export interface CreateTeacherRatingRequest {
  skillId: string;
  weekId: string;
  level: MasteryLevel;
}

export interface CreateFeedbackRequest {
  skillId: string;
  weekId: string;
  instructorNote: string;
}

export interface CreateAssessmentLogRequest {
  skillId: string;
  weekId: string;
  method: string;
  date: string;
  context: string;
  notes?: string;
}
