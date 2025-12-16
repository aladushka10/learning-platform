const express = require("express")
const cors = require("cors")
const { v4: uuidv4 } = require("uuid")
const db = require("./db")

const swaggerUi = require("swagger-ui-express")
const swaggerSpec = require("./swagger")

const app = express()
const PORT = process.env.PORT || 4000

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

// Lectures CRUD
app.get("/lectures/:id", (req, res) => {
  const l = db.getLectureById(req.params.id)
  if (!l) return res.status(404).json({ error: "not_found" })
  res.json(l)
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
  res.json(db.getTaskCategoriesByTask(req.params.id))
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
  res.json(db.getTestCases(req.params.id))
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
  res.json(db.getSolutionsByTask(req.params.id))
)
app.post("/tasks/:id/solutions", (req, res) => {
  if (!req.body?.user_id || !req.body?.code)
    return res.status(400).json({ error: "invalid" })
  const s = {
    id: uuidv4(),
    user_id: req.body.user_id,
    task_id: req.params.id,
    code: req.body.code,
    created_at: Date.now(),
  }
  db.createSolution(s)
  res.status(201).json(s)
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
  res.json(db.getCheckResultsBySolution(req.params.id))
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
  res.json(db.getProgressByUser(req.params.id))
)
app.post("/users/:id/progress", (req, res) => {
  if (!req.body?.taskId) return res.status(400).json({ error: "invalid" })
  const p = {
    id: uuidv4(),
    userId: req.params.id,
    taskId: req.body.taskId,
    status: req.body.status || "incomplete",
    updatedAt: Date.now(),
  }
  db.createProgress(p)
  res.status(201).json(p)
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

  res.json({
    accessToken: uuidv4(),
    refreshToken: uuidv4(),
    userDetails: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
    },
  })
})

app.get("/auth/user", (req, res) => {
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
    createdAt: Date.now(),
  }

  db.createUser(user)

  res.status(201).json({
    accessToken: uuidv4(),
    refreshToken: uuidv4(),
    userDetails: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
    },
  })
})

// ===== СТАТИСТИКА И ПРОГРЕСС =====

// Получить статистику по прогрессу пользователя
app.get("/users/:userId/stats", (req, res) => {
  const { userId } = req.params
  const progress = db.getProgressByUser(userId)

  if (!progress) {
    return res.json({
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      notStartedTasks: 0,
      completionRate: 0,
      tasks: [],
    })
  }

  const completed = progress.filter((p) => p.status === "completed").length
  const inProgress = progress.filter((p) => p.status === "in_progress").length
  const notStarted = progress.filter((p) => p.status === "not_started").length
  const total = progress.length

  const taskDetails = progress.map((p) => {
    const task = db.getTaskById(p.taskId)
    return {
      taskId: p.taskId,
      taskTitle: task?.title || "Unknown",
      status: p.status,
      updatedAt: p.updatedAt,
    }
  })

  res.json({
    totalTasks: total,
    completedTasks: completed,
    inProgressTasks: inProgress,
    notStartedTasks: notStarted,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    tasks: taskDetails,
  })
})

// Получить статистику по курсу
app.get("/courses/:courseId/stats/:userId", (req, res) => {
  const { courseId, userId } = req.params
  const tasks = db.getTasks(courseId)
  const userProgress = db.getProgressByUser(userId)

  const statsPerTask = tasks.map((task) => {
    const progress = userProgress.find((p) => p.taskId === task.id)
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

    return {
      taskId: task.id,
      taskTitle: task.title,
      status: progress?.status || "not_started",
      attempts: attempts,
      lastAttempt: solutions.length > 0 ? solutions[0].created_at : null,
      checkStatus: checkResults.length > 0 ? checkResults[0].status : null,
      passedTests: checkResults.length > 0 ? checkResults[0].passed_tests : 0,
    }
  })

  const completed = statsPerTask.filter((s) => s.status === "completed").length
  const inProgress = statsPerTask.filter(
    (s) => s.status === "in_progress"
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

// Получить решения с результатами проверки (для просмотра истории)
app.get("/users/:userId/solutions", (req, res) => {
  const { userId } = req.params
  const tasks = db.db
    .prepare("SELECT DISTINCT task_id FROM solutions WHERE user_id = ?")
    .all(userId)

  const solutionsByTask = tasks.map((t) => {
    const solutions = db
      .getSolutionsByTask(t.task_id)
      .filter((s) => s.user_id === userId)
    const task = db.getTaskById(t.task_id)

    return {
      taskId: t.task_id,
      taskTitle: task?.title || "Unknown",
      solutionCount: solutions.length,
      solutions: solutions.map((sol) => {
        const checkResults = db.getCheckResultsBySolution(sol.id)
        return {
          solutionId: sol.id,
          code: sol.code,
          createdAt: sol.created_at,
          checkResults: checkResults,
        }
      }),
    }
  })

  res.json(solutionsByTask)
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
