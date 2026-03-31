import { COURSES_BASE_URL, COURSES_ENDPOINTS } from "./courses.constants"
import {
  CourseLecturesSchema,
  CoursesSchema,
  CourseTasksSchema,
} from "./courses.contract"
import type { Course, CourseLecture, CourseTask } from "./courses.type"

type ErrorPayload = {
  detail?: string
  message?: string
  error?: string
  title?: string
}

export class CoursesService {
  private static baseURL = COURSES_BASE_URL

  private static async parseError(res: Response, fallback: string) {
    try {
      const data = (await res.json()) as ErrorPayload
      return data.detail || data.message || data.error || data.title || fallback
    } catch {
      return fallback
    }
  }

  static async getCourses(): Promise<Course[]> {
    const res = await fetch(
      `${CoursesService.baseURL}${COURSES_ENDPOINTS.courses()}`,
      { credentials: "include", cache: "no-store" },
    )
    if (!res.ok) {
      throw new Error(await CoursesService.parseError(res, "Не удалось загрузить курсы"))
    }
    return CoursesSchema.parse(await res.json())
  }

  static async getCourseTasks(courseId: string): Promise<CourseTask[]> {
    const res = await fetch(
      `${CoursesService.baseURL}${COURSES_ENDPOINTS.courseTasks(courseId)}`,
      { credentials: "include", cache: "no-store" },
    )
    if (!res.ok) {
      throw new Error(
        await CoursesService.parseError(res, "Не удалось загрузить задачи курса"),
      )
    }
    return CourseTasksSchema.parse(await res.json())
  }

  static async getCourseLectures(courseId: string): Promise<CourseLecture[]> {
    const res = await fetch(
      `${CoursesService.baseURL}${COURSES_ENDPOINTS.courseLectures(courseId)}`,
      { credentials: "include", cache: "no-store" },
    )
    if (!res.ok) {
      throw new Error(
        await CoursesService.parseError(res, "Не удалось загрузить лекции курса"),
      )
    }
    return CourseLecturesSchema.parse(await res.json())
  }
}

