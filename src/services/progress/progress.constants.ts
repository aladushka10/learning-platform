export const PROGRESS_BASE_URL = "/api"

export const PROGRESS_ENDPOINTS = {
  userStats: (userId: string) => `/users/${userId}/stats`,
}

export const PROGRESS_QUERY_KEYS = {
  userStats: (userId: string | null) => ["user-progress", userId] as const,
}

