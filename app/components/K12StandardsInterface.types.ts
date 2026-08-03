// K12 Standards Interface Types

export interface Standard {
  id: string;
  name: string;
  domain: string;
  description?: string;
  classCount: number;
  studentCount: number;
}

export interface Class {
  id: string;
  name: string;
  departmentId?: string;
  departmentName?: string;
  studentCount: number;
  standardCount: number;
  avgMasteryLevel: number; // 1-4
}

export interface StudentMastery {
  studentId: string;
  studentName: string;
  email?: string;
  masteryByStandard: Record<string, number>; // standardId -> mastery level (1-4)
  cohort?: string;
  avgMastery?: number;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  masteryByStandard: Record<string, number>;
  cohort?: string;
}

export interface CohortGroup {
  id: string;
  name: string;
  description?: string;
  studentCount: number;
  avgMasteryLevel?: number;
}

export interface K12StandardsData {
  standards: Standard[];
  classes: Class[];
  studentProgress: StudentProgress[];
  cohorts: CohortGroup[];
}

// Mastery level definitions
export const MASTERY_LEVELS = {
  1: { label: 'Approaching', color: '#c2410c', bg: '#fff7ed' },
  2: { label: 'Developing', color: '#a16207', bg: '#fefce8' },
  3: { label: 'Proficient', color: '#166534', bg: '#f0fdf4' },
  4: { label: 'Advanced', color: '#0369a1', bg: '#e0f2fe' },
};

export type MasteryLevel = 1 | 2 | 3 | 4;
