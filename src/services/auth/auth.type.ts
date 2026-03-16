import type { z } from "zod"
import type {
  AuthOkResponseSchema,
  AuthResponseSchema,
  AuthSessionSchema,
  SignInPayloadSchema,
  SignUpPayloadSchema,
} from "./auth.contract"

export type SignInPayload = z.infer<typeof SignInPayloadSchema>
export type SignUpPayload = z.infer<typeof SignUpPayloadSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
export type AuthSession = z.infer<typeof AuthSessionSchema>
export type AuthOkResponse = z.infer<typeof AuthOkResponseSchema>
