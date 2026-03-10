import { z } from "zod"
import { QuizSchema, QuizSubmitResultSchema } from "./quiz.contract"

export type Quiz = z.infer<typeof QuizSchema>
export type QuizSubmitResult = z.infer<typeof QuizSubmitResultSchema>

