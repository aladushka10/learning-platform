import type { z } from "zod"
import type {
  CourseLectureSchema,
  CourseSchema,
  CourseTaskSchema,
} from "./courses.contract"

export type Course = z.infer<typeof CourseSchema>
export type CourseTask = z.infer<typeof CourseTaskSchema>
export type CourseLecture = z.infer<typeof CourseLectureSchema>

