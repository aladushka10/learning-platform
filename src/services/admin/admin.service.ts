import {
  AdminOkResponseSchema,
  AdminSetRoleResponseSchema,
  AdminTeacherStudentsResponseSchema,
  AdminUsersSchema,
} from "./admin.contract"
import { ADMIN_BASE_URL, ADMIN_ENDPOINTS } from "./admin.constants"
import type {
  AdminOkResponse,
  AdminSetRoleResponse,
  AdminTeacherStudentsResponse,
  AdminUsers,
} from "./admin.type"

type ErrorPayload = {
  detail?: string
  message?: string
  error?: string
  title?: string
}

export class AdminService {
  private static baseURL = ADMIN_BASE_URL

  private static async parseError(res: Response, fallback: string) {
    try {
      const data = (await res.json()) as ErrorPayload
      const msg = data.detail || data.message || data.error || data.title
      return msg ? `${res.status}: ${msg}` : `${res.status}: ${fallback}`
    } catch {
      try {
        const text = (await res.text()).trim()
        if (text) return `${res.status}: ${text}`
      } catch {}
      return `${res.status}: ${fallback}`
    }
  }

  static async listUsers(): Promise<AdminUsers> {
    const res = await fetch(`${AdminService.baseURL}${ADMIN_ENDPOINTS.users()}`, {
      credentials: "include",
      cache: "no-store",
    })
    if (!res.ok) throw new Error(await AdminService.parseError(res, "Failed"))
    return AdminUsersSchema.parse(await res.json())
  }

  static async setUserRole(params: {
    userId: string
    role: "student" | "teacher" | "admin"
  }): Promise<AdminSetRoleResponse> {
    const res = await fetch(
      `${AdminService.baseURL}${ADMIN_ENDPOINTS.setUserRole(params.userId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ role: params.role }),
      },
    )
    if (!res.ok) {
      throw new Error(await AdminService.parseError(res, "Failed"))
    }
    return AdminSetRoleResponseSchema.parse(await res.json())
  }

  static async listTeacherStudents(teacherId: string): Promise<AdminTeacherStudentsResponse> {
    const url = new URL(
      `${AdminService.baseURL}${ADMIN_ENDPOINTS.teacherStudents()}`,
      window.location.origin,
    )
    url.searchParams.set("teacherId", teacherId)
    const res = await fetch(url.toString(), {
      credentials: "include",
      cache: "no-store",
    })
    if (!res.ok) throw new Error(await AdminService.parseError(res, "Failed"))
    return AdminTeacherStudentsResponseSchema.parse(await res.json())
  }

  static async linkTeacherStudent(params: {
    teacherId: string
    studentId: string
  }): Promise<AdminOkResponse> {
    const res = await fetch(
      `${AdminService.baseURL}${ADMIN_ENDPOINTS.teacherStudents()}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify(params),
      },
    )
    if (!res.ok) throw new Error(await AdminService.parseError(res, "Failed"))
    return AdminOkResponseSchema.parse(await res.json())
  }

  static async unlinkTeacherStudent(params: {
    teacherId: string
    studentId: string
  }): Promise<AdminOkResponse> {
    const url = new URL(
      `${AdminService.baseURL}${ADMIN_ENDPOINTS.teacherStudents()}`,
      window.location.origin,
    )
    url.searchParams.set("teacherId", params.teacherId)
    url.searchParams.set("studentId", params.studentId)
    const res = await fetch(url.toString(), {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
    })
    if (!res.ok) throw new Error(await AdminService.parseError(res, "Failed"))
    return AdminOkResponseSchema.parse(await res.json())
  }
}

