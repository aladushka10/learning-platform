const express = require("express")
const cors = require("cors")
const { v4: uuidv4 } = require("uuid")
const db = require("./db")
const jwt = require("jsonwebtoken")

const swaggerUi = require("swagger-ui-express")
const swaggerSpec = require("./swagger")

function getRunJsInVmFresh() {
  const p = require.resolve("./localRunner")
  if (require.cache?.[p]) delete require.cache[p]
  const mod = require("./localRunner")
  return mod?.runJsInVm
}

const app = express()
const PORT = process.env.PORT || 4000

const AUTH_COOKIE = "token"
const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me"
const JWT_MAX_AGE_SEC = 7 * 24 * 60 * 60 // 7 days

function parseCookies(cookieHeader = "") {
  const out = {}
  cookieHeader
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const idx = pair.indexOf("=")
      if (idx === -1) return
      const k = pair.slice(0, idx).trim()
      const v = pair.slice(idx + 1).trim()
      out[k] = decodeURIComponent(v)
    })
  return out
}

function getAuthUserId(req) {
  const cookies = parseCookies(req.headers.cookie || "")
  const token = cookies[AUTH_COOKIE]
  if (!token) return null
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const sub = payload?.sub
    return typeof sub === "string" ? sub : null
  } catch {
    return null
  }
}

function isAdminUserId(userId) {
  if (!userId) return false
  const u = db.getUserById(String(userId))
  return Boolean(u?.isAdmin)
}

function adminLearningForbidden(res) {
  return res.status(403).json({ error: "admin_learning_forbidden" })
}

function setAuthCookie(res, userId) {
  const token = jwt.sign({ sub: userId }, JWT_SECRET, {
    expiresIn: JWT_MAX_AGE_SEC,
  })
  res.setHeader(
    "Set-Cookie",
    `${AUTH_COOKIE}=${encodeURIComponent(
      token,
    )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${JWT_MAX_AGE_SEC}`,
  )
}

function clearAuthCookie(res) {
  res.setHeader(
    "Set-Cookie",
    `${AUTH_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`,
  )
}

function trackTaskOpen(userId, taskId) {
  try {
    if (!userId || !taskId) return
    db.incrementTaskOpen(userId, taskId)
  } catch (e) {
    console.error("trackTaskOpen failed", e)
  }
}

function trackTaskAttempt(userId, taskId, success) {
  try {
    if (!userId || !taskId) return
    db.incrementTaskAttempt(userId, taskId, !!success, Date.now())
  } catch (e) {
    console.error("trackTaskAttempt failed", e)
  }
}

function updateUserProgress(userId, taskId) {
  db.upsertProgress({
    userId,
    taskId,
    status: "completed",
    updatedAt: Date.now(),
  })
}

function getStreak(userId) {
  const dates = Array.from(
    new Set([
      ...db.getCorrectSolutionDates(userId),
      ...(db.getCompletedProgressDates
        ? db.getCompletedProgressDates(userId)
        : []),
    ]),
  )
    .sort()
    .reverse()
  if (dates.length === 0) return 0

  // Локальная дата YYYY-MM-DD
  const toLocalDay = (dt = new Date()) => {
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, "0")
    const d = String(dt.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }
  const addDaysLocal = (dayStr, deltaDays) => {
    const [y, m, d] = dayStr.split("-").map((n) => parseInt(n, 10))
    const base = new Date(y, m - 1, d, 12, 0, 0, 0)
    base.setDate(base.getDate() + deltaDays)
    return toLocalDay(base)
  }

  const today = toLocalDay(new Date())
  const yesterday = addDaysLocal(today, -1)

  const lastDay = dates[0]

  // «Заглушка» / понятное поведение:
  // - если последняя активность сегодня или вчера — показываем текущую серию (она "живёт" до конца дня)
  // - если последняя активность раньше — серия 0
  if (lastDay !== today && lastDay !== yesterday) return 0

  // считаем длину серии, заканчивающейся на lastDay
  let streak = 0
  let expected = lastDay
  for (const d of dates) {
    if (d !== expected) break
    streak++
    expected = addDaysLocal(expected, -1)
  }
  return streak
}

