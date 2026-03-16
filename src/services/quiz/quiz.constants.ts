export const QUIZ_BASE_URL = "/api"

export const QUIZ_ENDPOINTS = {
  byLectureId: (lectureId: string) => `/lectures/${lectureId}/quiz`,
  submit: (lectureId: string) => `/lectures/${lectureId}/quiz/submit`,
}

export const QUIZ_QUERY_KEYS = {
  lectureQuiz: (lectureId: string | null) => ["lecture-quiz", lectureId] as const,
}

