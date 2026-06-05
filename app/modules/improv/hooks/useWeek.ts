/**
 * useWeek - Custom hook for fetching week data with all ratings and feedback
 */

import { useQuery } from "@tanstack/react-query";
import { WeekDetailResponse } from "@/lib/types";
import { getWeekDetail } from "@/lib/api/endpoints";

export function useWeek(classId: string | null, weekId: string | null) {
  return useQuery<WeekDetailResponse>({
    queryKey: ["week", classId, weekId],
    queryFn: () => {
      if (!classId || !weekId) throw new Error("Missing classId or weekId");
      return getWeekDetail(classId, weekId);
    },
    enabled: !!classId && !!weekId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    // Refetch when window regains focus
    refetchOnWindowFocus: true,
  });
}

export function useWeekRefresh(classId: string | null, weekId: string | null) {
  const query = useWeek(classId, weekId);

  return {
    ...query,
    refresh: () => query.refetch(),
  };
}
