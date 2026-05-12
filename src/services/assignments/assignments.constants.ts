export const ASSIGNMENTS_BASE_URL = "/api"

export const ASSIGNMENTS_ENDPOINTS = {
  adminStudents: () => "/admin/students",
  adminAssignments: () => "/admin/task-assignments",
  adminAssignmentById: (id: string) => `/admin/task-assignments/${id}`,
  teacherStudents: () => "/teacher/students",
  teacherAssignments: () => "/teacher/task-assignments",
  teacherAssignmentById: (id: string) => `/teacher/task-assignments/${id}`,
  userAssignments: (userId: string) => `/users/${userId}/task-assignments`,
}

export const ASSIGNMENTS_QUERY_KEYS = {
  adminStudents: () => ["admin-students"] as const,
  adminAssignments: (userId: string) =>
    ["admin-task-assignments", userId] as const,
  teacherStudents: () => ["teacher-students"] as const,
  teacherAssignments: (userId: string) =>
    ["teacher-task-assignments", userId] as const,
  userAssignments: (userId: string) => ["user-task-assignments", userId] as const,
}

