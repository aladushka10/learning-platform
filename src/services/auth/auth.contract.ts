import { z } from "zod"

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  avatarId: z.string().nullable().optional(),
})

export const AuthSessionSchema = AuthUserSchema.extend({
  createdAt: z.number().optional(),
})

export const AuthResponseSchema = z.object({
  userDetails: AuthUserSchema,
})

export const AuthOkResponseSchema = z.object({
  ok: z.boolean(),
})

export const SignInPayloadSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})

export const SignUpPayloadSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  firstName: z.string().trim().min(1),
  lastName: z.string().optional().default(""),
})
