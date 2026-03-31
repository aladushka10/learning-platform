export const COURSES_BASE_URL = "/api"

export const COURSES_ENDPOINTS = {
  courses: () => "/courses",
  courseTasks: (courseId: string) => `/courses/${courseId}/tasks`,
  courseLectures: (courseId: string) => `/courses/${courseId}/lectures`,
}

export const COURSES_QUERY_KEYS = {
  courses: () => ["courses"] as const,
  courseTasks: (courseId: string) => ["courses", courseId, "tasks"] as const,
  courseLectures: (courseId: string) =>
    ["courses", courseId, "lectures"] as const,
}

