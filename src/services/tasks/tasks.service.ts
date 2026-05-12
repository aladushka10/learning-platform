import {
  CreateCheckResultResponseSchema,
  CreateSolutionResponseSchema,
  TaskStatsSchema,
} from "./tasks.contract"
import { TASKS_BASE_URL, TASKS_ENDPOINTS } from "./tasks.constants"
import type {
  CreateCheckResultResponse,
  CreateSolutionResponse,
  TaskStats,
} from "./tasks.type"

type ErrorPayload = {
  detail?: string
  message?: string
  error?: string
  title?: string
}

export class TasksService {
  private static baseURL = TASKS_BASE_URL

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

  static async createSolution(params: {
    taskId: string
    userId: string
    code: string
  }): Promise<CreateSolutionResponse> {
    const res = await fetch(
      `${TasksService.baseURL}${TASKS_ENDPOINTS.taskSolutions(params.taskId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ userId: params.userId, code: params.code }),
      },
    )
    if (!res.ok) {
      throw new Error(await TasksService.parseError(res, "Failed to create solution"))
    }
    return CreateSolutionResponseSchema.parse(await res.json())
  }

  static async trackTaskOpen(taskId: string, userId?: string | null) {
    try {
      await fetch(`${TasksService.baseURL}${TASKS_ENDPOINTS.taskOpen(taskId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ userId: userId || undefined }),
      })
    } catch {
      // best-effort
    }
  }

  static async getTaskStats(taskId: string): Promise<TaskStats> {
    const res = await fetch(
      `${TasksService.baseURL}${TASKS_ENDPOINTS.taskStats(taskId)}`,
      { credentials: "include", cache: "no-store" },
    )
    if (!res.ok) {
      throw new Error(await TasksService.parseError(res, "Failed to fetch task stats"))
    }
    return TaskStatsSchema.parse(await res.json())
  }

  static async deleteTask(taskId: string): Promise<{ ok: true } | { ok: boolean } | void> {
    const res = await fetch(`${TasksService.baseURL}${TASKS_ENDPOINTS.taskById(taskId)}`, {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
    })
    if (!res.ok) {
      throw new Error(await TasksService.parseError(res, "Failed to delete task"))
    }
    // backend returns 204; keep it tolerant
    if (res.status === 204) return
    return res.json().catch(() => undefined)
  }

  static async createCheckResult(params: {
    solutionId: string
    status: string
    time_ms?: number
    passed_tests?: number
    error_message?: string | null
  }): Promise<CreateCheckResultResponse> {
    const res = await fetch(
      `${TasksService.baseURL}${TASKS_ENDPOINTS.solutionCheckResults(params.solutionId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify(params),
      },
    )
    if (!res.ok) {
      throw new Error(
        await TasksService.parseError(res, "Failed to create check result"),
      )
    }
    return CreateCheckResultResponseSchema.parse(await res.json())
  }
}
