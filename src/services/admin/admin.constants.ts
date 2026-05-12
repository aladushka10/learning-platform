export const ADMIN_BASE_URL = "/api"

export const ADMIN_ENDPOINTS = {
  users: () => "/users",
  setUserRole: (id: string) => `/admin/users/${id}/role`,
  teacherStudents: () => "/admin/teacher-students",
} as const

