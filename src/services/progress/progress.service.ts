import { PROGRESS_BASE_URL, PROGRESS_ENDPOINTS } from "./progress.constants"
import { UserStatsResponseSchema } from "./progress.contract"
import type { UserStatsResponse } from "./progress.type"

export class ProgressService {
  private static baseURL = PROGRESS_BASE_URL

  static async getUserStats(userId: string): Promise<UserStatsResponse> {
    const res = await fetch(
      `${ProgressService.baseURL}${PROGRESS_ENDPOINTS.userStats(userId)}`,
      { credentials: "include" },
    )
    if (!res.ok) throw new Error("failed to load user progress")
    const data = await res.json()
    return UserStatsResponseSchema.parse(data)
  }
}

