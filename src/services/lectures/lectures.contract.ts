import { z } from "zod"

export const LectureSchema = z.object({
  id: z.string(),
  title: z.string().optional().default(""),
  content: z.string().optional().default(""),
})

export const LectureQuizSchema = z.object({
  id: z.string(),
  lectureId: z.string(),
  title: z.string(),
  createdAt: z.number().nullable().optional().default(null),
  questions: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      ord: z.number().nullable().optional().default(null),
      options: z.array(
        z.object({
          id: z.string(),
          text: z.string(),
          ord: z.number().nullable().optional().default(null),
        }),
      ),
    }),
  ),
})

export const SubmitLectureQuizResponseSchema = z.object({
  ok: z.boolean().optional(),
  score: z.number(),
  total: z.number(),
})
