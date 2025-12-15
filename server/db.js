const Database = require("better-sqlite3")
const path = require("path")
const fs = require("fs")

const DB_DIR = path.join(__dirname, "data")
const DB_FILE = path.join(DB_DIR, "app.db")

function ensureDir() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
}

ensureDir()

const db = new Database(DB_FILE)

function init() {
  // courses table
  db.prepare(
    `CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      createdAt INTEGER
    )`
  ).run()

  // lectures table
  db.prepare(
    `CREATE TABLE IF NOT EXISTS lectures (
      id TEXT PRIMARY KEY,
      courseId TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      ord INTEGER,
      FOREIGN KEY(courseId) REFERENCES courses(id)
    )`
  ).run()

  // tasks table
  db.prepare(
    `CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      courseId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      meta TEXT,
      ord INTEGER,
      FOREIGN KEY(courseId) REFERENCES courses(id)
    )`
  ).run()

  // users table
  db.prepare(
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      firstName TEXT,
      lastName TEXT,
      phone TEXT,
      dateOfBirth TEXT,
      createdAt INTEGER
    )`
  ).run()
}

function seedIfEmpty() {
  const row = db.prepare("SELECT COUNT(1) as c FROM courses").get()
  if (row && row.c === 0) {
    const now = Date.now()
    const courseId = "math-school-1"
    db.prepare(
      "INSERT INTO courses (id, title, description, category, createdAt) VALUES (?, ?, ?, ?, ?)"
    ).run(
      courseId,
      "Математика для школьников",
      "Курс по базовой школьной математике с лекциями и практическими заданиями",
      "Mathematics",
      now
    )

    // Lectures
    const lectures = [
      {
        id: courseId + "-lec-1",
        title: "Числа и операции",
        content: "Теория: числа, операции, порядок действий",
        ord: 1,
      },
      {
        id: courseId + "-lec-2",
        title: "Дроби и проценты",
        content: "Теория: простые дроби, проценты, примеры",
        ord: 2,
      },
      {
        id: courseId + "-lec-3",
        title: "Алгебраические выражения",
        content: "Введение в алгебру: переменные, выражения, упрощение",
        ord: 3,
      },
    ]

    const insertLecture = db.prepare(
      "INSERT INTO lectures (id, courseId, title, content, ord) VALUES (?, ?, ?, ?, ?)"
    )
    for (const l of lectures) {
      insertLecture.run(l.id, courseId, l.title, l.content, l.ord)
    }

    // Tasks
    const tasks = [
      {
        id: courseId + "-task-1",
        title: "Сложение чисел",
        description: "Посчитайте сумму: 123 + 89",
        meta: JSON.stringify({ answer: 212 }),
        ord: 1,
      },
      {
        id: courseId + "-task-2",
        title: "Краткое деление",
        description: "Поделите 144 на 12",
        meta: JSON.stringify({ answer: 12 }),
        ord: 2,
      },
    ]

    const insertTask = db.prepare(
      "INSERT INTO tasks (id, courseId, title, description, meta, ord) VALUES (?, ?, ?, ?, ?, ?)"
    )
    for (const t of tasks) {
      insertTask.run(t.id, courseId, t.title, t.description, t.meta, t.ord)
    }

    // create a demo user if none exists
    const userRow = db.prepare("SELECT COUNT(1) as c FROM users").get()
    if (userRow && userRow.c === 0) {
      db.prepare(
        "INSERT INTO users (id, email, passwordHash, firstName, lastName, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(
        "user-demo-1",
        "demo@demo.com",
        "demo123",
        "Иван",
        "Демо",
        Date.now()
      )
    }
  }
}

init()
seedIfEmpty()

module.exports = {
  db,
  getCourses: () =>
    db
      .prepare(
        "SELECT id, title, description, category, createdAt FROM courses ORDER BY createdAt DESC"
      )
      .all(),
  getCourseById: (id) =>
    db
      .prepare(
        "SELECT id, title, description, category, createdAt FROM courses WHERE id = ?"
      )
      .get(id),
  createCourse: (course) =>
    db
      .prepare(
        "INSERT INTO courses (id, title, description, category, createdAt) VALUES (?, ?, ?, ?, ?)"
      )
      .run(
        course.id,
        course.title,
        course.description,
        course.category,
        course.createdAt
      ),
  // users
  getUserByEmail: (email) =>
    db
      .prepare(
        "SELECT id, email, passwordHash, firstName, lastName, phone, dateOfBirth, createdAt FROM users WHERE email = ?"
      )
      .get(email),
  createUser: (user) =>
    db
      .prepare(
        "INSERT INTO users (id, email, passwordHash, firstName, lastName, phone, dateOfBirth, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        user.id,
        user.email,
        user.passwordHash,
        user.firstName,
        user.lastName,
        user.phone,
        user.dateOfBirth,
        user.createdAt
      ),
  getLectures: (courseId) =>
    db
      .prepare(
        "SELECT id, courseId, title, content, ord FROM lectures WHERE courseId = ? ORDER BY ord ASC"
      )
      .all(courseId),
  createLecture: (lec) =>
    db
      .prepare(
        "INSERT INTO lectures (id, courseId, title, content, ord) VALUES (?, ?, ?, ?, ?)"
      )
      .run(lec.id, lec.courseId, lec.title, lec.content, lec.ord),
  getTasks: (courseId) =>
    db
      .prepare(
        "SELECT id, courseId, title, description, meta, ord FROM tasks WHERE courseId = ? ORDER BY ord ASC"
      )
      .all(courseId),
  createTask: (task) =>
    db
      .prepare(
        "INSERT INTO tasks (id, courseId, title, description, meta, ord) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(
        task.id,
        task.courseId,
        task.title,
        task.description,
        task.meta,
        task.ord
      ),
}
