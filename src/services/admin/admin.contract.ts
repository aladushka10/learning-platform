import { z } from "zod"

export const AdminUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  avatarId: z.string().optional().nullable(),
  isAdmin: z.any().optional(),
  role: z.enum(["student", "teacher", "admin"]).optional().nullable(),
  createdAt: z.number().optional(),
})

export const AdminUsersSchema = z.array(AdminUserSchema)

export const AdminSetRoleResponseSchema = z
  .object({
    ok: z.boolean().optional(),
    user: AdminUserSchema.optional(),
  })
  .passthrough()

export const AdminStudentSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
  avatarId: z.string().optional().nullable(),
})

export const AdminTeacherStudentsResponseSchema = z.object({
  students: z.array(AdminStudentSchema),
})

export const AdminOkResponseSchema = z.object({
  ok: z.boolean().optional(),
})

