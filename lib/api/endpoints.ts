/**
 * API Endpoints for Viridian Improv Module
 */

import {
  Class,
  Student,
  Week,
  Skill,
  StudentRating,
  TeacherRating,
  Feedback,
  AssessmentLog,
  WeekDetailResponse,
  RatingsComparisonResponse,
  CreateStudentRatingRequest,
  UpdateStudentRatingRequest,
  CreateTeacherRatingRequest,
  CreateFeedbackRequest,
  CreateAssessmentLogRequest,
} from "@/lib/types";
import { apiClient } from "./client";

/**
 * Class endpoints
 */
export async function getClasses(instructorId: string): Promise<Class[]> {
  return apiClient.get(`/improv/instructor/${instructorId}/classes`);
}

export async function getClass(classId: string): Promise<Class> {
  return apiClient.get(`/improv/classes/${classId}`);
}

export async function getClassWithDetails(classId: string): Promise<Class> {
  return apiClient.get(`/improv/classes/${classId}?include=students,weeks,skills`);
}

/**
 * Student endpoints
 */
export async function getStudent(studentId: string): Promise<Student> {
  return apiClient.get(`/improv/students/${studentId}`);
}

export async function getClassStudents(classId: string): Promise<Student[]> {
  return apiClient.get(`/improv/classes/${classId}/students`);
}

/**
 * Week endpoints
 */
export async function getWeek(weekId: string): Promise<Week> {
  return apiClient.get(`/improv/weeks/${weekId}`);
}

export async function getClassWeeks(classId: string): Promise<Week[]> {
  return apiClient.get(`/improv/classes/${classId}/weeks`);
}

export async function getWeekDetail(
  classId: string,
  weekId: string
): Promise<WeekDetailResponse> {
  return apiClient.get(`/improv/classes/${classId}/weeks/${weekId}`);
}

/**
 * Skill endpoints
 */
export async function getClassSkills(classId: string): Promise<Skill[]> {
  return apiClient.get(`/improv/classes/${classId}/skills`);
}

export async function getSkill(skillId: string): Promise<Skill> {
  return apiClient.get(`/improv/skills/${skillId}`);
}

/**
 * Student Rating endpoints
 */
export async function createStudentRating(
  studentId: string,
  request: CreateStudentRatingRequest
): Promise<StudentRating> {
  return apiClient.post(`/improv/students/${studentId}/ratings`, request);
}

export async function updateStudentRating(
  ratingId: string,
  request: UpdateStudentRatingRequest
): Promise<StudentRating> {
  return apiClient.patch(`/improv/student-ratings/${ratingId}`, request);
}

export async function getStudentRatings(
  studentId: string,
  weekId?: string
): Promise<StudentRating[]> {
  const params: Record<string, string | number | boolean> = {};
  if (weekId) params.weekId = weekId;
  return apiClient.get(`/improv/students/${studentId}/ratings`, { params });
}

export async function getStudentRating(
  studentId: string,
  skillId: string,
  weekId: string
): Promise<StudentRating | null> {
  try {
    return await apiClient.get(
      `/improv/students/${studentId}/ratings/${skillId}`,
      {
        params: { weekId },
      }
    );
  } catch (error) {
    return null;
  }
}

/**
 * Teacher Rating endpoints
 */
export async function createTeacherRating(
  studentId: string,
  request: CreateTeacherRatingRequest
): Promise<TeacherRating> {
  return apiClient.post(`/improv/students/${studentId}/teacher-ratings`, request);
}

export async function getTeacherRatings(
  studentId: string,
  weekId?: string
): Promise<TeacherRating[]> {
  const params: Record<string, string | number | boolean> = {};
  if (weekId) params.weekId = weekId;
  return apiClient.get(`/improv/students/${studentId}/teacher-ratings`, {
    params,
  });
}

export async function getTeacherRating(
  studentId: string,
  skillId: string,
  weekId: string
): Promise<TeacherRating | null> {
  try {
    return await apiClient.get(
      `/improv/students/${studentId}/teacher-ratings/${skillId}`,
      {
        params: { weekId },
      }
    );
  } catch (error) {
    return null;
  }
}

/**
 * Feedback endpoints
 */
export async function createFeedback(
  studentId: string,
  request: CreateFeedbackRequest
): Promise<Feedback> {
  return apiClient.post(`/improv/students/${studentId}/feedback`, request);
}

export async function getFeedback(
  studentId: string,
  weekId?: string
): Promise<Feedback[]> {
  const params: Record<string, string | number | boolean> = {};
  if (weekId) params.weekId = weekId;
  return apiClient.get(`/improv/students/${studentId}/feedback`, { params });
}

/**
 * Assessment Log endpoints
 */
export async function createAssessmentLog(
  studentId: string,
  request: CreateAssessmentLogRequest
): Promise<AssessmentLog> {
  return apiClient.post(`/improv/students/${studentId}/assessment-logs`, request);
}

export async function getAssessmentLogs(
  studentId: string,
  weekId?: string
): Promise<AssessmentLog[]> {
  const params: Record<string, string | number | boolean> = {};
  if (weekId) params.weekId = weekId;
  return apiClient.get(`/improv/students/${studentId}/assessment-logs`, {
    params,
  });
}

export async function getWeekAssessmentLogs(
  weekId: string
): Promise<AssessmentLog[]> {
  return apiClient.get(`/improv/weeks/${weekId}/assessment-logs`);
}

/**
 * Comparison endpoints
 */
export async function getRatingsComparison(
  studentId: string,
  weekId: string
): Promise<RatingsComparisonResponse> {
  return apiClient.get(
    `/improv/students/${studentId}/ratings-comparison`,
    {
      params: { weekId },
    }
  );
}
