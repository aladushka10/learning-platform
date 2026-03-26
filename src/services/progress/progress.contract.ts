import { z } from "zod"

export const ProgressAchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  unlockedAt: z.number().nullable(),
})

export const UserStatsResponseSchema = z.object({
  totalTasks: z.number().optional(),
  completedTasks: z.number().optional(),
  inProgressTasks: z.number().optional(),
  notStartedTasks: z.number().optional(),
  completionRate: z.number().optional(),
  streakDays: z.number().optional(),
  achievements: z.array(ProgressAchievementSchema).optional(),
  tasks: z
    .array(
      z.object({
        taskId: z.string(),
        taskTitle: z.string().optional(),
        category: z.enum(["math", "cs"]).optional(),
        status: z.string(),
        updatedAt: z.number().nullable().optional(),
      }),
    )
    .optional(),
})

