import {
  LectureQuizSchema,
  LectureSchema,
  SubmitLectureQuizResponseSchema,
  UserLectureStatsSchema,
} from "./lectures.contract"
import { LECTURES_BASE_URL, LECTURES_ENDPOINTS } from "./lectures.constants"
import type {
  Lecture,
  LectureQuiz,
  SubmitLectureQuizResponse,
  UserLectureStats,
} from "./lectures.type"

type ErrorPayload = {
  detail?: string
  message?: string
  error?: string
  title?: string
}

export class LecturesService {
  private static baseURL = LECTURES_BASE_URL

  private static async parseError(res: Response, fallback: string) {
    try {
      const data = (await res.json()) as ErrorPayload
      return data.detail || data.message || data.error || data.title || fallback
    } catch {
      return fallback
    }
  }

  static async getById(lectureId: string): Promise<Lecture> {
    const res = await fetch(
      `${LecturesService.baseURL}${LECTURES_ENDPOINTS.lectureById(lectureId)}`,
      { credentials: "include", cache: "no-store" },
    )
    if (!res.ok) {
      throw new Error(
        await LecturesService.parseError(res, "Failed to fetch lecture"),
      )
    }
    return LectureSchema.parse(await res.json())
  }

  static async getQuizByLectureId(lectureId: string): Promise<LectureQuiz> {
    const res = await fetch(
      `${LecturesService.baseURL}${LECTURES_ENDPOINTS.lectureQuiz(lectureId)}`,
      { credentials: "include", cache: "no-store" },
    )
    if (!res.ok) {
      throw new Error(
        await LecturesService.parseError(res, "Failed to fetch lecture quiz"),
      )
    }
    return LectureQuizSchema.parse(await res.json())
  }

  static async trackLecture(
    lectureId: string,
    body: { registerVisit?: boolean; timeMs?: number },
    opts?: { keepalive?: boolean },
  ): Promise<void> {
    const res = await fetch(
      `${LecturesService.baseURL}${LECTURES_ENDPOINTS.trackLecture(lectureId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
        keepalive: opts?.keepalive === true,
      },
    )
    if (!res.ok) {
      throw new Error(
        await LecturesService.parseError(res, "Failed to track lecture"),
      )
    }
  }

  static trackLectureTimeBeacon(lectureId: string, timeMs: number): void {
    const url = `${LecturesService.baseURL}${LECTURES_ENDPOINTS.trackLecture(lectureId)}`
    const payload = JSON.stringify({
      timeMs: Math.floor(timeMs),
      page: typeof window !== "undefined" ? window.location.href : "",
      timestamp: new Date().toISOString(),
    })
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
      const ok = navigator.sendBeacon(
        url,
        new Blob([payload], { type: "application/json" }),
      )
      if (ok) return
    }
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: payload,
      keepalive: true,
    }).catch(() => {})
  }

  static async getMyLectureStats(lectureId: string): Promise<UserLectureStats> {
    const res = await fetch(
      `${LecturesService.baseURL}${LECTURES_ENDPOINTS.myLectureStats(lectureId)}`,
      { credentials: "include", cache: "no-store" },
    )
    if (!res.ok) {
      throw new Error(
        await LecturesService.parseError(res, "Failed to load lecture stats"),
      )
    }
    return UserLectureStatsSchema.parse(await res.json())
  }

  static async submitQuiz(
    lectureId: string,
    params: { answers: Record<string, string>; userId?: string },
  ): Promise<SubmitLectureQuizResponse> {
    const res = await fetch(
      `${LecturesService.baseURL}${LECTURES_ENDPOINTS.submitLectureQuiz(lectureId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          userId: params.userId || undefined,
          answers: params.answers,
        }),
      },
    )
    if (!res.ok) {
      throw new Error(
        await LecturesService.parseError(res, "Failed to submit quiz"),
      )
    }
    return SubmitLectureQuizResponseSchema.parse(await res.json())
  }
}