function checkAchievements(userId) {
  const completedTaskIds = db.getCompletedTaskIdsByUser(userId)
  const completedCount = completedTaskIds.length
  const completedSet = new Set(completedTaskIds)
  const streak = getStreak(userId)
  const definitions = db.getAchievementsDefinitions()

  // Миграция: раньше "three_tasks" выдавалось за 3 задачи.
  // Теперь условие — 4 задачи, поэтому если у пользователя < 4,
  // сбрасываем старую отметку получения, чтобы UI был консистентным.
  if (completedCount < 4) {
    db.revokeAchievement(userId, "three_tasks")
  }

  const newlyUnlocked = []

  for (const def of definitions) {
    if (def.id === "three_tasks" && completedCount >= 4) {
      const unlocked = db.unlockAchievement(userId, def.id)
      if (unlocked) newlyUnlocked.push(unlocked)
      continue
    }

    if (def.id === "streak_5" && streak >= 5) {
      const unlocked = db.unlockAchievement(userId, def.id)
      if (unlocked) newlyUnlocked.push(unlocked)
      continue
    }

    if (def.id === "all_tasks_course") {
      const courses = db.getCourses()
      const hasCompletedAnyCourse = courses.some((c) => {
        const tasks = db.getTasks(c.id)
        if (!tasks || tasks.length === 0) return false
        return tasks.every((t) => completedSet.has(t.id))
      })
      if (hasCompletedAnyCourse) {
        const unlocked = db.unlockAchievement(userId, def.id)
        if (unlocked) newlyUnlocked.push(unlocked)
      }
    }
  }

  return newlyUnlocked
}

function buildUserProgressStats(userId) {
  const courses = db.getCourses()
  const categoryByCourseId = {}
  courses.forEach((c) => {
    const cat = String(c.category || "").toLowerCase()
    const isMath =
      cat.includes("math") ||
      cat.includes("матем") ||
      cat.includes("мат") ||
      cat.includes("алгеб") ||
      cat.includes("геом")
    categoryByCourseId[c.id] = isMath ? "math" : "cs"
  })
  const allTasks = courses.flatMap((c) => db.getTasks(c.id))
  const progressByTask = {}
  db.getProgressByUser(userId).forEach((p) => {
    progressByTask[p.taskId] = p
  })

  const taskDetails = allTasks.map((task) => {
    const prog = progressByTask[task.id]
    let status = prog?.status || "not_started"
    const solutions = db
      .getSolutionsByTask(task.id)
      .filter((s) => s.user_id === userId)

    let latestAttemptAt = null
    let latestCorrectAt = null
    if (solutions.length > 0) {
      for (const sol of solutions) {
        const createdAt =
          typeof sol?.created_at === "number" ? sol.created_at : null
        if (createdAt != null) {
          if (latestAttemptAt == null || createdAt > latestAttemptAt) {
            latestAttemptAt = createdAt
          }
        }

        const results = db.getCheckResultsBySolution(sol.id)
        const hasCorrect = results.some((r) => r.status === "correct")
        if (hasCorrect && createdAt != null) {
          if (latestCorrectAt == null || createdAt > latestCorrectAt) {
            latestCorrectAt = createdAt
          }
        }
      }

      if (latestCorrectAt != null) status = "completed"
      else if (status === "not_started") status = "in_progress"
    }

    const updatedAt =
      prog?.updatedAt ?? latestCorrectAt ?? latestAttemptAt ?? null
    return {
      taskId: task.id,
      taskTitle: task.title || "Unknown",
      category: categoryByCourseId[task.courseId] || "cs",
      status,
      updatedAt,
    }
  })

  const completed = taskDetails.filter((t) => t.status === "completed").length
  const inProgress = taskDetails.filter(
    (t) => t.status === "in_progress",
  ).length
  const notStarted = taskDetails.filter(
    (t) => t.status === "not_started",
  ).length
  const total = allTasks.length

  const streakDays = getStreak(userId)
  const achievements = db.getUserAchievements(userId)

  return {
    totalTasks: total,
    completedTasks: completed,
    inProgressTasks: inProgress,
    notStartedTasks: notStarted,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    tasks: taskDetails,
    streakDays,
    achievements,
  }
}

app.use(cors())
app.use(express.json())

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get("/openapi.json", (req, res) => {
  res.json(swaggerSpec)
})

// PUT / DELETE for courses
app.put("/courses/:id", (req, res) => {
  const existing = db.getCourseById(req.params.id)
  if (!existing) return res.status(404).json({ error: "not_found" })
  db.updateCourse(req.params.id, req.body)
  res.json({ ok: true })
})

app.delete("/courses/:id", (req, res) => {
  db.deleteCourse(req.params.id)
  res.status(204).end()
})

// Tasks CRUD
app.get("/tasks/:id", (req, res) => {
  const t = db.getTaskById(req.params.id)
  if (!t) return res.status(404).json({ error: "not_found" })
  res.json(t)
})

