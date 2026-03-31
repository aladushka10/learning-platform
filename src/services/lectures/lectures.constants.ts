export const LECTURES_BASE_URL = "/api"

export const LECTURES_ENDPOINTS = {
  lectureById: (lectureId: string) => `/lectures/${lectureId}`,
  lectureQuiz: (lectureId: string) => `/lectures/${lectureId}/quiz`,
  submitLectureQuiz: (lectureId: string) =>
    `/lectures/${lectureId}/quiz/submit`,
}

export const LECTURES_QUERY_KEYS = {
  lectureById: (lectureId: string) => ["lectures", lectureId] as const,
  lectureQuiz: (lectureId: string) => ["lectures", lectureId, "quiz"] as const,
}
