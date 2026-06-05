/**
 * useFeedback - Custom hook for submitting feedback
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Feedback, CreateFeedbackRequest } from "@/lib/types";
import { createFeedback } from "@/lib/api/endpoints";

export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      request,
    }: {
      studentId: string;
      request: CreateFeedbackRequest;
    }) => createFeedback(studentId, request),

    onSuccess: (_, variables) => {
      // Invalidate feedback queries
      queryClient.invalidateQueries({
        queryKey: ["feedback", variables.studentId],
      });

      // Invalidate week detail query
      if (variables.request.weekId) {
        queryClient.invalidateQueries({
          queryKey: ["week"],
        });
      }
    },

    onError: (error: Error) => {
      console.error("Failed to create feedback:", error);
    },
  });
}
