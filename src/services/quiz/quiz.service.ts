const BASE_URL = "/api"
import { QuizSchema, QuizSubmitResultSchema } from "./quiz.contract"
import type { Quiz, QuizSubmitResult } from "./quiz.type"

export class QuizService {
  private static baseURL = BASE_URL

  static async getByLectureId(lectureId: string): Promise<Quiz> {
    const res = await fetch(
      `${QuizService.baseURL}/lectures/${lectureId}/quiz`,
      { credentials: "include" },
    )
    if (!res.ok) throw new Error("Не удалось загрузить тест")
    const data = await res.json()
    return QuizSchema.parse(data)
  }

  static async submit(
    lectureId: string,
    answers: Record<string, string>,
    userId?: string,
  ): Promise<QuizSubmitResult> {
    const res = await fetch(
      `${QuizService.baseURL}/lectures/${lectureId}/quiz/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answers, userId }),
      },
    )
    if (!res.ok) throw new Error("Ошибка отправки теста")
    const data = await res.json()
    return QuizSubmitResultSchema.parse(data)
  }
}
