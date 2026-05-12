import type { z } from "zod"
import type {
  AdminOkResponseSchema,
  AdminSetRoleResponseSchema,
  AdminTeacherStudentsResponseSchema,
  AdminUserSchema,
  AdminUsersSchema,
} from "./admin.contract"

export type AdminUser = z.infer<typeof AdminUserSchema>
export type AdminUsers = z.infer<typeof AdminUsersSchema>
export type AdminSetRoleResponse = z.infer<typeof AdminSetRoleResponseSchema>
export type AdminTeacherStudentsResponse = z.infer<
  typeof AdminTeacherStudentsResponseSchema
>
export type AdminOkResponse = z.infer<typeof AdminOkResponseSchema>

