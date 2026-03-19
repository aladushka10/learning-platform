import {
  AuthOkResponseSchema,
  AuthResponseSchema,
  AuthSessionSchema,
  SignInPayloadSchema,
  SignUpPayloadSchema,
} from "./auth.contract"
import { AUTH_BASE_URL, AUTH_ENDPOINTS } from "./auth.constants"
import type {
  AuthOkResponse,
  AuthResponse,
  AuthSession,
  SignInPayload,
  SignUpPayload,
} from "./auth.type"

type ErrorPayload = {
  detail?: string
  message?: string
  error?: string
  title?: string
}

export class AuthService {
  private static baseURL = AUTH_BASE_URL

  private static async parseError(res: Response, fallback: string) {
    try {
      const data = (await res.json()) as ErrorPayload
      return data.detail || data.message || data.error || data.title || fallback
    } catch {
      return fallback
    }
  }

  static async signIn(payload: SignInPayload): Promise<AuthResponse> {
    const parsedPayload = SignInPayloadSchema.parse(payload)
    const res = await fetch(`${AuthService.baseURL}${AUTH_ENDPOINTS.signIn}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(parsedPayload),
    })

    if (!res.ok) {
      throw new Error(await AuthService.parseError(res, "Sign-in failed"))
    }

    return AuthResponseSchema.parse(await res.json())
  }

  static async signUp(payload: SignUpPayload): Promise<AuthResponse> {
    const parsedPayload = SignUpPayloadSchema.parse(payload)
    const res = await fetch(`${AuthService.baseURL}${AUTH_ENDPOINTS.signUp}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(parsedPayload),
    })

    if (!res.ok) {
      throw new Error(await AuthService.parseError(res, "Sign-up failed"))
    }

    return AuthResponseSchema.parse(await res.json())
  }

  static async signOut(): Promise<AuthOkResponse> {
    const res = await fetch(`${AuthService.baseURL}${AUTH_ENDPOINTS.signOut}`, {
      method: "POST",
      credentials: "include",
    })

    if (!res.ok) {
      throw new Error(await AuthService.parseError(res, "Sign-out failed"))
    }

    return AuthOkResponseSchema.parse(await res.json())
  }

  static async getSession(): Promise<AuthSession> {
    const res = await fetch(`${AuthService.baseURL}${AUTH_ENDPOINTS.me}`, {
      credentials: "include",
    })

    if (!res.ok) {
      throw new Error(await AuthService.parseError(res, "Unauthorized"))
    }

    return AuthSessionSchema.parse(await res.json())
  }
}
