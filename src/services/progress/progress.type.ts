import { z } from "zod"
import {
  AdminUsersProgressResponseSchema,
  UserStatsResponseSchema,
} from "./progress.contract"

export type UserStatsResponse = z.infer<typeof UserStatsResponseSchema>
export type AdminUsersProgressResponse = z.infer<
  typeof AdminUsersProgressResponseSchema
>