app.put("/tasks/:id", (req, res) => {
  const existing = db.getTaskById(req.params.id)
  if (!existing) return res.status(404).json({ error: "not_found" })
  db.updateTask(req.params.id, req.body)
  res.json({ ok: true })
})

app.delete("/tasks/:id", (req, res) => {
  db.deleteTask(req.params.id)
  res.status(204).end()
})

// Task stats (opens/attempts/successes) for recommendations
app.get("/tasks/:id/stats", (req, res) => {
  const taskId = req.params.id
  const authUserId = getAuthUserId(req)
  const userId = authUserId || req.query?.userId
  if (!userId) return res.status(401).json({ error: "unauthorized" })

  const s = db.getTaskStatsForUserTask(String(userId), taskId)
  res.json({
    userId: String(userId),
    taskId,
    opens: s?.opens ?? 0,
    attempts: s?.attempts ?? 0,
    successes: s?.successes ?? 0,
    lastAttemptAt: s?.lastAttemptAt ?? null,
  })
})

// Lectures CRUD
app.get("/lectures/:id", (req, res) => {
  const l = db.getLectureById(req.params.id)
  if (!l) return res.status(404).json({ error: "not_found" })
  res.json(l)
})

// Lecture quiz
app.get("/lectures/:id/quiz", (req, res) => {
  const lectureId = req.params.id
  const quiz = db.getLectureQuizByLectureId(lectureId)
  if (!quiz) return res.status(404).json({ error: "not_found" })

  // Do not reveal correct answers to the client
  res.json({
    id: quiz.id,
    lectureId: quiz.lectureId,
    title: quiz.title,
    createdAt: quiz.createdAt,
    questions: (quiz.questions || []).map((q) => ({
      id: q.id,
      text: q.text,
      ord: q.ord,
      options: (q.options || []).map((o) => ({
        id: o.id,
        text: o.text,
        ord: o.ord,
      })),
    })),
  })
})

app.post("/lectures/:id/quiz/submit", (req, res) => {
  const lectureId = req.params.id
  const quiz = db.getLectureQuizByLectureId(lectureId)
  if (!quiz) return res.status(404).json({ error: "not_found" })

  const authUserId = getAuthUserId(req)
  const bodyUserId = req.body?.userId
  const userId = authUserId || bodyUserId

  if (userId && isAdminUserId(userId)) {
    return adminLearningForbidden(res)
  }

  const answers =
    req.body?.answers && typeof req.body.answers === "object"
      ? req.body.answers
      : {}
  const questions = Array.isArray(quiz.questions) ? quiz.questions : []
  const total = questions.length

  const results = []
  let score = 0
  questions.forEach((q) => {
    const selectedOptionId = answers[q.id]
    const opts = Array.isArray(q.options) ? q.options : []
    const selected = opts.find((o) => o.id === selectedOptionId)
    const correct = !!(selected && selected.isCorrect === true)
    if (correct) score++
    results.push({ questionId: q.id, correct })
  })

  if (userId) {
    try {
      db.createLectureQuizAttempt({
        id: uuidv4(),
        userId: String(userId),
        lectureId,
        quizId: quiz.id,
        score,
        total,
        createdAt: Date.now(),
      })
    } catch (e) {
      // best-effort
    }
  }

  res.json({ ok: true, score, total, results })
})

app.put("/lectures/:id", (req, res) => {
  const existing = db.getLectureById(req.params.id)
  if (!existing) return res.status(404).json({ error: "not_found" })
  db.updateLecture(req.params.id, req.body)
  res.json({ ok: true })
})

app.delete("/lectures/:id", (req, res) => {
  db.deleteLecture(req.params.id)
  res.status(204).end()
})

// Modules
app.get("/courses/:id/modules", (req, res) => {
  res.json(db.getModules(req.params.id))
})

app.post("/courses/:id/modules", (req, res) => {
  if (!req.body?.title) return res.status(400).json({ error: "invalid" })
  const m = {
    id: uuidv4(),
    courseId: req.params.id,
    title: req.body.title,
    description: req.body.description || "",
    ord: req.body.ord || 0,
  }
  db.createModule(m)
  res.status(201).json(m)
})

app.get("/modules/:id", (req, res) => {
  const m = db.getModuleById(req.params.id)
  if (!m) return res.status(404).json({ error: "not_found" })
  res.json(m)
})

app.put("/modules/:id", (req, res) => {
  const existing = db.getModuleById(req.params.id)
  if (!existing) return res.status(404).json({ error: "not_found" })
  db.updateModule(req.params.id, req.body)
  res.json({ ok: true })
})

app.delete("/modules/:id", (req, res) => {
  db.deleteModule(req.params.id)
  res.status(204).end()
})

