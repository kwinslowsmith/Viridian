/**
 * useRatings - Custom hook for submitting and updating student/teacher ratings
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  StudentRating,
  TeacherRating,
  CreateStudentRatingRequest,
  UpdateStudentRatingRequest,
  CreateTeacherRatingRequest,
} from "@/lib/types";
import {
  createStudentRating,
  updateStudentRating,
  createTeacherRating,
} from "@/lib/api/endpoints";

export function useCreateStudentRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      request,
    }: {
      studentId: string;
      request: CreateStudentRatingRequest;
    }) => createStudentRating(studentId, request),

    onSuccess: (_, variables) => {
      // Invalidate student ratings queries
      queryClient.invalidateQueries({
        queryKey: ["studentRatings", variables.studentId],
      });

      // Invalidate week detail query
      if (variables.request.weekId) {
        queryClient.invalidateQueries({
          queryKey: ["week"],
        });
      }
    },

    onError: (error: Error) => {
      console.error("Failed to create student rating:", error);
    },
  });
}

export function useUpdateStudentRating(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ratingId,
      request,
    }: {
      ratingId: string;
      request: UpdateStudentRatingRequest;
    }) => updateStudentRating(ratingId, request),

    onSuccess: () => {
      // Invalidate student ratings queries
      queryClient.invalidateQueries({
        queryKey: ["studentRatings", studentId],
      });

      // Invalidate week detail query
      queryClient.invalidateQueries({
        queryKey: ["week"],
      });
    },

    onError: (error: Error) => {
      console.error("Failed to update student rating:", error);
    },
  });
}

export function useCreateTeacherRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      request,
    }: {
      studentId: string;
      request: CreateTeacherRatingRequest;
    }) => createTeacherRating(studentId, request),

    onSuccess: (_, variables) => {
      // Invalidate teacher ratings queries
      queryClient.invalidateQueries({
        queryKey: ["teacherRatings", variables.studentId],
      });

      // Invalidate week detail and comparison queries
      if (variables.request.weekId) {
        queryClient.invalidateQueries({
          queryKey: ["week"],
        });

        queryClient.invalidateQueries({
          queryKey: ["ratingsComparison"],
        });
      }
    },

    onError: (error: Error) => {
      console.error("Failed to create teacher rating:", error);
    },
  });
}
