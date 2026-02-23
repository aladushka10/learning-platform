import { useQuery } from "@tanstack/react-query"
import { fetchUserProgressStats } from "../api/progressApi"
import type { UserStatsResponse } from "../types/progress"

export function useUserProgress(userId: string | null) {
  return useQuery<UserStatsResponse | null>({
    queryKey: ["user-progress", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null
      return fetchUserProgressStats(userId)
    },
    staleTime: 30_000,
  })
}