// Users CRUD
app.get("/users", (req, res) => {
  res.json(db.getUsers())
})

// Сводка прогресса по всем пользователям (только администратор).
// Объявлено до /users/:id, иначе Express примет сегмент как id пользователя.
// Дублируем путь с префиксом /api: часть прокси/клиентов шлёт URL без rewrite.
function handleAdminUsersProgressSummary(req, res) {
  const authId = getAuthUserId(req)
  if (!authId) return res.status(401).json({ error: "unauthorized" })
  const authUser = db.getUserById(authId)
  if (!authUser?.isAdmin) return res.status(403).json({ error: "forbidden" })

  const users = db.getUsers().filter((u) => !u.isAdmin)
  const rows = users.map((u) => {
    const stats = buildUserProgressStats(u.id)
    const achievementsUnlocked = (stats.achievements || []).filter(
      (a) => a.unlockedAt != null,
    ).length
    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      isAdmin: Boolean(u.isAdmin),
      totalTasks: stats.totalTasks,
      completedTasks: stats.completedTasks,
      inProgressTasks: stats.inProgressTasks,
      notStartedTasks: stats.notStartedTasks,
      completionRate: stats.completionRate,
      streakDays: stats.streakDays,
      achievementsUnlocked,
    }
  })

  res.json({ users: rows })
}

app.get("/users/all/progress-summary", handleAdminUsersProgressSummary)
app.get("/api/users/all/progress-summary", handleAdminUsersProgressSummary)

app.get("/users/:id", (req, res) => {
  const u = db.getUserById(req.params.id)
  if (!u) return res.status(404).json({ error: "not_found" })
  res.json(u)
})

app.post("/users", (req, res) => {
  if (!req.body?.email || !req.body?.password)
    return res.status(400).json({ error: "invalid" })
  const exists = db.getUserByEmail(req.body.email)
  if (exists) return res.status(409).json({ error: "user_exists" })
  const u = {
    id: uuidv4(),
    email: req.body.email,
    passwordHash: req.body.password,
    firstName: req.body.firstName || "",
    lastName: req.body.lastName || "",
    createdAt: Date.now(),
  }
  db.createUser(u)
  res.status(201).json(u)
})

app.put("/users/:id", (req, res) => {
  const existing = db.getUserById(req.params.id)
  if (!existing) return res.status(404).json({ error: "not_found" })
  db.updateUser(req.params.id, req.body)
  res.json({ ok: true })
})

app.put("/users/:id/avatar", (req, res) => {
  const authUserId = getAuthUserId(req)
  const userId = req.params.id
  if (!authUserId) return res.status(401).json({ error: "unauthorized" })
  if (authUserId !== userId) return res.status(403).json({ error: "forbidden" })

  const raw = req.body?.avatarId
  const avatarId = raw == null ? null : String(raw)
  const allowed = new Set([
    "image1",
    "image2",
    "image3",
    "image4",
    "image5",
    "image6",
    "image7",
    "image8",
  ])
  if (avatarId !== null && !allowed.has(avatarId)) {
    return res.status(400).json({ error: "invalid_avatar" })
  }

  db.updateUserAvatar(userId, avatarId)
  res.json({ ok: true, avatarId })
})

app.delete("/users/:id", (req, res) => {
  db.deleteUser(req.params.id)
  res.status(204).end()
})

// Categories and task-categories
app.get("/categories", (req, res) => res.json(db.getCategories()))
app.get("/categories/:id", (req, res) => {
  const c = db.getCategoryById(req.params.id)
  if (!c) return res.status(404).json({ error: "not_found" })
  res.json(c)
})
app.post("/categories", (req, res) => {
  if (!req.body?.name) return res.status(400).json({ error: "invalid" })
  const c = { id: uuidv4(), name: req.body.name }
  db.createCategory(c)
  res.status(201).json(c)
})
app.put("/categories/:id", (req, res) => {
  db.updateCategory(req.params.id, req.body)
  res.json({ ok: true })
})
app.delete("/categories/:id", (req, res) => {
  db.deleteCategory(req.params.id)
  res.status(204).end()
})

app.get("/tasks/:id/categories", (req, res) =>
  res.json(db.getTaskCategoriesByTask(req.params.id)),
)
app.post("/task-categories", (req, res) => {
  if (!req.body?.task_id || !req.body?.category_id)
    return res.status(400).json({ error: "invalid" })
  const tc = {
    id: uuidv4(),
    task_id: req.body.task_id,
    category_id: req.body.category_id,
  }
  db.createTaskCategory(tc)
  res.status(201).json(tc)
})
app.delete("/task-categories/:id", (req, res) => {
  db.deleteTaskCategory(req.params.id)
  res.status(204).end()
})

