/**
 * useAssessmentLog - Custom hook for fetching and submitting assessment logs
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AssessmentLog, CreateAssessmentLogRequest } from "@/lib/types";
import {
  getAssessmentLogs,
  getWeekAssessmentLogs,
  createAssessmentLog,
} from "@/lib/api/endpoints";

export function useAssessmentLogs(
  studentId: string | null,
  weekId: string | null = null
) {
  return useQuery<AssessmentLog[]>({
    queryKey: ["assessmentLogs", studentId, weekId],
    queryFn: () => {
      if (!studentId) throw new Error("No student ID provided");
      return getAssessmentLogs(studentId, weekId || undefined);
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useWeekAssessmentLogs(weekId: string | null) {
  return useQuery<AssessmentLog[]>({
    queryKey: ["weekAssessmentLogs", weekId],
    queryFn: () => {
      if (!weekId) throw new Error("No week ID provided");
      return getWeekAssessmentLogs(weekId);
    },
    enabled: !!weekId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useCreateAssessmentLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      request,
    }: {
      studentId: string;
      request: CreateAssessmentLogRequest;
    }) => createAssessmentLog(studentId, request),

    onSuccess: (_, variables) => {
      // Invalidate assessment log queries
      queryClient.invalidateQueries({
        queryKey: ["assessmentLogs", variables.studentId],
      });

      // Invalidate week assessment logs
      if (variables.request.weekId) {
        queryClient.invalidateQueries({
          queryKey: ["weekAssessmentLogs", variables.request.weekId],
        });
      }
    },

    onError: (error: Error) => {
      console.error("Failed to create assessment log:", error);
    },
  });
}
