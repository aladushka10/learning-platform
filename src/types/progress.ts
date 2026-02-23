export interface UserStatsResponse {
  streakDays?: number
  achievements?: {
    id: string
    name: string
    description: string
    icon: string
    unlockedAt: number | null
  }[]
  tasks?: { taskId: string; status: string }[]
}