// Test cases
app.get("/tasks/:id/testcases", (req, res) =>
  res.json(db.getTestCases(req.params.id)),
)
app.post("/tasks/:id/testcases", (req, res) => {
  if (!req.body) return res.status(400).json({ error: "invalid" })
  const t = {
    id: uuidv4(),
    task_id: req.params.id,
    input: req.body.input || "",
    expected_output: req.body.expected_output || "",
  }
  db.createTestCase(t)
  res.status(201).json(t)
})
app.get("/testcases/:id", (req, res) => {
  const t = db.getTestCaseById(req.params.id)
  if (!t) return res.status(404).json({ error: "not_found" })
  res.json(t)
})
app.put("/testcases/:id", (req, res) => {
  db.updateTestCase(req.params.id, req.body)
  res.json({ ok: true })
})
app.delete("/testcases/:id", (req, res) => {
  db.deleteTestCase(req.params.id)
  res.status(204).end()
})

// Solutions and check results
app.get("/tasks/:id/solutions", (req, res) =>
  res.json(db.getSolutionsByTask(req.params.id)),
)
const normalizeAnswer = require("./utils/normalizeAnswer")

// app.post("/tasks/:id/solutions", (req, res) => {
//   try {
//     const { userId, code } = req.body
//     const taskId = req.params.id

//     if (!userId || !code) {
//       return res.status(400).json({ error: "invalid_payload" })
//     }

//     const task = db.getTaskById(taskId)
//     if (!task) return res.status(404).json({ error: "not_found" })

//     const meta = JSON.parse(task.meta || "{}")

//     const solutionId = uuidv4()
//     db.createSolution({
//       id: solutionId,
//       user_id: userId,
//       task_id: taskId,
//       code,
//       created_at: Date.now(),
//     })

//     const isCorrect = normalizeAnswer(code) === normalizeAnswer(meta.answer)

//     db.createCheckResult({
//       id: uuidv4(),
//       solution_id: solutionId,
//       status: isCorrect ? "correct" : "wrong",
//       time_ms: 0,
//       passed_tests: isCorrect ? 1 : 0,
//       error_message: isCorrect ? null : "Неверный ответ",
//     })

//     db.createProgress({
//       id: uuidv4(),
//       userId,
//       taskId,
//       status: isCorrect ? "completed" : "in_progress",
//       updatedAt: Date.now(),
//     })

