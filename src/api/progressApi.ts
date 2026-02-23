import type { UserStatsResponse } from "../types/progress"

export async function fetchUserProgressStats(
  userId: string,
): Promise<UserStatsResponse> {
  const res = await fetch(`/api/users/${userId}/stats`)
  if (!res.ok) throw new Error("failed to load user progress")
  return res.json()
}
