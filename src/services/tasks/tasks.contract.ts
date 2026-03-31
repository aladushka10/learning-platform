import { z } from "zod"

export const TaskStatsSchema = z.object({
  userId: z.string().optional(),
  taskId: z.string().optional(),
  opens: z.number().optional().default(0),
  attempts: z.number().optional().default(0),
  successes: z.number().optional().default(0),
  lastAttemptAt: z.number().nullable().optional().default(null),
})

export const SolutionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  task_id: z.string(),
  code: z.string(),
  created_at: z.number(),
})

export const CheckResultSchema = z.object({
  id: z.string(),
  solution_id: z.string(),
  status: z.string(),
  time_ms: z.number().optional(),
  passed_tests: z.number().optional(),
  error_message: z.string().nullable().optional(),
})

export const AchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional().nullable(),
  unlockedAt: z.number().optional().nullable(),
})

export const CreateSolutionResponseSchema = z.object({
  ok: z.boolean().optional(),
  correct: z.boolean().optional(),
  solution: SolutionSchema.optional(),
  checkResult: CheckResultSchema.optional(),
  newAchievements: z.array(AchievementSchema).optional().default([]),
})

export const CreateCheckResultResponseSchema = CheckResultSchema