//     res.json({ ok: true, correct: isCorrect })
//   } catch (e) {
//     console.error(e)
//     res.status(500).json({ error: "internal_error" })
//   }
// })
app.post("/tasks/:id/solutions", (req, res) => {
  console.log("POST /tasks/:id/solutions triggered")
  try {
    const taskId = req.params.id
    const { userId: bodyUserId, code } = req.body
    const authUserId = getAuthUserId(req)
    const userId = authUserId || bodyUserId

    if (authUserId && isAdminUserId(authUserId)) {
      return adminLearningForbidden(res)
    }
    if (userId && isAdminUserId(userId)) {
      return adminLearningForbidden(res)
    }

    const task = db.getTaskById(taskId)
    if (!task) {
      return res.status(404).json({ error: "Задача не найдена" })
    }

    const meta = JSON.parse(task.meta || "{}")

    // 1️⃣ создаём solution
    const solutionId = uuidv4()
    const solutionObj = {
      id: solutionId,
      user_id: userId,
      task_id: taskId,
      code,
      created_at: Date.now(),
    }
    db.createSolution(solutionObj)

    // 2️⃣ проверка
    const userAnswer = normalizeAnswer(code)
    const correctAnswer = normalizeAnswer(meta.answer)
    const isCorrect = userAnswer === correctAnswer

    // 3️⃣ сохраняем результат проверки
    const checkResultObj = {
      id: uuidv4(),
      solution_id: solutionId,
      status: isCorrect ? "correct" : "wrong",
      time_ms: 0,
      passed_tests: isCorrect ? 1 : 0,
      error_message: isCorrect ? null : "Неверный ответ",
    }
    db.createCheckResult(checkResultObj)

    // 4️⃣ прогресс
    // db.createProgress({
    //   id: uuidv4(),
    //   userId,
    //   taskId,
    //   status: isCorrect ? "completed" : "failed",
    //   updatedAt: Date.now(),
    // })
    let newAchievements = []
    if (isCorrect) {
      updateUserProgress(userId, taskId)
      newAchievements = checkAchievements(userId)
    }

    if (userId) {
      trackTaskAttempt(userId, taskId, isCorrect)
    }

    res.json({
      ok: true,
      correct: isCorrect,
      solution: solutionObj,
      checkResult: checkResultObj,

      newAchievements,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Ошибка проверки решения" })
  }
})

app.get("/solutions/:id", (req, res) => {
  const s = db.getSolutionById(req.params.id)
  if (!s) return res.status(404).json({ error: "not_found" })
  res.json(s)
})
app.put("/solutions/:id", (req, res) => {
  db.updateSolution(req.params.id, req.body)
  res.json({ ok: true })
})
app.delete("/solutions/:id", (req, res) => {
  db.deleteSolution(req.params.id)
  res.status(204).end()
})

app.get("/solutions/:id/check-results", (req, res) =>
  res.json(db.getCheckResultsBySolution(req.params.id)),
)
app.post("/solutions/:id/check-results", (req, res) => {
  if (!req.body) return res.status(400).json({ error: "invalid" })
  const c = {
    id: uuidv4(),
    solution_id: req.params.id,
    status: req.body.status || "unknown",
    time_ms: req.body.time_ms || 0,
    passed_tests: req.body.passed_tests || 0,
    error_message: req.body.error_message || "",
  }
  db.createCheckResult(c)
  res.status(201).json(c)
})
app.get("/check-results/:id", (req, res) => {
  const c = db.getCheckResultById(req.params.id)
  if (!c) return res.status(404).json({ error: "not_found" })
  res.json(c)
})
app.put("/check-results/:id", (req, res) => {
  db.updateCheckResult(req.params.id, req.body)
  res.json({ ok: true })
})
app.delete("/check-results/:id", (req, res) => {
  db.deleteCheckResult(req.params.id)
  res.status(204).end()
})

// Progress
app.get("/users/:id/progress", (req, res) =>
  res.json(db.getProgressByUser(req.params.id)),
)
app.post("/users/:id/progress", (req, res) => {
  if (!req.body?.taskId) return res.status(400).json({ error: "invalid" })
  const userId = req.params.id
  const authId = getAuthUserId(req)
  if (!authId || authId !== userId) {
    return res.status(403).json({ error: "forbidden" })
  }
  if (isAdminUserId(userId)) {
    return adminLearningForbidden(res)
  }
  const status = req.body.status || "in_progress"
  const updatedAt = Date.now()
  db.upsertProgress({
    id: uuidv4(),
    userId,
    taskId: req.body.taskId,
    status,
    updatedAt,
  })
  const record = db.getProgressByUserAndTask(userId, req.body.taskId)
  res.status(201).json(record)
})

app.post("/tasks/:id/open", (req, res) => {
  const taskId = req.params.id
  const authUserId = getAuthUserId(req)
  const bodyUserId = req.body?.userId
  const userId = authUserId || bodyUserId

  if (authUserId && isAdminUserId(authUserId)) {
    return adminLearningForbidden(res)
  }
  if (userId && isAdminUserId(userId)) {
    return adminLearningForbidden(res)
  }

  if (userId) {
    trackTaskOpen(userId, taskId)
  }

  res.json({ ok: true })
})
app.get("/progress/:id", (req, res) => {
  const p = db.getProgressById(req.params.id)
  if (!p) return res.status(404).json({ error: "not_found" })
  res.json(p)
})
app.put("/progress/:id", (req, res) => {
  db.updateProgress(req.params.id, req.body)
  res.json({ ok: true })
})
app.delete("/progress/:id", (req, res) => {
  db.deleteProgress(req.params.id)
  res.status(204).end()
})

app.get("/", (req, res) => {
  res.send("Learning Platform API is running")
})

// Routes
app.get("/courses", (req, res) => {
  res.json(db.getCourses())
})

app.get("/courses/:id", (req, res) => {
  const course = db.getCourseById(req.params.id)
  if (!course) {
    return res.status(404).json({ error: "not_found" })
  }
  res.json(course)
})

app.post("/courses", (req, res) => {
  if (!req.body?.title) {
    return res.status(400).json({ error: "invalid" })
  }

  const course = {
    id: uuidv4(),
    title: req.body.title,
    description: req.body.description || "",
    category: req.body.category || "",
    createdAt: Date.now(),
  }

  db.createCourse(course)
  res.status(201).json(course)
})

app.get("/courses/:id/tasks", (req, res) => {
  const tasks = db.getTasks(req.params.id)
  res.json(tasks)
})

app.post("/courses/:id/tasks", (req, res) => {
  if (!req.body?.title) {
    return res.status(400).json({ error: "invalid" })
  }

  const task = {
    id: uuidv4(),
    courseId: req.params.id,
    title: req.body.title,
    description: req.body.description || "",
    meta: req.body.meta || "",
    ord: req.body.ord || 0,
  }

  db.createTask(task)
  res.status(201).json(task)
})

app.get("/courses/:id/lectures", (req, res) => {
  const lectures = db.getLectures(req.params.id)
  res.json(lectures)
})

app.post("/courses/:id/lectures", (req, res) => {
  if (!req.body?.title) {
    return res.status(400).json({ error: "invalid" })
  }

  const lecture = {
    id: uuidv4(),
    courseId: req.params.id,
    title: req.body.title,
    content: req.body.content || "",
    ord: req.body.ord || 0,
  }

  db.createLecture(lecture)
  res.status(201).json(lecture)
})

app.post("/auth/sign-in", (req, res) => {
  const user = db.getUserByEmail(req.body.email)
  if (!user || user.passwordHash !== req.body.password) {
    return res.status(401).json({ error: "invalid_credentials" })
  }

  setAuthCookie(res, user.id)
  res.json({
    userDetails: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarId: user.avatarId ?? null,
      isAdmin: Boolean(user.isAdmin),
    },
  })
})

app.post("/auth/sign-out", (req, res) => {
  clearAuthCookie(res)
  res.json({ ok: true })
})

app.get("/auth/me", (req, res) => {
  const userId = getAuthUserId(req)
  if (!userId) return res.status(401).json({ error: "unauthorized" })
  const user = db.getUserById(userId)
  if (!user) return res.status(401).json({ error: "unauthorized" })
  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarId: user.avatarId ?? null,
    isAdmin: Boolean(user.isAdmin),
    createdAt: user.createdAt,
  })
})

