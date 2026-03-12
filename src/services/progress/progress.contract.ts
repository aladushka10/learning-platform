import { z } from "zod"

export const ProgressAchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  unlockedAt: z.number().nullable(),
})

export const UserStatsResponseSchema = z.object({
  streakDays: z.number().optional(),
  achievements: z.array(ProgressAchievementSchema).optional(),
  tasks: z.array(z.object({ taskId: z.string(), status: z.string() })).optional(),
})

