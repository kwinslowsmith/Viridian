/**
 * K12 Standards API utilities
 * Provides methods to fetch standards, classes, students, and mastery data
 */

import { apiClient } from './client';

export interface StandardResponse {
  id: string;
  code: string;
  name: string;
  description: string;
  type: string;
  passPercentage: number;
  unit?: { id: string; name: string };
  skillCategory?: unknown;
  objectiveCount: number;
  objectives?: Array<{ id: string; label: string; text: string }>;
  stats?: { studentsTracked: number; resourcesLinked: number };
}

export interface StandardsListResponse {
  standards: StandardResponse[];
  count: number;
}

export interface StudentProgressData {
  student: {
    id: string;
    name: string;
    email: string;
    classes: Array<{
      id: string;
      name: string;
      gradeLevel: string;
      subject: string;
      enrolledAt: string;
      status: string;
    }>;
  };
  progress: {
    standards: Array<{
      standardId: string;
      standardCode: string;
      standardName: string;
      standardDescription: string;
      type: string;
      masteryLevel: number;
      completed: boolean;
      lastAssessedAt: string;
      completedAt?: string;
      classId: string;
      unit?: { id: string; name: string; code: string };
      skillCategory?: unknown;
    }>;
    objectives: Array<{
      objectiveId: string;
      objectiveLabel: string;
      objectiveText: string;
      standardId: string;
      completed: boolean;
      completedAt?: string;
    }>;
  };
  summary: {
    totalStandards: number;
    proficientCount: number;
    developingCount: number;
    approachingCount: number;
    unassessedCount: number;
    averageMastery: string;
  };
}

export interface StudentData {
  id: string;
  name: string;
  email: string;
  classId: string;
  className: string;
  enrolledAt: string;
  status: string;
}

export interface StudentsListResponse {
  students: StudentData[];
  count: number;
}

export interface MasterySummaryRow {
  studentId: string;
  studentName: string;
  studentEmail: string;
  masteryByStandard: Array<{
    standardId: string;
    standardCode: string;
    standardName: string;
    masteryLevel: number;
    completed: boolean;
    lastScoredAt?: string;
  }>;
}

export interface ClassMasterySummaryResponse {
  class: {
    id: string;
    name: string;
    gradeLevel: string;
    subject: string;
    instructorId: string;
    instructorName: string;
    organizationId: string;
    organizationName: string;
  };
  students: Array<{ id: string; name: string; email: string }>;
  standards: Array<{
    id: string;
    code: string;
    name: string;
    type: string;
    unit?: { id: string; code: string; name: string };
    skillCategory?: unknown;
  }>;
  matrix: MasterySummaryRow[];
  summary: {
    totalStudents: number;
    totalStandards: number;
    totalAssessments: number;
    proficientCount: number;
    developingCount: number;
    approachingCount: number;
    unassessedCount: number;
    averageMastery: number;
    proficiencyRate: string;
  };
}

/**
 * Fetch standards by domain/organization
 */
export async function fetchStandardsByDomain(
  organizationId: string,
  filters?: { type?: string; unitId?: string; skillCategoryId?: string }
): Promise<StandardResponse[]> {
  const params: Record<string, string> = { domain: organizationId };
  if (filters?.type) params.type = filters.type;
  if (filters?.unitId) params.unitId = filters.unitId;
  if (filters?.skillCategoryId) params.skillCategoryId = filters.skillCategoryId;

  try {
    const response = await apiClient.get<StandardsListResponse>('/standards', { params });
    return response.standards || [];
  } catch (error) {
    console.error('Error fetching standards:', error);
    throw error;
  }
}

/**
 * Fetch student progress by student ID
 */
export async function fetchStudentProgress(
  studentId: string,
  organizationId: string,
  classId?: string
): Promise<StudentProgressData> {
  const params: Record<string, string> = { domain: organizationId };
  if (classId) params.classId = classId;

  try {
    return await apiClient.get<StudentProgressData>(`/students/${studentId}/progress`, {
      params,
    });
  } catch (error) {
    console.error(`Error fetching progress for student ${studentId}:`, error);
    throw error;
  }
}

/**
 * Fetch all students in organization or class
 */
export async function fetchStudents(
  organizationId: string,
  classId?: string
): Promise<StudentData[]> {
  const params: Record<string, string> = { domain: organizationId };
  if (classId) params.classId = classId;

  try {
    const response = await apiClient.get<StudentsListResponse>('/students', { params });
    return response.students || [];
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
}

/**
 * Fetch class mastery summary grid
 */
export async function fetchClassMasterySummary(
  classId: string,
  organizationId: string,
  filters?: { type?: string; unitId?: string }
): Promise<ClassMasterySummaryResponse> {
  const params: Record<string, string> = { domain: organizationId };
  if (filters?.type) params.type = filters.type;
  if (filters?.unitId) params.unitId = filters.unitId;

  try {
    return await apiClient.get<ClassMasterySummaryResponse>(
      `/classes/${classId}/mastery-summary`,
      { params }
    );
  } catch (error) {
    console.error(`Error fetching mastery summary for class ${classId}:`, error);
    throw error;
  }
}

/**
 * Update student progress for a standard
 */
export async function updateStudentProgress(
  studentId: string,
  organizationId: string,
  classId: string,
  standardId: string,
  level: number,
  completed?: boolean,
  objectiveUpdates?: Array<{ objectiveId: string; completed: boolean }>
): Promise<void> {
  const body = {
    domain: organizationId,
    classId,
    standardId,
    level,
    completed,
    objectiveProgressUpdates: objectiveUpdates,
  };

  try {
    await apiClient.put(`/students/${studentId}/progress`, body);
  } catch (error) {
    console.error(`Error updating progress for student ${studentId}:`, error);
    throw error;
  }
}

/**
 * Bulk update mastery levels for a class
 */
export async function bulkUpdateClassMastery(
  classId: string,
  organizationId: string,
  updates: Array<{ studentId: string; standardId: string; level: number }>
): Promise<{ successCount: number; errorCount: number }> {
  const body = {
    domain: organizationId,
    updates,
  };

  try {
    const response = await apiClient.post<{
      successCount: number;
      errorCount: number;
    }>(`/classes/${classId}/mastery-summary/bulk-update`, body);
    return response;
  } catch (error) {
    console.error(`Error bulk updating mastery for class ${classId}:`, error);
    throw error;
  }
}

/**
 * Calculate mastery status for a standard based on mandatory/optional objectives
 * @param objectives - Array of objectives with isMandatory flag
 * @param progressMap - Object mapping objective ID to score (0-100)
 * @param passPercentage - Threshold percentage for passing (default 80)
 * @returns Object with passed, mandatoryComplete, and overallScore
 */
export function calculateStandardMastery(
  objectives: Array<{ id: string; isMandatory?: boolean }>,
  progressMap: Record<string, number>,
  passPercentage: number = 80
): { passed: boolean; mandatoryComplete: boolean; overallScore: number } {
  const mandatory = objectives.filter(o => o.isMandatory);
  const allScores = objectives.map(o => progressMap[o.id] ?? 0);

  const mandatoryComplete =
    mandatory.length === 0 ||
    mandatory.every(o => (progressMap[o.id] ?? 0) >= passPercentage);

  const overallScore =
    allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;

  const passed = mandatoryComplete && overallScore >= passPercentage;

  return { passed, mandatoryComplete, overallScore };
}
