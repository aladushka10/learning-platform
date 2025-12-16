const Database = require("better-sqlite3")
const path = require("path")
const fs = require("fs")
const { v4: uuidv4 } = require("uuid")

const DB_DIR = path.join(__dirname, "data")
const DB_FILE = path.join(DB_DIR, "app.db")

function ensureDir() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
}

ensureDir()

const db = new Database(DB_FILE)

function init() {
  db.prepare(
    `CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      createdAt INTEGER
    )`
  ).run()

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

  db.prepare(
    `CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      courseId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      ord INTEGER,
      FOREIGN KEY(courseId) REFERENCES courses(id)
    )`
  ).run()

  db.prepare(
    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )`
  ).run()

  db.prepare(
    `CREATE TABLE IF NOT EXISTS task_categories (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      FOREIGN KEY(task_id) REFERENCES tasks(id),
      FOREIGN KEY(category_id) REFERENCES categories(id)
    )`
  ).run()

  db.prepare(
    `CREATE TABLE IF NOT EXISTS test_cases (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      input TEXT,
      expected_output TEXT,
      FOREIGN KEY(task_id) REFERENCES tasks(id)
    )`
  ).run()

  db.prepare(
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      firstName TEXT,
      lastName TEXT,
      createdAt INTEGER
    )`
  ).run()

  db.prepare(
    `CREATE TABLE IF NOT EXISTS solutions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      task_id TEXT NOT NULL,
      code TEXT,
      created_at INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(task_id) REFERENCES tasks(id)
    )`
  ).run()

  db.prepare(
    `CREATE TABLE IF NOT EXISTS check_results (
      id TEXT PRIMARY KEY,
      solution_id TEXT NOT NULL,
      status TEXT,
      time_ms INTEGER,
      passed_tests INTEGER,
      error_message TEXT,
      FOREIGN KEY(solution_id) REFERENCES solutions(id)
    )`
  ).run()

  db.prepare(
    `CREATE TABLE IF NOT EXISTS progress (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      taskId TEXT NOT NULL,
      status TEXT,
      updatedAt INTEGER,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(taskId) REFERENCES tasks(id)
    )`
  ).run()
}

init()