app.get("/auth/user", (req, res) => {
  // Backward compatible: if JWT cookie exists, return auth user.
  const authUserId = getAuthUserId(req)
  if (authUserId) {
    const u = db.getUserById(authUserId)
    if (!u) return res.status(401).json({ error: "unauthorized" })
    return res.json({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      avatarId: u.avatarId ?? null,
      isAdmin: Boolean(u.isAdmin),
      createdAt: u.createdAt,
    })
  }

  const email = req.headers["x-user-email"]
  if (!email) {
    const username = req.query.username || "unknown"
    const user = db.getUserByEmail(username)
    if (!user) {
      return res.status(401).json({ error: "unauthorized" })
    }
    return res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarId: user.avatarId ?? null,
      isAdmin: Boolean(user.isAdmin),
      createdAt: user.createdAt,
    })
  }
  const user = db.getUserByEmail(email)
  if (!user) {
    return res.status(401).json({ error: "unauthorized" })
  }
  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarId: user.avatarId ?? null,
    isAdmin: Boolean(user.isAdmin),
    createdAt: user.createdAt,
  })
})

app.post("/auth/sign-up", (req, res) => {
  const { email, password, firstName, lastName } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "missing_fields" })
  }

  const existing = db.getUserByEmail(email)
  if (existing) {
    return res.status(409).json({ error: "user_exists" })
  }

  const user = {
    id: uuidv4(),
    email,
    passwordHash: password,
    firstName: firstName || "",
    lastName: lastName || "",
    isAdmin: 0,
    createdAt: Date.now(),
  }

  db.createUser(user)

  setAuthCookie(res, user.id)
  res.status(201).json({
    userDetails: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarId: user.avatarId ?? null,
      isAdmin: false,
    },
  })
})

// ===== СТАТИСТИКА И ПРОГРЕСС =====

// Получить статистику по прогрессу пользователя (по всем курсам и задачам)
app.get("/users/:userId/stats", (req, res) => {
  const authId = getAuthUserId(req)
  if (!authId) return res.status(401).json({ error: "unauthorized" })
  const authUser = db.getUserById(authId)
  if (!authUser) return res.status(401).json({ error: "unauthorized" })

  const { userId } = req.params
  if (userId !== authId && !authUser.isAdmin) {
    return res.status(403).json({ error: "forbidden" })
  }

  checkAchievements(userId)
  res.json(buildUserProgressStats(userId))
})

