export const TASKS_BASE_URL = "/api"

export const TASKS_ENDPOINTS = {
  taskSolutions: (taskId: string) => `/tasks/${taskId}/solutions`,
  taskOpen: (taskId: string) => `/tasks/${taskId}/open`,
  taskStats: (taskId: string) => `/tasks/${taskId}/stats`,
  userSolutions: (userId: string) => `/users/${userId}/solutions`,
  solutionCheckResults: (solutionId: string) =>
    `/solutions/${solutionId}/check-results`,
}

export const TASKS_QUERY_KEYS = {
  taskStats: (taskId: string) => ["tasks", taskId, "stats"] as const,
  userSolutions: (userId: string) => ["users", userId, "solutions"] as const,
}
