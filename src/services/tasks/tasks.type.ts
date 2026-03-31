import type { z } from "zod"
import type {
  CheckResultSchema,
  CreateCheckResultResponseSchema,
  CreateSolutionResponseSchema,
  SolutionSchema,
  TaskStatsSchema,
} from "./tasks.contract"

export type TaskStats = z.infer<typeof TaskStatsSchema>
export type Solution = z.infer<typeof SolutionSchema>
export type CheckResult = z.infer<typeof CheckResultSchema>
export type CreateSolutionResponse = z.infer<
  typeof CreateSolutionResponseSchema
>
export type CreateCheckResultResponse = z.infer<
  typeof CreateCheckResultResponseSchema
>
