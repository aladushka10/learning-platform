import { z } from "zod"
import { UserStatsResponseSchema } from "./progress.contract"

export type UserStatsResponse = z.infer<typeof UserStatsResponseSchema>

