import {
  AdminStudentsResponseSchema,
  AssignmentsListResponseSchema,
  UpsertAssignmentResponseSchema,
} from "./assignments.contract"
import { ASSIGNMENTS_BASE_URL, ASSIGNMENTS_ENDPOINTS } from "./assignments.constants"
import type {
  AdminStudentsResponse,
  AssignmentsListResponse,
  UpsertAssignmentResponse,
} from "./assignments.type"

type ErrorPayload = {
  detail?: string
  message?: string
  error?: string
  title?: string
}

export class AssignmentsService {
  private static baseURL = ASSIGNMENTS_BASE_URL

  private static async parseError(res: Response, fallback: string) {
    try {
      const data = (await res.json()) as ErrorPayload
      return data.detail || data.message || data.error || data.title || fallback
    } catch {
      return fallback
    }
  }

  static async getAdminStudents(): Promise<AdminStudentsResponse> {
    const res = await fetch(
      `${AssignmentsService.baseURL}${ASSIGNMENTS_ENDPOINTS.adminStudents()}`,
      { credentials: "include", cache: "no-store" },
    )
    if (!res.ok) throw new Error(await AssignmentsService.parseError(res, "Failed"))
    return AdminStudentsResponseSchema.parse(await res.json())
  }

  static async getTeacherStudents(): Promise<AdminStudentsResponse> {
    const res = await fetch(
      `${AssignmentsService.baseURL}${ASSIGNMENTS_ENDPOINTS.teacherStudents()}`,
      { credentials: "include", cache: "no-store" },
    )
    if (!res.ok) throw new Error(await AssignmentsService.parseError(res, "Failed"))
    return AdminStudentsResponseSchema.parse(await res.json())
  }

  static async getAdminAssignmentsByUser(userId: string): Promise<AssignmentsListResponse> {
    const url = new URL(
      `${AssignmentsService.baseURL}${ASSIGNMENTS_ENDPOINTS.adminAssignments()}`,
      window.location.origin,
    )
    url.searchParams.set("userId", userId)
    const res = await fetch(url.toString(), { credentials: "include", cache: "no-store" })
    if (!res.ok) throw new Error(await AssignmentsService.parseError(res, "Failed"))
    return AssignmentsListResponseSchema.parse(await res.json())
  }

  static async getTeacherAssignmentsByUser(
    userId: string,
  ): Promise<AssignmentsListResponse> {
    const url = new URL(
      `${AssignmentsService.baseURL}${ASSIGNMENTS_ENDPOINTS.teacherAssignments()}`,
      window.location.origin,
    )
    url.searchParams.set("userId", userId)
    const res = await fetch(url.toString(), { credentials: "include", cache: "no-store" })
    if (!res.ok) throw new Error(await AssignmentsService.parseError(res, "Failed"))
    return AssignmentsListResponseSchema.parse(await res.json())
  }

  static async upsertAdminAssignment(params: {
    userId: string
    taskId: string
    dueAt?: number | null
    note?: string | null
  }): Promise<UpsertAssignmentResponse> {
    const res = await fetch(
      `${AssignmentsService.baseURL}${ASSIGNMENTS_ENDPOINTS.adminAssignments()}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify(params),
      },
    )
    if (!res.ok) {
      throw new Error(await AssignmentsService.parseError(res, "Failed"))
    }
    return UpsertAssignmentResponseSchema.parse(await res.json())
  }

  static async upsertTeacherAssignment(params: {
    userId: string
    taskId: string
    dueAt?: number | null
    note?: string | null
  }): Promise<UpsertAssignmentResponse> {
    const res = await fetch(
      `${AssignmentsService.baseURL}${ASSIGNMENTS_ENDPOINTS.teacherAssignments()}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify(params),
      },
    )
    if (!res.ok) {
      throw new Error(await AssignmentsService.parseError(res, "Failed"))
    }
    return UpsertAssignmentResponseSchema.parse(await res.json())
  }

  static async deleteAdminAssignment(id: string): Promise<{ ok: boolean }> {
    const res = await fetch(
      `${AssignmentsService.baseURL}${ASSIGNMENTS_ENDPOINTS.adminAssignmentById(id)}`,
      { method: "DELETE", credentials: "include", cache: "no-store" },
    )
    if (!res.ok) throw new Error(await AssignmentsService.parseError(res, "Failed"))
    return res.json()
  }

  static async deleteTeacherAssignment(id: string): Promise<{ ok: boolean }> {
    const res = await fetch(
      `${AssignmentsService.baseURL}${ASSIGNMENTS_ENDPOINTS.teacherAssignmentById(id)}`,
      { method: "DELETE", credentials: "include", cache: "no-store" },
    )
    if (!res.ok) throw new Error(await AssignmentsService.parseError(res, "Failed"))
    return res.json()
  }

  static async getUserAssignments(userId: string): Promise<AssignmentsListResponse> {
    const res = await fetch(
      `${AssignmentsService.baseURL}${ASSIGNMENTS_ENDPOINTS.userAssignments(userId)}`,
      { credentials: "include", cache: "no-store" },
    )
    if (!res.ok) throw new Error(await AssignmentsService.parseError(res, "Failed"))
    return AssignmentsListResponseSchema.parse(await res.json())
  }
}

