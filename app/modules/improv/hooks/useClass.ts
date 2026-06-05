/**
 * useClass - Custom hook for fetching class data
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Class } from "@/lib/types";
import { getClass, getClassWithDetails } from "@/lib/api/endpoints";

export function useClass(classId: string | null) {
  return useQuery<Class>({
    queryKey: ["class", classId],
    queryFn: () => {
      if (!classId) throw new Error("No class ID provided");
      return getClassWithDetails(classId);
    },
    enabled: !!classId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useClasses(instructorId: string | null) {
  return useQuery<Class[]>({
    queryKey: ["classes", instructorId],
    queryFn: () => {
      if (!instructorId) throw new Error("No instructor ID provided");
      return Promise.resolve([]); // Will be populated by initial data fetch
    },
    enabled: !!instructorId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useClassPrefetch(classId: string | null) {
  const queryClient = useQueryClient();

  if (classId) {
    queryClient.prefetchQuery({
      queryKey: ["class", classId],
      queryFn: () => getClassWithDetails(classId),
      staleTime: 5 * 60 * 1000,
    });
  }
}
