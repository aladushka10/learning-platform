// API endpoints and utilities for task management

const API_BASE = "http://localhost:4000"

export interface TaskData {
  id: string
  courseId: string
  title: string
  description: string
  meta:
    | string
    | {
        type: string
        answer: string
        explanation: string
        topic?: string
        difficulty?: string
      }
  ord: number
}

export interface Solution {
  id: string
  user_id: string
  task_id: string
  code: string
  created_at: number
}

export interface CheckResult {
  id: string
  solution_id: string
  status: "passed" | "failed"
  time_ms: number
  passed_tests: number
  error_message: string | null
}

export interface ProgressRecord {
  id: string
  userId: string
  taskId: string
  status: "not_started" | "in_progress" | "completed"
  updatedAt: number
}

// Task APIs
export async function fetchTask(courseId: string, taskId: string) {
  const res = await fetch(`${API_BASE}/courses/${courseId}/tasks`)
  if (!res.ok) throw new Error("Failed to fetch tasks")
  const tasks = await res.json()
  return tasks.find((t: TaskData) => t.id === taskId)
}

export async function fetchTasks(courseId: string) {
  const res = await fetch(`${API_BASE}/courses/${courseId}/tasks`)
  if (!res.ok) throw new Error("Failed to fetch tasks")
  return res.json()
}

export async function fetchLectures(courseId: string) {
  const res = await fetch(`${API_BASE}/courses/${courseId}/lectures`)
  if (!res.ok) throw new Error("Failed to fetch lectures")
  return res.json()
}

export async function fetchLectureById(lectureId: string) {
  const res = await fetch(`${API_BASE}/lectures/${lectureId}`)
  if (!res.ok) throw new Error("Failed to fetch lecture")
  return res.json()
}

// Solution APIs
export async function createSolution(
  taskId: string,
  solution: Omit<Solution, "id">
) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/solutions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(solution),
  })
  if (!res.ok) throw new Error("Failed to create solution")
  return res.json()
}

export async function fetchUserSolutions(userId: string) {
  const res = await fetch(`${API_BASE}/users/${userId}/solutions`)
  if (!res.ok) throw new Error("Failed to fetch solutions")
  return res.json()
}

// Check Result APIs
export async function createCheckResult(
  solutionId: string,
  result: Omit<CheckResult, "id">
) {
  const res = await fetch(`${API_BASE}/solutions/${solutionId}/check-results`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result),
  })
  if (!res.ok) throw new Error("Failed to create check result")
  return res.json()
}

// Progress APIs
export async function createProgress(
  userId: string,
  taskId: string,
  status: string
) {
  const res = await fetch(`${API_BASE}/users/${userId}/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId, status, updatedAt: Date.now() }),
  })
  if (!res.ok) throw new Error("Failed to create progress")
  return res.json()
}

export async function updateProgress(
  userId: string,
  taskId: string,
  status: string
) {
  const res = await fetch(`${API_BASE}/users/${userId}/progress/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, updatedAt: Date.now() }),
  })
  if (!res.ok) throw new Error("Failed to update progress")
  return res.json()
}

export async function fetchUserProgress(userId: string) {
  const res = await fetch(`${API_BASE}/users/${userId}/stats`)
  if (!res.ok) throw new Error("Failed to fetch progress")
  return res.json()
}

// Validation helper
export function isAnswerCorrect(
  userAnswer: string,
  expectedAnswer: string
): boolean {
  // Normalize and compare
  const normalize = (str: string) => {
    let normalized = str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "") // Remove ALL spaces (including around operators)
      .replace(/\^/g, "**") // Convert ^ to ** for exponentiation

    return normalized
  }

  const normalized = normalize(userAnswer)
  const expectedNormalized = normalize(expectedAnswer)

  // Try exact match first
  if (normalized === expectedNormalized) return true

  // Try partial matches (in case one is part of the other)
  if (
    normalized.includes(expectedNormalized) ||
    expectedNormalized.includes(normalized)
  ) {
    return true
  }

  // Try evaluating both as math expressions if they contain numbers
  try {
    if (
      /[\d+\-*/().**]/.test(normalized) &&
      /[\d+\-*/().**]/.test(expectedNormalized)
    ) {
      // Basic evaluation - be careful with this
      const eval1 = Function(`"use strict"; return (${normalized})`)()
      const eval2 = Function(`"use strict"; return (${expectedNormalized})`)()

      // Compare with small epsilon for floating point errors
      const epsilon = 0.0001
      return Math.abs(eval1 - eval2) < epsilon
    }
  } catch (e) {
    // If evaluation fails, just do string comparison
  }

  return false
}
