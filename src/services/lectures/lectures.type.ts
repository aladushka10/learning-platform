import type { z } from "zod"
import type {
  LectureQuizSchema,
  LectureSchema,
  SubmitLectureQuizResponseSchema,
} from "./lectures.contract"

export type Lecture = z.infer<typeof LectureSchema>
export type LectureQuiz = z.infer<typeof LectureQuizSchema>
export type SubmitLectureQuizResponse = z.infer<
  typeof SubmitLectureQuizResponseSchema
>
