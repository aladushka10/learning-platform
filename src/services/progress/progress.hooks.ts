import { useQuery } from "@tanstack/react-query"
import { ProgressService } from "./progress.service"
import { PROGRESS_QUERY_KEYS } from "./progress.constants"
import type { AdminUsersProgressResponse, UserStatsResponse } from "./progress.type"

export function useUserProgress(userId: string | null) {
  return useQuery<UserStatsResponse | null>({
    queryKey: PROGRESS_QUERY_KEYS.userStats(userId),
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null
      return ProgressService.getUserStats(userId)
    },
  })
}

export function useAdminUsersProgress(enabled: boolean) {
  return useQuery<AdminUsersProgressResponse>({
    queryKey: PROGRESS_QUERY_KEYS.adminUsersProgress(),
    enabled,
    queryFn: () => ProgressService.getAdminUsersProgress(),
  })
}