// Exported DB helpers
module.exports = {
  db,
  // courses
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
  createCourse: (c) =>
    db
      .prepare(
        "INSERT INTO courses (id, title, description, category, createdAt) VALUES (?, ?, ?, ?, ?)"
      )
      .run(c.id, c.title, c.description, c.category, c.createdAt),
  // modules
  getModules: (courseId) =>
    db
      .prepare(
        "SELECT id, courseId, title, description, ord FROM modules WHERE courseId = ? ORDER BY ord ASC"
      )
      .all(courseId),
  createModule: (m) =>
    db
      .prepare(
        "INSERT INTO modules (id, courseId, title, description, ord) VALUES (?, ?, ?, ?, ?)"
      )
      .run(m.id, m.courseId, m.title, m.description, m.ord),
  getModulesById: (id) =>
    db.prepare("SELECT * FROM modules WHERE id = ?").get(id),
  // lectures
  getLectures: (courseId) =>
    db
      .prepare(
        "SELECT id, courseId, title, content, ord FROM lectures WHERE courseId = ? ORDER BY ord ASC"
      )
      .all(courseId),
  createLecture: (l) =>
    db
      .prepare(
        "INSERT INTO lectures (id, courseId, title, content, ord) VALUES (?, ?, ?, ?, ?)"
      )
      .run(l.id, l.courseId, l.title, l.content, l.ord),
  // tasks
  getTasks: (courseId) =>
    db
      .prepare(
        "SELECT id, courseId, title, description, meta, ord FROM tasks WHERE courseId = ? ORDER BY ord ASC"
      )
      .all(courseId),
  getTaskById: (id) => db.prepare("SELECT * FROM tasks WHERE id = ?").get(id),
  createTask: (t) =>
    db
      .prepare(
        "INSERT INTO tasks (id, courseId, title, description, meta, ord) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(t.id, t.courseId, t.title, t.description, t.meta, t.ord),
  // users
  getUsers: () =>
    db
      .prepare(
        "SELECT id, email, firstName, lastName, createdAt FROM users ORDER BY createdAt DESC"
      )
      .all(),
  getUserByEmail: (email) =>
    db
      .prepare(
        "SELECT id, email, passwordHash, firstName, lastName, createdAt FROM users WHERE email = ?"
      )
      .get(email),
  createUser: (u) =>
    db
      .prepare(
        "INSERT INTO users (id, email, passwordHash, firstName, lastName, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(u.id, u.email, u.passwordHash, u.firstName, u.lastName, u.createdAt),
  // categories
  getCategories: () =>
    db.prepare("SELECT id, name FROM categories ORDER BY name ASC").all(),
  getCategoryById: (id) =>
    db.prepare("SELECT * FROM categories WHERE id = ?").get(id),
  createCategory: (c) =>
    db
      .prepare("INSERT INTO categories (id, name) VALUES (?, ?)")
      .run(c.id, c.name),
  // task_categories
  createTaskCategory: (tc) =>
    db
      .prepare(
        "INSERT INTO task_categories (id, task_id, category_id) VALUES (?, ?, ?)"
      )
      .run(tc.id, tc.task_id, tc.category_id),
  // test cases
  createTestCase: (t) =>
    db
      .prepare(
        "INSERT INTO test_cases (id, task_id, input, expected_output) VALUES (?, ?, ?, ?)"
      )
      .run(t.id, t.task_id, t.input, t.expected_output),
  // solutions/checks/progress
  createSolution: (s) =>
    db
      .prepare(
        "INSERT INTO solutions (id, user_id, task_id, code, created_at) VALUES (?, ?, ?, ?, ?)"
      )
      .run(s.id, s.user_id, s.task_id, s.code, s.created_at),
  createCheckResult: (c) =>
    db
      .prepare(
        "INSERT INTO check_results (id, solution_id, status, time_ms, passed_tests, error_message) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(
        c.id,
        c.solution_id,
        c.status,
        c.time_ms,
        c.passed_tests,
        c.error_message
      ),
  createProgress: (p) =>
    db
      .prepare(
        "INSERT INTO progress (id, userId, taskId, status, updatedAt) VALUES (?, ?, ?, ?, ?)"
      )
      .run(p.id, p.userId, p.taskId, p.status, p.updatedAt),
}

// Seeding: idempotent — only seeds when course doesn't exist
function seedIfEmpty() {
  const courses = module.exports.getCourses()
  const courseId = "higher-math"
  const now = Date.now()

  // if course exists and tasks exist, assume seeded
  const existing = courses.find((c) => c.id === courseId)
  if (existing) {
    const tasks = module.exports.getTasks(courseId)
    if (tasks && tasks.length >= 15) return
  }

  // create course
  try {
    module.exports.createCourse({
      id: courseId,
      title: "Высшая математика",
      description:
        "Полный курс по высшей математике: пределы, производные, интегралы, дифференциальные уравнения",
      category: "Mathematics",
      createdAt: now,
    })
  } catch (e) {}

  // demo user
  try {
    if (!module.exports.getUserByEmail("demo@example.com")) {
      module.exports.createUser({
        id: "demo-user",
        email: "demo@example.com",
        passwordHash: "hashed_password_123",
        firstName: "Демо",
        lastName: "Ученик",
        createdAt: now,
      })
    }
  } catch (e) {}

  // categories
  const categories = [
    { id: "limits", name: "Пределы" },
    { id: "derivatives", name: "Производные" },
    { id: "integrals", name: "Интегралы" },
    { id: "diff-equations", name: "Дифференциальные уравнения" },
  ]
  categories.forEach((cat) => {
    try {
      if (!module.exports.getCategoryById(cat.id))
        module.exports.createCategory(cat)
    } catch (e) {}
  })

  // lectures
  const lectures = [
    {
      id: "lec-1",
      courseId,
      title: "1. Понятие предела функции",
      content: "Пределы и определения",
      ord: 1,
    },
    {
      id: "lec-2",
      courseId,
      title: "2. Непрерывность функции",
      content: "Непрерывность и свойства",
      ord: 2,
    },
    {
      id: "lec-3",
      courseId,
      title: "3. Производная и её смысл",
      content: "Производная — геометрический и физический смысл",
      ord: 3,
    },
    {
      id: "lec-4",
      courseId,
      title: "4. Таблица производных",
      content: "Правила дифференцирования",
      ord: 4,
    },
    {
      id: "lec-5",
      courseId,
      title: "5. Неопределённый интеграл",
      content: "Интегралы и таблицы",
      ord: 5,
    },
    {
      id: "lec-6",
      courseId,
      title: "6. Определённый интеграл",
      content: "Определённый интеграл и приложения",
      ord: 6,
    },
  ]
  try {
    const existingLect = module.exports.getLectures(courseId)
    if (!existingLect || existingLect.length === 0)
      lectures.forEach((l) => module.exports.createLecture(l))
  } catch (e) {}

  // modules
  try {
    const existingMods = module.exports.getModules(courseId)
    if (!existingMods || existingMods.length === 0) {
      const modules = [
        {
          id: "mod-1",
          courseId,
          title: "Модуль 1: Пределы и непрерывность",
          description: "Пределы и непрерывность",
          ord: 1,
        },
        {
          id: "mod-2",
          courseId,
          title: "Модуль 2: Дифференциальное исчисление",
          description: "Производные и приложения",
          ord: 2,
        },
        {
          id: "mod-3",
          courseId,
          title: "Модуль 3: Интегральное исчисление",
          description: "Интегралы",
          ord: 3,
        },
      ]
      modules.forEach((m) => module.exports.createModule(m))
    }
  } catch (e) {}

  // tasks (15 tasks)
  try {
    const existingTasks = module.exports.getTasks(courseId)
    if (!existingTasks || existingTasks.length === 0) {
      const tasks = [
        {
          id: "task-1",
          courseId,
          title: "Вычисление предела",
          description: "Найдите: lim[x→2] (x² - 4)/(x - 2)",
          meta: JSON.stringify({ type: "numeric", answer: 4 }),
          ord: 1,
        },
        {
          id: "task-2",
          courseId,
          title: "Производная полинома",
          description: "Найдите f'(x) для f(x) = x² + 3x - 5",
          meta: JSON.stringify({ type: "formula", answer: "2x + 3" }),
          ord: 2,
        },
        {
          id: "task-3",
          courseId,
          title: "Производная произведения",
          description: "Найдите производную: f(x) = x · sin(x)",
          meta: JSON.stringify({
            type: "formula",
            answer: "sin(x) + x·cos(x)",
          }),
          ord: 3,
        },
        {
          id: "task-4",
          courseId,
          title: "Интеграл полинома",
          description: "Найдите: ∫(3x² + 2x)dx",
          meta: JSON.stringify({ type: "formula", answer: "x³ + x² + C" }),
          ord: 4,
        },
        {
          id: "task-5",
          courseId,
          title: "Интегрирование по частям",
          description: "Найдите: ∫x·eˣ dx",
          meta: JSON.stringify({ type: "formula", answer: "eˣ(x - 1) + C" }),
          ord: 5,
        },
        {
          id: "task-6",
          courseId,
          title: "Предел при бесконечности",
          description: "Найдите lim[x→∞] (3x² + 2)/(x² - 5)",
          meta: JSON.stringify({ type: "numeric", answer: 3 }),
          ord: 6,
        },
        {
          id: "task-7",
          courseId,
          title: "Односторонний предел",
          description: "Найдите lim[x→0+] 1/x",
          meta: JSON.stringify({ type: "theory", answer: "+∞" }),
          ord: 7,
        },
        {
          id: "task-8",
          courseId,
          title: "Непрерывность функции",
          description: "Является ли f(x)=|x| непрерывной в 0?",
          meta: JSON.stringify({ type: "theory", answer: "Да" }),
          ord: 8,
        },
        {
          id: "task-9",
          courseId,
          title: "Производная синуса",
          description: "Найдите производную sin(x)",
          meta: JSON.stringify({ type: "formula", answer: "cos(x)" }),
          ord: 9,
        },
        {
          id: "task-10",
          courseId,
          title: "Производная экспоненты",
          description: "Найдите производную e^x",
          meta: JSON.stringify({ type: "formula", answer: "e^x" }),
          ord: 10,
        },
        {
          id: "task-11",
          courseId,
          title: "Экстремум функции",
          description: "Найдите экстремумы f(x)=x²-4x",
          meta: JSON.stringify({ type: "analysis", answer: "x=2 — минимум" }),
          ord: 11,
        },
        {
          id: "task-12",
          courseId,
          title: "Вторая производная",
          description: "Найдите f''(x), если f(x)=x³",
          meta: JSON.stringify({ type: "formula", answer: "6x" }),
          ord: 12,
        },
        {
          id: "task-13",
          courseId,
          title: "Неопределённый интеграл",
          description: "∫x dx",
          meta: JSON.stringify({ type: "formula", answer: "x²/2 + C" }),
          ord: 13,
        },
        {
          id: "task-14",
          courseId,
          title: "Интеграл синуса",
          description: "∫sin(x) dx",
          meta: JSON.stringify({ type: "formula", answer: "-cos(x) + C" }),
          ord: 14,
        },
        {
          id: "task-15",
          courseId,
          title: "Определённый интеграл",
          description: "∫[0,1] x dx",
          meta: JSON.stringify({ type: "numeric", answer: 0.5 }),
          ord: 15,
        },
      ]
      tasks.forEach((t) => {
        try {
          module.exports.createTask(t)
        } catch (e) {}
      })

      // create some categories mapping and test cases
      try {
        module.exports.createTaskCategory({
          id: uuidv4(),
          task_id: "task-1",
          category_id: "limits",
        })
        module.exports.createTaskCategory({
          id: uuidv4(),
          task_id: "task-2",
          category_id: "derivatives",
        })
        module.exports.createTaskCategory({
          id: uuidv4(),
          task_id: "task-3",
          category_id: "derivatives",
        })
        module.exports.createTaskCategory({
          id: uuidv4(),
          task_id: "task-4",
          category_id: "integrals",
        })
        module.exports.createTaskCategory({
          id: uuidv4(),
          task_id: "task-5",
          category_id: "integrals",
        })

        const testCases = [
          {
            id: uuidv4(),
            task_id: "task-1",
            input: "limit(x->2)",
            expected_output: "4",
          },
          {
            id: uuidv4(),
            task_id: "task-2",
            input: "derivative",
            expected_output: "2x + 3",
          },
        ]
        testCases.forEach((tc) => {
          try {
            module.exports.createTestCase(tc)
          } catch (e) {}
        })

        // progress + sample solutions
        module.exports.createProgress({
          id: uuidv4(),
          userId: "demo-user",
          taskId: "task-1",
          status: "completed",
          updatedAt: now,
        })
      } catch (e) {}
    }
  } catch (e) {}
}

seedIfEmpty()
