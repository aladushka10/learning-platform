const express = require("express")
const cors = require("cors")
const { v4: uuidv4 } = require("uuid")
const db = require("./db")

const swaggerUi = require("swagger-ui-express")
const swaggerSpec = require("./swagger")

const app = express()
const PORT = process.env.PORT || 4000

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
})

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get("/openapi.json", (req, res) => {
  res.json(swaggerSpec)
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