// Получить статистику по курсу для пользователя
app.get("/courses/:courseId/stats/:userId", (req, res) => {
  const { courseId, userId } = req.params
  const tasks = db.getTasks(courseId)
  const userProgressList = db.getProgressByUser(userId)
  const progressByTask = {}
  userProgressList.forEach((p) => {
    progressByTask[p.taskId] = p
  })

  const statsPerTask = tasks.map((task) => {
    const progress = progressByTask[task.id]
    const solutions = db
      .getSolutionsByTask(task.id)
      .filter((s) => s.user_id === userId)
    const attempts = solutions.length

    let checkResults = []
    if (solutions.length > 0) {
      checkResults = solutions
        .map((sol) => db.getCheckResultsBySolution(sol.id))
        .flat()
    }
    const hasCorrect = checkResults.some((r) => r.status === "correct")
    let status = progress?.status || "not_started"
    if (hasCorrect) status = "completed"
    else if (attempts > 0 && status === "not_started") status = "in_progress"

    return {
      taskId: task.id,
      taskTitle: task.title,
      status,
      attempts,
      lastAttempt: solutions.length > 0 ? solutions[0].created_at : null,
      checkStatus: checkResults.length > 0 ? checkResults[0].status : null,
      passedTests: checkResults.length > 0 ? checkResults[0].passed_tests : 0,
    }
  })

  const completed = statsPerTask.filter((s) => s.status === "completed").length
  const inProgress = statsPerTask.filter(
    (s) => s.status === "in_progress",
  ).length
  const withAttempts = statsPerTask.filter((s) => s.attempts > 0).length

  res.json({
    courseId,
    userId,
    totalTasks: tasks.length,
    completedTasks: completed,
    inProgressTasks: inProgress,
    tasksWithAttempts: withAttempts,
    overallCompletionRate:
      tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
    taskStats: statsPerTask,
  })
})

// Получить решения с результатами проверки (история по пользователю)
app.get("/users/:userId/solutions", (req, res) => {
  const { userId } = req.params
  const taskIds = db.getDistinctTaskIdsByUser(userId)

  const solutionsByTask = taskIds.map((taskId) => {
    const solutions = db
      .getSolutionsByTask(taskId)
      .filter((s) => s.user_id === userId)
    const task = db.getTaskById(taskId)

    return {
      taskId,
      taskTitle: task?.title || "Unknown",
      solutionCount: solutions.length,
      solutions: solutions.map((sol) => {
        const checkResults = db.getCheckResultsBySolution(sol.id)
        return {
          solutionId: sol.id,
          code: sol.code,
          createdAt: sol.created_at,
          checkResults,
        }
      }),
    }
  })

  res.json(solutionsByTask)
})

// Code runner
function preprocessJsUserCode(code = "") {
  return String(code)
    .replace(/^\s*export\s+default\s+/gm, "")
    .replace(/^\s*export\s+(?=(function|const|let|var|class)\b)/gm, "")
}

app.post("/code/run", async (req, res) => {
  try {
    const language = String(req.body?.language || "javascript").toLowerCase()
    const code = String(req.body?.code || "")
    const tests = Array.isArray(req.body.tests) ? req.body.tests : []
    const taskId = req.body?.taskId ? String(req.body.taskId) : null

    const authUid = getAuthUserId(req)
    if (taskId && authUid && isAdminUserId(authUid)) {
      return adminLearningForbidden(res)
    }

    if (language !== "javascript") {
      return res.status(400).json({ error: "unsupported_language" })
    }

    const runJsInVm = getRunJsInVmFresh()
    if (typeof runJsInVm !== "function") {
      throw new Error("local_runner_unavailable")
    }

    const vmResp = runJsInVm({
      code: preprocessJsUserCode(code),
      tests: tests.map((t) => ({
        expr: t.expr || t.name || "",
        expected: t.expected,
      })),
      timeoutMs: Number(process.env.LOCAL_RUN_TIMEOUT_MS || "200"),
    })

    const results = vmResp.results
    const judge = {
      provider: "local",
      ok: vmResp.ok,
      logs: vmResp.logs,
      error: vmResp.error || null,
    }

    const testResults = Array.isArray(results) ? results : []
    const testsOk =
      testResults.length > 0 && testResults.every((r) => r && r.pass === true)

    const userId = authUid

    // track attempt for recommendations/statistics
    if (userId && taskId) {
      trackTaskAttempt(userId, taskId, testsOk)
    }

    let progressUpdated = false
    let newAchievements = []
    if (testsOk && taskId) {
      if (userId) {
        updateUserProgress(userId, taskId)
        progressUpdated = true
        newAchievements = checkAchievements(userId)
      }
    }

    res.json({
      ok: true,
      judge,
      results,
      provider: "local",
      testsOk,
      progressUpdated,
      newAchievements,
    })
  } catch (e) {
    console.error("code/run failed:", e)
    res.status(500).json({
      error: "code_run_failed",
      detail: e?.message || String(e),
      status: e?.status,
      data: e?.data,
    })
  }
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
