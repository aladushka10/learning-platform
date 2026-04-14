import type { z } from "zod"
import type {
  LectureQuizSchema,
  LectureSchema,
  SubmitLectureQuizResponseSchema,
  UserLectureStatsSchema,
} from "./lectures.contract"

export type Lecture = z.infer<typeof LectureSchema>
export type LectureQuiz = z.infer<typeof LectureQuizSchema>
export type SubmitLectureQuizResponse = z.infer<
  typeof SubmitLectureQuizResponseSchema
>
export type UserLectureStats = z.infer<typeof UserLectureStatsSchema>
