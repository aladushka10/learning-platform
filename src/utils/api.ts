const API_BASE = "/api"

export async function createProgress(
  userId: string,
  taskId: string,
  status: string
) {
  const res = await fetch(`${API_BASE}/users/${userId}/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
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
  const res = await fetch(`${API_BASE}/users/${userId}/stats`, {
    credentials: "include",
  })
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
