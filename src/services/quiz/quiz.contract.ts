import { z } from "zod"

export const QuizOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  ord: z.number().nullable(),
})

export const QuizQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  ord: z.number().nullable(),
  options: z.array(QuizOptionSchema),
})

export const QuizSchema = z.object({
  id: z.string(),
  lectureId: z.string(),
  title: z.string(),
  createdAt: z.number().nullable(),
  questions: z.array(QuizQuestionSchema),
})

export const QuizSubmitResultSchema = z.object({
  ok: z.boolean(),
  score: z.number(),
  total: z.number(),
  results: z
    .array(z.object({ questionId: z.string(), correct: z.boolean() }))
    .optional()
    .default([]),
})

