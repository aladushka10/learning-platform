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
    )`,
  ).run()

  db.prepare(
    `CREATE TABLE IF NOT EXISTS lectures (
      id TEXT PRIMARY KEY,
      courseId TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      ord INTEGER,
      FOREIGN KEY(courseId) REFERENCES courses(id)
    )`,
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
    )`,
  ).run()

  db.prepare(
    `CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      courseId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      ord INTEGER,
      FOREIGN KEY(courseId) REFERENCES courses(id)
    )`,
  ).run()

  db.prepare(
    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )`,
  ).run()

  db.prepare(
    `CREATE TABLE IF NOT EXISTS task_categories (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      FOREIGN KEY(task_id) REFERENCES tasks(id),
      FOREIGN KEY(category_id) REFERENCES categories(id)
    )`,
  ).run()

  db.prepare(
    `CREATE TABLE IF NOT EXISTS test_cases (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      input TEXT,
      expected_output TEXT,
      FOREIGN KEY(task_id) REFERENCES tasks(id)
    )`,
  ).run()

  db.prepare(
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      firstName TEXT,
      lastName TEXT,
      avatarId TEXT,
      createdAt INTEGER
    )`,
  ).run()

  // migration: add avatarId for existing databases
  try {
    const cols = db.prepare("PRAGMA table_info(users)").all()
    const hasAvatarId = cols.some((c) => c && c.name === "avatarId")
    if (!hasAvatarId) {
      db.prepare("ALTER TABLE users ADD COLUMN avatarId TEXT").run()
    }
  } catch (e) {
    // best-effort migration
  }

  db.prepare(
    `CREATE TABLE IF NOT EXISTS solutions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      task_id TEXT NOT NULL,
      code TEXT,
      created_at INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(task_id) REFERENCES tasks(id)
    )`,
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
    )`,
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
    )`,
  ).run()

  db.prepare(
    `CREATE TABLE IF NOT EXISTS task_stats (
      userId TEXT NOT NULL,
      taskId TEXT NOT NULL,
      opens INTEGER NOT NULL DEFAULT 0,
      attempts INTEGER NOT NULL DEFAULT 0,
      successes INTEGER NOT NULL DEFAULT 0,
      lastAttemptAt INTEGER,
      PRIMARY KEY (userId, taskId),
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(taskId) REFERENCES tasks(id)
    )`,
  ).run()

  // ===== Lecture quizzes (multiple-choice) =====
  db.prepare(
    `CREATE TABLE IF NOT EXISTS lecture_quizzes (
      id TEXT PRIMARY KEY,
      lectureId TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      createdAt INTEGER,
      FOREIGN KEY(lectureId) REFERENCES lectures(id)
    )`,
  ).run()

  db.prepare(
    `CREATE TABLE IF NOT EXISTS quiz_questions (
      id TEXT PRIMARY KEY,
      quizId TEXT NOT NULL,
      text TEXT NOT NULL,
      ord INTEGER,
      FOREIGN KEY(quizId) REFERENCES lecture_quizzes(id)
    )`,
  ).run()

  db.prepare(
    `CREATE TABLE IF NOT EXISTS quiz_options (
      id TEXT PRIMARY KEY,
      questionId TEXT NOT NULL,
      text TEXT NOT NULL,
      isCorrect INTEGER NOT NULL DEFAULT 0,
      ord INTEGER,
      FOREIGN KEY(questionId) REFERENCES quiz_questions(id)
    )`,
  ).run()

  db.prepare(
    `CREATE TABLE IF NOT EXISTS lecture_quiz_attempts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      lectureId TEXT NOT NULL,
      quizId TEXT NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      createdAt INTEGER,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(lectureId) REFERENCES lectures(id),
      FOREIGN KEY(quizId) REFERENCES lecture_quizzes(id)
    )`,
  ).run()

  db.prepare(
    `CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      criteriaType TEXT,
      criteriaValue INTEGER
    )`,
  ).run()

  db.prepare(
    `CREATE TABLE IF NOT EXISTS user_achievements (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      achievementId TEXT NOT NULL,
      unlockedAt INTEGER,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(achievementId) REFERENCES achievements(id)
    )`,
  ).run()
}

init()

function seedAchievements() {
  // Seed achievements (3 шт.). Важно: обновляем значения, если запись уже есть.
  try {
    const achievements = [
      {
        id: "three_tasks",
        name: "Первые успехи",
        description: "Решите 4 задачи",
        icon: "book",
        criteriaType: "tasks_completed",
        criteriaValue: 4,
      },
      {
        id: "streak_5",
        name: "Серия 5 дней",
        description: "Решайте задачи 5 дней подряд",
        icon: "fire",
        criteriaType: "streak_days",
        criteriaValue: 5,
      },
      {
        id: "all_tasks_course",
        name: "Покоритель курса",
        description: "Выполните все задачи курса",
        icon: "crown",
        criteriaType: "course_all_tasks",
        criteriaValue: 1,
      },
    ]
    const upsert = db.prepare(
      `INSERT INTO achievements (id, name, description, icon, criteriaType, criteriaValue)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         description = excluded.description,
         icon = excluded.icon,
         criteriaType = excluded.criteriaType,
         criteriaValue = excluded.criteriaValue`,
    )
    achievements.forEach((a) => {
      try {
        upsert.run(
          a.id,
          a.name,
          a.description,
          a.icon,
          a.criteriaType,
          a.criteriaValue,
        )
      } catch (e) {}
    })
  } catch (e) {}
}

// Exported DB helpers
module.exports = {
  db,
  // courses
  getCourses: () =>
    db
      .prepare(
        "SELECT id, title, description, category, createdAt FROM courses ORDER BY createdAt DESC",
      )
      .all(),
  getCourseById: (id) =>
    db
      .prepare(
        "SELECT id, title, description, category, createdAt FROM courses WHERE id = ?",
      )
      .get(id),
  createCourse: (c) =>
    db
      .prepare(
        "INSERT INTO courses (id, title, description, category, createdAt) VALUES (?, ?, ?, ?, ?)",
      )
      .run(c.id, c.title, c.description, c.category, c.createdAt),
  updateCourse: (id, data) =>
    db
      .prepare(
        "UPDATE courses SET title = ?, description = ?, category = ? WHERE id = ?",
      )
      .run(data.title, data.description, data.category, id),
  deleteCourse: (id) => db.prepare("DELETE FROM courses WHERE id = ?").run(id),

  // modules
  getModules: (courseId) =>
    db
      .prepare(
        "SELECT id, courseId, title, description, ord FROM modules WHERE courseId = ? ORDER BY ord ASC",
      )
      .all(courseId),
  createModule: (m) =>
    db
      .prepare(
        "INSERT INTO modules (id, courseId, title, description, ord) VALUES (?, ?, ?, ?, ?)",
      )
      .run(m.id, m.courseId, m.title, m.description, m.ord),
  getModuleById: (id) =>
    db.prepare("SELECT * FROM modules WHERE id = ?").get(id),
  updateModule: (id, data) =>
    db
      .prepare(
        "UPDATE modules SET title = ?, description = ?, ord = ? WHERE id = ?",
      )
      .run(data.title, data.description, data.ord, id),
  deleteModule: (id) => db.prepare("DELETE FROM modules WHERE id = ?").run(id),

  // lectures
  getLectures: (courseId) =>
    db
      .prepare(
        "SELECT id, courseId, title, content, ord FROM lectures WHERE courseId = ? ORDER BY ord ASC",
      )
      .all(courseId),
  getLectureById: (id) =>
    db
      .prepare(
        "SELECT id, courseId, title, content, ord FROM lectures WHERE id = ?",
      )
      .get(id),
  createLecture: (l) =>
    db
      .prepare(
        `INSERT INTO lectures (id, courseId, title, content, ord)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           courseId = excluded.courseId,
           title = excluded.title,
           content = excluded.content,
           ord = excluded.ord`,
      )
      .run(l.id, l.courseId, l.title, l.content, l.ord),
  updateLecture: (id, data) =>
    db
      .prepare(
        "UPDATE lectures SET title = ?, content = ?, ord = ? WHERE id = ?",
      )
      .run(data.title, data.content, data.ord, id),
  deleteLecture: (id) =>
    db.prepare("DELETE FROM lectures WHERE id = ?").run(id),

  // lecture quizzes
  upsertLectureQuiz: (lectureId, title) => {
    const id = uuidv4()
    const createdAt = Date.now()
    db.prepare(
      `INSERT INTO lecture_quizzes (id, lectureId, title, createdAt)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(lectureId) DO UPDATE SET
         title = excluded.title`,
    ).run(id, lectureId, title, createdAt)
    const row = db
      .prepare(
        "SELECT id, lectureId, title, createdAt FROM lecture_quizzes WHERE lectureId = ?",
      )
      .get(lectureId)
    return row
  },

  deleteQuizByLecture: (lectureId) => {
    const quiz = db
      .prepare("SELECT id FROM lecture_quizzes WHERE lectureId = ?")
      .get(lectureId)
    if (!quiz) return
    const qIds = db
      .prepare("SELECT id FROM quiz_questions WHERE quizId = ?")
      .all(quiz.id)
      .map((r) => r.id)
    if (qIds.length > 0) {
      const placeholders = qIds.map(() => "?").join(",")
      db.prepare(
        `DELETE FROM quiz_options WHERE questionId IN (${placeholders})`,
      ).run(...qIds)
    }
    db.prepare("DELETE FROM quiz_questions WHERE quizId = ?").run(quiz.id)
    db.prepare("DELETE FROM lecture_quizzes WHERE id = ?").run(quiz.id)
  },

  createQuizQuestion: (q) =>
    db
      .prepare(
        "INSERT INTO quiz_questions (id, quizId, text, ord) VALUES (?, ?, ?, ?)",
      )
      .run(q.id, q.quizId, q.text, q.ord ?? null),

  createQuizOption: (o) =>
    db
      .prepare(
        "INSERT INTO quiz_options (id, questionId, text, isCorrect, ord) VALUES (?, ?, ?, ?, ?)",
      )
      .run(o.id, o.questionId, o.text, o.isCorrect ? 1 : 0, o.ord ?? null),

  getLectureQuizByLectureId: (lectureId) => {
    const quiz = db
      .prepare(
        "SELECT id, lectureId, title, createdAt FROM lecture_quizzes WHERE lectureId = ?",
      )
      .get(lectureId)
    if (!quiz) return null

    const questions = db
      .prepare(
        "SELECT id, quizId, text, ord FROM quiz_questions WHERE quizId = ? ORDER BY ord ASC",
      )
      .all(quiz.id)

    const questionIds = questions.map((q) => q.id)
    const optionsByQuestion = {}
    if (questionIds.length > 0) {
      const placeholders = questionIds.map(() => "?").join(",")
      const opts = db
        .prepare(
          `SELECT id, questionId, text, isCorrect, ord
           FROM quiz_options
           WHERE questionId IN (${placeholders})
           ORDER BY ord ASC`,
        )
        .all(...questionIds)
      opts.forEach((o) => {
        if (!optionsByQuestion[o.questionId])
          optionsByQuestion[o.questionId] = []
        optionsByQuestion[o.questionId].push(o)
      })
    }

    return {
      ...quiz,
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text,
        ord: q.ord,
        options: (optionsByQuestion[q.id] || []).map((o) => ({
          id: o.id,
          text: o.text,
          ord: o.ord,
          isCorrect: o.isCorrect === 1,
        })),
      })),
    }
  },

  createLectureQuizAttempt: (a) =>
    db
      .prepare(
        "INSERT INTO lecture_quiz_attempts (id, userId, lectureId, quizId, score, total, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        a.id,
        a.userId,
        a.lectureId,
        a.quizId,
        a.score,
        a.total,
        a.createdAt,
      ),

  // tasks
  getTasks: (courseId) =>
    db
      .prepare(
        "SELECT id, courseId, title, description, meta, ord FROM tasks WHERE courseId = ? ORDER BY ord ASC",
      )
      .all(courseId),
  getTaskById: (id) => db.prepare("SELECT * FROM tasks WHERE id = ?").get(id),
  createTask: (t) =>
    db
      .prepare(
        "INSERT INTO tasks (id, courseId, title, description, meta, ord) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .run(t.id, t.courseId, t.title, t.description, t.meta, t.ord),
  updateTask: (id, data) =>
    db
      .prepare(
        "UPDATE tasks SET title = ?, description = ?, meta = ?, ord = ? WHERE id = ?",
      )
      .run(data.title, data.description, data.meta, data.ord, id),
  deleteTask: (id) => db.prepare("DELETE FROM tasks WHERE id = ?").run(id),

  // users
  getUsers: () =>
    db
      .prepare(
        "SELECT id, email, firstName, lastName, avatarId, createdAt FROM users ORDER BY createdAt DESC",
      )
      .all(),
  getUserById: (id) =>
    db
      .prepare(
        "SELECT id, email, passwordHash, firstName, lastName, avatarId, createdAt FROM users WHERE id = ?",
      )
      .get(id),
  getUserByEmail: (email) =>
    db
      .prepare(
        "SELECT id, email, passwordHash, firstName, lastName, avatarId, createdAt FROM users WHERE email = ?",
      )
      .get(email),
  createUser: (u) =>
    db
      .prepare(
        "INSERT INTO users (id, email, passwordHash, firstName, lastName, avatarId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        u.id,
        u.email,
        u.passwordHash,
        u.firstName,
        u.lastName,
        u.avatarId || null,
        u.createdAt,
      ),
  updateUser: (id, data) =>
    db
      .prepare(
        "UPDATE users SET email = ?, firstName = ?, lastName = ? WHERE id = ?",
      )
      .run(data.email, data.firstName, data.lastName, id),
  updateUserAvatar: (id, avatarId) =>
    db
      .prepare("UPDATE users SET avatarId = ? WHERE id = ?")
      .run(avatarId, id),
  deleteUser: (id) => db.prepare("DELETE FROM users WHERE id = ?").run(id),

  // categories
  getCategories: () =>
    db.prepare("SELECT id, name FROM categories ORDER BY name ASC").all(),
  getCategoryById: (id) =>
    db.prepare("SELECT * FROM categories WHERE id = ?").get(id),
  createCategory: (c) =>
    db
      .prepare("INSERT INTO categories (id, name) VALUES (?, ?)")
      .run(c.id, c.name),
  updateCategory: (id, data) =>
    db
      .prepare("UPDATE categories SET name = ? WHERE id = ?")
      .run(data.name, id),
  deleteCategory: (id) =>
    db.prepare("DELETE FROM categories WHERE id = ?").run(id),

  // task_categories
  createTaskCategory: (tc) =>
    db
      .prepare(
        "INSERT INTO task_categories (id, task_id, category_id) VALUES (?, ?, ?)",
      )
      .run(tc.id, tc.task_id, tc.category_id),
  getTaskCategoriesByTask: (taskId) =>
    db.prepare("SELECT * FROM task_categories WHERE task_id = ?").all(taskId),
  deleteTaskCategory: (id) =>
    db.prepare("DELETE FROM task_categories WHERE id = ?").run(id),

  // test cases
  getTestCases: (taskId) =>
    db.prepare("SELECT * FROM test_cases WHERE task_id = ?").all(taskId),
  getTestCaseById: (id) =>
    db.prepare("SELECT * FROM test_cases WHERE id = ?").get(id),
  updateTestCase: (id, data) =>
    db
      .prepare(
        "UPDATE test_cases SET input = ?, expected_output = ? WHERE id = ?",
      )
      .run(data.input, data.expected_output, id),
  deleteTestCase: (id) =>
    db.prepare("DELETE FROM test_cases WHERE id = ?").run(id),

  // solutions/checks/progress
  getSolutionsByTask: (taskId) =>
    db
      .prepare(
        "SELECT * FROM solutions WHERE task_id = ? ORDER BY created_at DESC",
      )
      .all(taskId),
  getDistinctTaskIdsByUser: (userId) =>
    db
      .prepare(
        "SELECT DISTINCT task_id as task_id FROM solutions WHERE user_id = ?",
      )
      .all(userId)
      .map((r) => r.task_id),
  getSolutionById: (id) =>
    db.prepare("SELECT * FROM solutions WHERE id = ?").get(id),
  updateSolution: (id, data) =>
    db.prepare("UPDATE solutions SET code = ? WHERE id = ?").run(data.code, id),
  deleteSolution: (id) =>
    db.prepare("DELETE FROM solutions WHERE id = ?").run(id),

  getCheckResultsBySolution: (solutionId) =>
    db
      .prepare(
        "SELECT * FROM check_results WHERE solution_id = ? ORDER BY ROWID DESC",
      )
      .all(solutionId),
  getCheckResultById: (id) =>
    db.prepare("SELECT * FROM check_results WHERE id = ?").get(id),
  updateCheckResult: (id, data) =>
    db
      .prepare(
        "UPDATE check_results SET status = ?, time_ms = ?, passed_tests = ?, error_message = ? WHERE id = ?",
      )
      .run(
        data.status,
        data.time_ms,
        data.passed_tests,
        data.error_message,
        id,
      ),
  deleteCheckResult: (id) =>
    db.prepare("DELETE FROM check_results WHERE id = ?").run(id),

  createProgress: (p) =>
    db
      .prepare(
        "INSERT INTO progress (id, userId, taskId, status, updatedAt) VALUES (?, ?, ?, ?, ?)",
      )
      .run(p.id, p.userId, p.taskId, p.status, p.updatedAt),

  createSolution: (s) =>
    db
      .prepare(
        "INSERT INTO solutions (id, user_id, task_id, code, created_at) VALUES (?, ?, ?, ?, ?)",
      )
      .run(s.id, s.user_id, s.task_id, s.code, s.created_at),

  createCheckResult: (c) =>
    db
      .prepare(
        `INSERT INTO check_results
     (id, solution_id, status, time_ms, passed_tests, error_message)
     VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        c.id,
        c.solution_id,
        c.status,
        c.time_ms,
        c.passed_tests,
        c.error_message,
      ),

  getProgressByUser: (userId) =>
    db
      .prepare(
        "SELECT * FROM progress WHERE userId = ? ORDER BY updatedAt DESC",
      )
      .all(userId),
  getProgressById: (id) =>
    db.prepare("SELECT * FROM progress WHERE id = ?").get(id),
  getProgressByUserAndTask: (userId, taskId) =>
    db
      .prepare("SELECT * FROM progress WHERE userId = ? AND taskId = ?")
      .get(userId, taskId),
  updateProgress: (id, data) =>
    db
      .prepare("UPDATE progress SET status = ?, updatedAt = ? WHERE id = ?")
      .run(data.status, data.updatedAt, id),
  deleteProgress: (id) =>
    db.prepare("DELETE FROM progress WHERE id = ?").run(id),

  incrementTaskOpen: (userId, taskId) =>
    db
      .prepare(
        `INSERT INTO task_stats (userId, taskId, opens, attempts, successes, lastAttemptAt)
         VALUES (?, ?, 1, 0, 0, NULL)
         ON CONFLICT(userId, taskId) DO UPDATE SET opens = task_stats.opens + 1`,
      )
      .run(userId, taskId),

  incrementTaskAttempt: (userId, taskId, success, ts) =>
    db
      .prepare(
        `INSERT INTO task_stats (userId, taskId, opens, attempts, successes, lastAttemptAt)
         VALUES (?, ?, 0, 1, ?, ?)
         ON CONFLICT(userId, taskId) DO UPDATE SET
           attempts = task_stats.attempts + 1,
           successes = task_stats.successes + ?,
           lastAttemptAt = ?`,
      )
      .run(userId, taskId, success ? 1 : 0, ts, success ? 1 : 0, ts),

  getTaskStatsForUserTask: (userId, taskId) =>
    db
      .prepare(
        "SELECT userId, taskId, opens, attempts, successes, lastAttemptAt FROM task_stats WHERE userId = ? AND taskId = ?",
      )
      .get(userId, taskId),

  upsertProgress: (p) => {
    const existing = db
      .prepare("SELECT id FROM progress WHERE userId = ? AND taskId = ?")
      .get(p.userId, p.taskId)
    if (existing) {
      db.prepare(
        "UPDATE progress SET status = ?, updatedAt = ? WHERE id = ?",
      ).run(p.status, p.updatedAt, existing.id)
    } else {
      db.prepare(
        "INSERT INTO progress (id, userId, taskId, status, updatedAt) VALUES (?, ?, ?, ?, ?)",
      ).run(p.id || uuidv4(), p.userId, p.taskId, p.status, p.updatedAt)
    }
  },

  countTasksByCourse: (courseId) =>
    db
      .prepare("SELECT COUNT(*) as n FROM tasks WHERE courseId = ?")
      .get(courseId).n,

  countCorrectSolutions: (userId, courseId) =>
    db
      .prepare(
        `SELECT COUNT(DISTINCT s.task_id) as n
       FROM solutions s
       JOIN check_results cr ON cr.solution_id = s.id
       JOIN tasks t ON t.id = s.task_id
       WHERE s.user_id = ? AND t.courseId = ? AND cr.status = 'correct'`,
      )
      .get(userId, courseId).n,

  getCompletedTaskIdsByUser: (userId) => {
    const byCorrect = db
      .prepare(
        `SELECT DISTINCT s.task_id as task_id
         FROM solutions s
         JOIN check_results cr ON cr.solution_id = s.id
         WHERE s.user_id = ? AND cr.status = 'correct'`,
      )
      .all(userId)
      .map((r) => r.task_id)

    const byProgress = db
      .prepare(
        `SELECT DISTINCT p.taskId as task_id
         FROM progress p
         WHERE p.userId = ? AND p.status = 'completed'`,
      )
      .all(userId)
      .map((r) => r.task_id)

    return Array.from(new Set([...byCorrect, ...byProgress]))
  },

  _ACHIEVEMENT_IDS: ["three_tasks", "streak_5", "all_tasks_course"],
  getAchievementsDefinitions: () =>
    db
      .prepare(
        "SELECT * FROM achievements WHERE id IN ('three_tasks','streak_5','all_tasks_course') ORDER BY CASE id WHEN 'three_tasks' THEN 1 WHEN 'streak_5' THEN 2 WHEN 'all_tasks_course' THEN 3 ELSE 99 END",
      )
      .all(),
  getUserAchievements: (userId) =>
    db
      .prepare(
        `SELECT a.id, a.name, a.description, a.icon, ua.unlockedAt
         FROM achievements a
         LEFT JOIN user_achievements ua ON ua.achievementId = a.id AND ua.userId = ?
         WHERE a.id IN ('three_tasks','streak_5','all_tasks_course')
         ORDER BY CASE a.id WHEN 'three_tasks' THEN 1 WHEN 'streak_5' THEN 2 WHEN 'all_tasks_course' THEN 3 ELSE 99 END`,
      )
      .all(userId),
  unlockAchievement: (userId, achievementId) => {
    const existing = db
      .prepare(
        "SELECT id FROM user_achievements WHERE userId = ? AND achievementId = ?",
      )
      .get(userId, achievementId)

    if (existing) return null

    const achievement = db
      .prepare("SELECT * FROM achievements WHERE id = ?")
      .get(achievementId)

    const unlockedAt = Date.now()

    db.prepare(
      "INSERT INTO user_achievements (id, userId, achievementId, unlockedAt) VALUES (?, ?, ?, ?)",
    ).run(uuidv4(), userId, achievementId, unlockedAt)

    return {
      ...achievement,
      unlockedAt,
    }
  },
  revokeAchievement: (userId, achievementId) => {
    db.prepare(
      "DELETE FROM user_achievements WHERE userId = ? AND achievementId = ?",
    ).run(userId, achievementId)
  },
  getRecentUserAchievements: (userId, limit = 5) =>
    db
      .prepare(
        `SELECT a.id, a.name, a.description, a.icon, ua.unlockedAt
         FROM user_achievements ua
         JOIN achievements a ON a.id = ua.achievementId
         WHERE ua.userId = ?
         ORDER BY ua.unlockedAt DESC LIMIT ?`,
      )
      .all(userId, limit),

  // Возвращает уникальные даты (YYYY-MM-DD) дней с верным решением, от новых к старым
  getCorrectSolutionDates: (userId) => {
    const rows = db
      .prepare(
        `SELECT s.created_at as created_at
         FROM solutions s
         JOIN check_results cr ON cr.solution_id = s.id
         WHERE s.user_id = ? AND cr.status = 'correct'
         ORDER BY s.created_at DESC`,
      )
      .all(userId)
    const dates = new Set()
    rows.forEach((r) => {
      const d = new Date(r.created_at)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      dates.add(`${y}-${m}-${day}`) // local day
    })
    return Array.from(dates).sort().reverse()
  },

  getCompletedProgressDates: (userId) => {
    const rows = db
      .prepare(
        `SELECT p.updatedAt as updatedAt
         FROM progress p
         WHERE p.userId = ? AND p.status = 'completed'
         ORDER BY p.updatedAt DESC`,
      )
      .all(userId)
    const dates = new Set()
    rows.forEach((r) => {
      const d = new Date(r.updatedAt)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      dates.add(`${y}-${m}-${day}`)
    })
    return Array.from(dates).sort().reverse()
  },
}

function seedIfEmpty() {
  const courses = module.exports.getCourses()
  const courseId = "higher-math"
  const now = Date.now()
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

  const lectures = [
    {
      id: "lec-1",
      courseId,
      title: "1. Понятие предела функции",
      content: `
### Понятие предела функции

Понятие предела является одним из базовых понятий математического анализа и служит основой для изучения непрерывности, производных и интегралов. Интуитивно предел функции описывает поведение значений функции при приближении аргумента к некоторой фиксированной точке.

Пусть функция $f(x)$ определена в окрестности точки $x_0$, за исключением, возможно, самой точки $x_0$. Число $L$ называется **пределом функции** $f(x)$ при $x \\to x_0$, если значения функции становятся сколь угодно близкими к $L$ при достаточно близких к $x_0$ значениях аргумента:

$$
\\lim_{x \\to x_0} f(x) = L
$$

Формальное определение предела даётся с помощью $\\varepsilon$–$\\delta$ определения: для любого $\\varepsilon > 0$ существует такое $\\delta > 0$, что при выполнении условия  

$$
0 < |x - x_0| < \\delta
$$

выполняется неравенство  

$$
|f(x) - L| < \\varepsilon
$$

Рассматриваются также **односторонние пределы** — левосторонний и правосторонний, которые характеризуют поведение функции при приближении к точке только с одной стороны.

К основным свойствам пределов относятся:
- единственность предела;
- линейность;
- правила вычисления пределов суммы, произведения и частного функций.

Эти свойства позволяют находить пределы сложных выражений, сводя задачу к более простым случаям.
`,
      ord: 1,
    },

    {
      id: "lec-2",
      courseId,
      title: "2. Непрерывность функции",
      content: `
### Непрерывность функции

Понятие непрерывности функции тесно связано с понятием предела и описывает отсутствие скачков и разрывов в поведении функции. Интуитивно функция считается непрерывной, если её график можно начертить, не отрывая карандаша от бумаги.

Функция $f(x)$ называется **непрерывной в точке** $x_0$, если выполняются три условия:
1. функция определена в точке $x_0$;
2. существует предел $\\lim_{x \\to x_0} f(x)$;
3. значение предела равно значению функции в точке:

$$
\\lim_{x \\to x_0} f(x) = f(x_0)
$$

Если функция непрерывна в каждой точке некоторого промежутка, то говорят, что она непрерывна на этом промежутке.

Классами непрерывных функций являются многочлены, показательные, логарифмические и тригонометрические функции в областях их определения.

Непрерывные функции обладают важными свойствами:
- принимают все промежуточные значения;
- достигают на замкнутом отрезке максимума и минимума.
`,
      ord: 2,
    },

    {
      id: "lec-3",
      courseId,
      title: "3. Производная и её смысл",
      content: `
### Производная функции и её смысл

Производная является одной из ключевых характеристик функции и показывает, как быстро изменяется значение функции при изменении аргумента.

Производная функции $f(x)$ в точке $x_0$ определяется как предел:

$$
f'(x_0) = \\lim_{\\Delta x \\to 0}
\\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x}
$$

**Геометрический смысл производной** заключается в том, что она равна угловому коэффициенту касательной к графику функции в данной точке.

**Физический смысл производной** связан со скоростью изменения величины. Например, если функция описывает путь тела во времени, то её производная соответствует мгновенной скорости.

Не каждая функция имеет производную. Для существования производной функция должна быть непрерывной в данной точке, однако непрерывность не гарантирует дифференцируемость.
`,
      ord: 3,
    },

    {
      id: "lec-4",
      courseId,
      title: "4. Таблица производных",
      content: `
### Таблица производных и правила дифференцирования

Для упрощения вычислений в математическом анализе используется таблица производных элементарных функций.

К основным формулам относятся:
- $(x^n)' = n x^{n-1}$
- $(\\sin x)' = \\cos x$
- $(\\cos x)' = -\\sin x$
- $(e^x)' = e^x$

Помимо таблицы используются **правила дифференцирования**:
- правило суммы;
- правило произведения;
- правило частного;
- правило цепочки.

Использование этих правил позволяет находить производные сложных функций и является основой для исследования функций и решения прикладных задач.
`,
      ord: 4,
    },

    {
      id: "lec-5",
      courseId,
      title: "5. Неопределённый интеграл",
      content: `
### Неопределённый интеграл

Неопределённый интеграл является операцией, обратной дифференцированию, и используется для нахождения функции по известной производной.

Неопределённым интегралом функции $f(x)$ называется совокупность всех её первообразных:

$$
\\int f(x)\\, dx = F(x) + C
$$

где $F'(x) = f(x)$, а $C$ — произвольная постоянная.

Для вычисления интегралов применяется таблица основных интегралов и правила интегрирования:
- линейность;
- замена переменной;
- интегрирование по частям.

Неопределённые интегралы широко применяются при решении дифференциальных уравнений и прикладных задач.
`,
      ord: 5,
    },

    {
      id: "lec-6",
      courseId,
      title: "6. Определённый интеграл",
      content: `
### Определённый интеграл

Определённый интеграл используется для вычисления численных характеристик и имеет наглядный геометрический смысл.

Определённый интеграл функции $f(x)$ на отрезке $[a, b]$ обозначается:

$$
\\int_a^b f(x)\\, dx
$$

Важнейшим результатом является **формула Ньютона–Лейбница**:

$$
\\int_a^b f(x)\\, dx = F(b) - F(a)
$$

где $F(x)$ — первообразная функции $f(x)$.

Определённые интегралы применяются для вычисления площадей, объёмов тел, работы силы и других физических величин.
`,
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
          meta: JSON.stringify({
            type: "numeric",
            answer: 4,
            topic: "lec-1",
            explanation:
              "Раскройте скобки в числителе: (x² - 4) = (x - 2)(x + 2). Сокращая на (x - 2), получаем (x + 2). При x → 2 результат равен 4.",
          }),
          ord: 1,
        },
        {
          id: "task-2",
          courseId,
          title: "Производная полинома",
          description: "Найдите f'(x) для f(x) = x² + 3x - 5",
          meta: JSON.stringify({
            type: "formula",
            answer: "2x + 3",
            topic: "lec-3",
            explanation:
              "Применяя правило дифференцирования по слагаемым: (x²)' = 2x, (3x)' = 3, (-5)' = 0. Итого: f'(x) = 2x + 3",
          }),
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
            topic: "lec-3",
            explanation:
              "Используйте правило произведения: (u·v)' = u'·v + u·v'. Здесь u = x, v = sin(x), поэтому f'(x) = 1·sin(x) + x·cos(x)",
          }),
          ord: 3,
        },
        {
          id: "task-4",
          courseId,
          title: "Интеграл полинома",
          description: "Найдите: ∫(3x² + 2x)dx",
          meta: JSON.stringify({
            type: "formula",
            answer: "x³ + x² + C",
            topic: "lec-5",
            explanation:
              "Интегрируйте каждое слагаемое отдельно: ∫3x²dx = x³, ∫2xdx = x², не забудьте константу интегрирования C",
          }),
          ord: 4,
        },
        {
          id: "task-5",
          courseId,
          title: "Интегрирование по частям",
          description: "Найдите: ∫x·eˣ dx",
          meta: JSON.stringify({
            type: "formula",
            answer: "eˣ(x - 1) + C",
            topic: "lec-5",
            explanation:
              "Используйте формулу интегрирования по частям: ∫u dv = uv - ∫v du. Пусть u = x, dv = eˣdx. Тогда du = dx, v = eˣ. Результат: x·eˣ - eˣ = eˣ(x - 1) + C",
          }),
          ord: 5,
        },
        {
          id: "task-6",
          courseId,
          title: "Предел при бесконечности",
          description: "Найдите lim[x→∞] (3x² + 2)/(x² - 5)",
          meta: JSON.stringify({
            type: "numeric",
            answer: 3,
            topic: "lec-1",
            explanation:
              "Разделите числитель и знаменатель на x² (старшую степень). Получаете (3 + 2/x²) / (1 - 5/x²). При x → ∞ дроби с x стремятся к 0, поэтому результат = 3/1 = 3",
          }),
          ord: 6,
        },
        {
          id: "task-7",
          courseId,
          title: "Односторонний предел",
          description: "Найдите lim[x→0+] 1/x",
          meta: JSON.stringify({
            type: "theory",
            answer: "+∞",
            topic: "lec-1",
            explanation:
              "При приближении x к 0 справа (x > 0), значение 1/x становится сколь угодно большим и положительным, поэтому предел равен +∞",
          }),
          ord: 7,
        },
        {
          id: "task-8",
          courseId,
          title: "Непрерывность функции",
          description: "Является ли f(x)=|x| непрерывной в 0?",
          meta: JSON.stringify({
            type: "theory",
            answer: "Да",
            topic: "lec-2",
            explanation:
              "Функция |x| непрерывна в точке 0, так как: 1) она определена в 0 (f(0)=0), 2) существует предел lim[x→0] |x| = 0, 3) предел равен значению функции",
          }),
          ord: 8,
        },
        {
          id: "task-9",
          courseId,
          title: "Производная синуса",
          description: "Найдите производную sin(x)",
          meta: JSON.stringify({
            type: "formula",
            answer: "cos(x)",
            topic: "lec-4",
            explanation:
              "По таблице производных: (sin x)' = cos x. Это одна из основных формул, которую нужно запомнить",
          }),
          ord: 9,
        },
        {
          id: "task-10",
          courseId,
          title: "Производная экспоненты",
          description: "Найдите производную e^x",
          meta: JSON.stringify({
            type: "formula",
            answer: "e^x",
            topic: "lec-4",
            explanation:
              "По таблице производных: (eˣ)' = eˣ. Экспонента — единственная функция, производная которой равна самой себе",
          }),
          ord: 10,
        },
        {
          id: "task-11",
          courseId,
          title: "Экстремум функции",
          description: "Найдите экстремумы f(x)=x²-4x",
          meta: JSON.stringify({
            type: "analysis",
            answer: "x=2 — минимум",
            topic: "lec-3",
            explanation:
              "Найдите f'(x) = 2x - 4. Приравняйте к нулю: 2x - 4 = 0 → x = 2. Проверьте вторую производную: f''(x) = 2 > 0, значит это минимум",
          }),
          ord: 11,
        },
        {
          id: "task-12",
          courseId,
          title: "Вторая производная",
          description: "Найдите f''(x), если f(x)=x³",
          meta: JSON.stringify({
            type: "formula",
            answer: "6x",
            topic: "lec-3",
            explanation:
              "Сначала найдите первую производную: f'(x) = 3x². Затем дифференцируйте ещё раз: f''(x) = 6x",
          }),
          ord: 12,
        },
        {
          id: "task-13",
          courseId,
          title: "Неопределённый интеграл",
          description: "∫x dx",
          meta: JSON.stringify({
            type: "formula",
            answer: "x²/2 + C",
            topic: "lec-5",
            explanation:
              "Используйте формулу: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C. Здесь n = 1, поэтому ∫x dx = x²/2 + C",
          }),
          ord: 13,
        },
        {
          id: "task-14",
          courseId,
          title: "Интеграл синуса",
          description: "∫sin(x) dx",
          meta: JSON.stringify({
            type: "formula",
            answer: "-cos(x) + C",
            topic: "lec-5",
            explanation:
              "По таблице интегралов: ∫sin x dx = -cos x + C. Обратите внимание на знак минус",
          }),
          ord: 14,
        },
        {
          id: "task-15",
          courseId,
          title: "Определённый интеграл",
          description: "∫[0,1] x dx",
          meta: JSON.stringify({
            type: "numeric",
            answer: 0.5,
            topic: "lec-6",
            explanation:
              "Используйте формулу Ньютона–Лейбница: ∫₀¹ x dx = [x²/2]₀¹ = 1²/2 - 0²/2 = 0.5",
          }),
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

function seedProgrammingCourse() {
  const courses = module.exports.getCourses()
  const courseId = "programming-js"
  const now = Date.now()

  const existing = courses.find((c) => c.id === courseId)
  const courseTitle = "JavaScript: основы программирования"
  const courseDescription =
    "Новый курс по программированию: базовый синтаксис, функции, условия, циклы и первые практические задания с кодом."
  const courseCategory = "Computer Science"

  // Важно: обновляем название/описание/категорию при каждом запуске
  try {
    db.prepare(
      `INSERT INTO courses (id, title, description, category, createdAt)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         description = excluded.description,
         category = excluded.category`,
    ).run(courseId, courseTitle, courseDescription, courseCategory, now)
  } catch (e) {}

  const existingTasks = module.exports.getTasks(courseId)
  const shouldSeedTasks = !existingTasks || existingTasks.length < 20

  const lectures = [
    {
      id: "prog-lec-1",
      courseId,
      title: "1. Переменные и типы данных",
      content: `
# Переменные и типы данных

В JavaScript переменная — это «коробка» с именем, в которой лежит значение.
Есть три способа объявить переменную:

- \`const\` — константа, ссылку переназначить нельзя (но если там объект, его поля менять можно)
- \`let\` — обычная переменная, значение можно менять
- \`var\` — старый способ, в современном коде почти не используем

### Когда использовать const и let

Простое правило:

- если вы не планируете переназначать переменную — используйте \`const\`
- если значение действительно меняется со временем — используйте \`let\`

Так код получается предсказуемее и легче для чтения:

\`\`\`js
const PI = 3.14
let counter = 0

counter = counter + 1
// PI = 3.15 // так делать нельзя — будет ошибка
\`\`\`

### Основные типы данных

В упрощённом варианте нам достаточно помнить про такие типы:

- числа (\`42\`, \`3.14\`)
- строки (\`"hello"\`)
- булевы значения (\`true\`, \`false\`)
- \`null\` и \`undefined\`
- объекты (\`{ name: "Ann" }\`)
- массивы (\`[1, 2, 3]\`)
- функции

Мы будем писать **чистые функции**: на входе параметры, на выходе — результат.
Функция не должна читать/писать глобальные переменные или обращаться к \`console.log\` для ответа.

### Пример: функция, которая возвращает тип

\`\`\`js
export function getType(value) {
  return typeof value
}
\`\`\`

В задачах этого курса вы будете комбинировать переменные и типы данных
внутри функций, которые проверяются автоматическими тестами.`,
      ord: 1,
    },
    {
      id: "prog-lec-2",
      courseId,
      title: "2. Условия и логика",
      content: `
# Условия и логика в JavaScript

Условие — это способ выполнить код только тогда, когда выполняется логическое выражение.

### if / else

Базовая конструкция:

\`\`\`js
if (condition) {
  // выполняется, если condition === true
} else {
  // выполняется, если condition === false
}
\`\`\`

Пример:

\`\`\`js
export function sign(n) {
  if (n > 0) {
    return "positive"
  } else if (n < 0) {
    return "negative"
  } else {
    return "zero"
  }
}
\`\`\`

### Сравнения и логические операторы

- строгое равенство: \`===\`
- строгое неравенство: \`!==\`
- \`<\`, \`>\`, \`<=\`, \`>=\`
- логическое И: \`&&\`
- логическое ИЛИ: \`||\`
- отрицание: \`!\`

Пример логического выражения:

\`\`\`js
const canVote = age >= 18 && isCitizen === true
\`\`\`

### Наш стиль задач

Во всех задачах по условиям:

- функция **получает параметры**
- внутри вы используете \`if / else\` и сравнения
- в конце **возвращаете результат**, а не печатаете его

Такой подход легко тестировать и переиспользовать.`,
      ord: 2,
    },
    {
      id: "prog-lec-3",
      courseId,
      title: "3. Циклы и массивы",
      content: `
# Циклы и массивы

Массив — это упорядоченный список значений:

\`\`\`js
const numbers = [10, 20, 30]
\`\`\`

Чаще всего нам нужно **пройтись по всем элементам** и что-то посчитать.

### Цикл for

\`\`\`js
export function sumArray(arr) {
  let sum = 0

  for (let i = 0; i < arr.length; i++) {
    sum = sum + arr[i]
  }

  return sum
}
\`\`\`

Здесь:

- \`i\` — индекс (0, 1, 2, ...)  
- \`arr[i]\` — текущий элемент

### Цикл for...of

Более удобен, когда индекс не важен:

\`\`\`js
export function countPositive(arr) {
  let count = 0

  for (const value of arr) {
    if (value > 0) {
      count++
    }
  }

  return count
}
\`\`\`

### Что важно для задач

- не мутируйте входной массив, если это явно не требуется;
- возвращайте новый массив или число/строку;
- аккуратно обрабатывайте пустой массив (\`[]\`).`,
      ord: 3,
    },
    {
      id: "prog-lec-4",
      courseId,
      title: "4. Функции",
      content: `
# Функции в задачах

Функция — это переиспользуемый блок кода с именем, входами и выходом.

### Объявление функции

\`\`\`js
export function sum(a, b) {
  return a + b
}
\`\`\`

Ключевые моменты:

- \`export\` нужен, чтобы тесты могли импортировать функцию;
- внутри функции **нужно вернуть** результат через \`return\`.

### Именование

Название должно отражать смысл:

- \`getMax\`, \`isEven\`, \`formatUserName\`
- избегайте имён вроде \`f1\`, \`foo\`, \`test\`

### Побочные эффекты

В задачах из этого курса мы пишем **чистые функции**:

- не используем \`console.log\` для ответа;
- не читаем глобальные переменные;
- не модифицируем аргументы (например, не сортируем массив \"на месте\" без необходимости).

Такой стиль делает поведение предсказуемым и упрощает проверку решений.`,
      ord: 4,
    },
    {
      id: "prog-lec-5",
      courseId,
      title: "5. Строки",
      content: `
# Строки в JavaScript

Строка — это последовательность символов:

\`\`\`js
const name = "Anna"
\`\`\`

### Полезные операции

- \`length\` — длина строки
- \`toLowerCase()\`, \`toUpperCase()\` — смена регистра
- \`trim()\` — убрать пробелы по краям
- \`includes(sub)\` — содержит ли строка подстроку
- \`slice(start, end)\` — вырезать подстроку
- \`split(separator)\` — разбить строку на массив
- \`join(separator)\` — собрать массив в строку

Пример задачи: посчитать количество слов в строке:

\`\`\`js
export function countWords(text) {
  if (!text.trim()) return 0

  const parts = text.trim().split(/\\s+/)
  return parts.length
}
\`\`\`

В задачах со строками мы часто:

- нормализуем регистр (\`toLowerCase()\`)
- убираем лишние пробелы (\`trim()\`)
- разбиваем строку на части и что-то считаем.`,
      ord: 5,
    },
    {
      id: "prog-lec-6",
      courseId,
      title: "6. Объекты и структуры данных",
      content: `
# Объекты и структуры данных

Объект хранит пары ключ–значение:

\`\`\`js
const user = { name: "Ann", age: 18 }
\`\`\`

Обратиться к полю можно через точку:

\`\`\`js
user.name // "Ann"
user.age  // 18
\`\`\`

### Когда использовать объекты

Когда у сущности есть несколько связанных свойств:

- пользователь: \`{ id, name, isAdmin }\`
- задача: \`{ id, title, isCompleted }\`

Функция может принимать объект и возвращать новый, не мутируя исходный:

\`\`\`js
export function toggleCompleted(task) {
  return {
    ...task,
    isCompleted: !task.isCompleted,
  }
}
\`\`\`

### Массивы объектов

Очень частый случай — массив пользователей/задач:

\`\`\`js
const tasks = [
  { id: 1, title: "A", isCompleted: false },
  { id: 2, title: "B", isCompleted: true },
]
\`\`\`

В задачах мы будем:

- фильтровать массивы по условию,
- искать элементы по полю (\`id\`),
- аккуратно собирать новые объекты, не ломая исходные данные.`,
      ord: 6,
    },
  ]
  lectures.forEach((l) => {
    try {
      module.exports.createLecture(l)
    } catch (e) {}
  })

  const tasks = [
    {
      id: "prog-task-1",
      courseId,
      title: "Hello, name!",
      description:
        "Напишите функцию greet(name), которая возвращает строку: Hello, <name>!",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Easy",
        topic: "prog-lec-1",
        starterCode: "export function greet(name) {\n  // верните строку\n}\n",
        tests: [
          { name: "greet('Ann')", expected: "Hello, Ann!" },
          { name: "greet('Bob')", expected: "Hello, Bob!" },
        ],
      }),
      ord: 1,
    },
    {
      id: "prog-task-2",
      courseId,
      title: "Сумма двух чисел",
      description:
        "Напишите функцию sum(a, b), которая возвращает сумму a + b.",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Easy",
        topic: "prog-lec-1",
        starterCode: "export function sum(a, b) {\n  // TODO\n}\n",
        tests: [
          { name: "sum(1, 2)", expected: 3 },
          { name: "sum(-5, 10)", expected: 5 },
        ],
      }),
      ord: 2,
    },
    {
      id: "prog-task-3",
      courseId,
      title: "Чётное или нечётное",
      description:
        "Напишите функцию isEven(n), которая возвращает true, если n чётное, иначе false.",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Easy",
        topic: "prog-lec-2",
        starterCode: "export function isEven(n) {\n  // TODO\n}\n",
        tests: [
          { name: "isEven(2)", expected: true },
          { name: "isEven(7)", expected: false },
        ],
      }),
      ord: 3,
    },
    {
      id: "prog-task-4",
      courseId,
      title: "Максимум из двух",
      description:
        "Напишите функцию max2(a, b), которая возвращает большее из двух чисел.",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Medium",
        topic: "prog-lec-2",
        starterCode: "export function max2(a, b) {\n  // TODO\n}\n",
        tests: [
          { name: "max2(1, 2)", expected: 2 },
          { name: "max2(10, -1)", expected: 10 },
        ],
      }),
      ord: 4,
    },
    {
      id: "prog-task-5",
      courseId,
      title: "Сумма массива",
      description:
        "Напишите функцию sumArray(arr), которая возвращает сумму всех элементов массива.",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Medium",
        topic: "prog-lec-3",
        starterCode: "export function sumArray(arr) {\n  // TODO\n}\n",
        tests: [
          { name: "sumArray([1,2,3])", expected: 6 },
          { name: "sumArray([])", expected: 0 },
        ],
      }),
      ord: 5,
    },
    {
      id: "prog-task-6",
      courseId,
      title: "Количество положительных",
      description:
        "Напишите функцию countPositive(arr), которая считает, сколько чисел > 0 в массиве.",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Hard",
        topic: "prog-lec-3",
        starterCode: "export function countPositive(arr) {\n  // TODO\n}\n",
        tests: [
          { name: "countPositive([1,-2,3,0])", expected: 2 },
          { name: "countPositive([-1,-2])", expected: 0 },
        ],
      }),
      ord: 6,
    },
    {
      id: "prog-task-7",
      courseId,
      title: "Остаток от деления",
      description:
        "Напишите функцию remainder(a, b), которая возвращает остаток от деления a на b (оператор %).",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Easy",
        topic: "prog-lec-1",
        starterCode: "export function remainder(a, b) {\n  // TODO\n}\n",
        tests: [
          { name: "remainder(10, 3)", expected: 1 },
          { name: "remainder(20, 5)", expected: 0 },
        ],
      }),
      ord: 7,
    },
    {
      id: "prog-task-8",
      courseId,
      title: "Кламп (ограничение диапазоном)",
      description:
        "Напишите функцию clamp(n, min, max), которая ограничивает число n диапазоном [min, max].",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Medium",
        topic: "prog-lec-2",
        starterCode:
          "export function clamp(n, min, max) {\n  // если n меньше min -> min\n  // если n больше max -> max\n  // иначе -> n\n}\n",
        tests: [
          { name: "clamp(5, 1, 10)", expected: 5 },
          { name: "clamp(-2, 0, 10)", expected: 0 },
          { name: "clamp(999, 0, 10)", expected: 10 },
        ],
      }),
      ord: 8,
    },
    {
      id: "prog-task-9",
      courseId,
      title: "Факториал",
      description:
        "Напишите функцию factorial(n), которая возвращает n! (0! = 1). Считайте, что n — целое число >= 0.",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Medium",
        topic: "prog-lec-4",
        starterCode: "export function factorial(n) {\n  // TODO\n}\n",
        tests: [
          { name: "factorial(0)", expected: 1 },
          { name: "factorial(1)", expected: 1 },
          { name: "factorial(5)", expected: 120 },
        ],
      }),
      ord: 9,
    },
    {
      id: "prog-task-10",
      courseId,
      title: "Число Фибоначчи",
      description:
        "Напишите функцию fib(n), которая возвращает n-е число Фибоначчи (fib(0)=0, fib(1)=1).",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Hard",
        topic: "prog-lec-4",
        starterCode: "export function fib(n) {\n  // TODO\n}\n",
        tests: [
          { name: "fib(0)", expected: 0 },
          { name: "fib(1)", expected: 1 },
          { name: "fib(7)", expected: 13 },
        ],
      }),
      ord: 10,
    },
    {
      id: "prog-task-11",
      courseId,
      title: "Разворот строки",
      description:
        "Напишите функцию reverseString(s), которая возвращает строку s в обратном порядке.",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Easy",
        topic: "prog-lec-5",
        starterCode: "export function reverseString(s) {\n  // TODO\n}\n",
        tests: [
          { name: "reverseString('abc')", expected: "cba" },
          { name: "reverseString('')", expected: "" },
        ],
      }),
      ord: 11,
    },
    {
      id: "prog-task-12",
      courseId,
      title: "Палиндром",
      description:
        "Напишите функцию isPalindrome(s), которая возвращает true, если строка s читается одинаково слева направо и справа налево.",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Medium",
        topic: "prog-lec-5",
        starterCode: "export function isPalindrome(s) {\n  // TODO\n}\n",
        tests: [
          { name: "isPalindrome('level')", expected: true },
          { name: "isPalindrome('test')", expected: false },
        ],
      }),
      ord: 12,
    },
    {
      id: "prog-task-13",
      courseId,
      title: "Подсчёт гласных",
      description:
        "Напишите функцию countVowels(s), которая возвращает количество гласных (a, e, i, o, u) в строке. Регистр не важен.",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Medium",
        topic: "prog-lec-5",
        starterCode: "export function countVowels(s) {\n  // TODO\n}\n",
        tests: [
          { name: "countVowels('Hello')", expected: 2 },
          { name: "countVowels('xyz')", expected: 0 },
        ],
      }),
      ord: 13,
    },
    {
      id: "prog-task-14",
      courseId,
      title: "Максимум в массиве",
      description:
        "Напишите функцию maxInArray(arr), которая возвращает максимальный элемент массива. Если массив пустой — верните null.",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Easy",
        topic: "prog-lec-3",
        starterCode: "export function maxInArray(arr) {\n  // TODO\n}\n",
        tests: [
          { name: "maxInArray([1, 7, 3])", expected: 7 },
          { name: "maxInArray([])", expected: null },
        ],
      }),
      ord: 14,
    },
    {
      id: "prog-task-15",
      courseId,
      title: "Уникальные элементы",
      description:
        "Напишите функцию unique(arr), которая возвращает новый массив без повторов, сохраняя порядок первого появления элементов.",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Medium",
        topic: "prog-lec-3",
        starterCode: "export function unique(arr) {\n  // TODO\n}\n",
        tests: [
          { name: "unique([1,1,2,2,3])", expected: [1, 2, 3] },
          { name: "unique([])", expected: [] },
        ],
      }),
      ord: 15,
    },
    {
      id: "prog-task-16",
      courseId,
      title: "Плоский массив (на 1 уровень)",
      description:
        "Напишите функцию flatten1(arr), которая разворачивает массив на один уровень: [1,[2,3],[4]] -> [1,2,3,4].",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Hard",
        topic: "prog-lec-3",
        starterCode: "export function flatten1(arr) {\n  // TODO\n}\n",
        tests: [
          { name: "flatten1([1,[2,3],[4]])", expected: [1, 2, 3, 4] },
          { name: "flatten1([])", expected: [] },
        ],
      }),
      ord: 16,
    },
    {
      id: "prog-task-17",
      courseId,
      title: "Подсчёт частоты",
      description:
        "Напишите функцию freq(arr), которая возвращает объект частот: например ['a','b','a'] -> { a: 2, b: 1 }.",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Hard",
        topic: "prog-lec-6",
        starterCode: "export function freq(arr) {\n  // TODO\n}\n",
        tests: [
          { name: "freq(['a','b','a'])", expected: { a: 2, b: 1 } },
          { name: "freq([])", expected: {} },
        ],
      }),
      ord: 17,
    },
    {
      id: "prog-task-18",
      courseId,
      title: "Группировка по чётности",
      description:
        "Напишите функцию groupByParity(arr), которая возвращает объект вида { even: [...], odd: [...] }.",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Hard",
        topic: "prog-lec-6",
        starterCode: "export function groupByParity(arr) {\n  // TODO\n}\n",
        tests: [
          {
            name: "groupByParity([1,2,3,4])",
            expected: { even: [2, 4], odd: [1, 3] },
          },
          { name: "groupByParity([])", expected: { even: [], odd: [] } },
        ],
      }),
      ord: 18,
    },
    {
      id: "prog-task-19",
      courseId,
      title: "Разбиение на чанки",
      description:
        "Напишите функцию chunk(arr, size), которая разбивает массив на подмассивы длины size (последний может быть короче).",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Hard",
        topic: "prog-lec-3",
        starterCode: "export function chunk(arr, size) {\n  // TODO\n}\n",
        tests: [
          { name: "chunk([1,2,3,4,5], 2)", expected: [[1, 2], [3, 4], [5]] },
          { name: "chunk([], 3)", expected: [] },
        ],
      }),
      ord: 19,
    },
    {
      id: "prog-task-20",
      courseId,
      title: "Title Case",
      description:
        "Напишите функцию toTitleCase(s), которая делает первую букву каждого слова заглавной. Считайте, что слова разделены одним пробелом.",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Medium",
        topic: "prog-lec-5",
        starterCode: "export function toTitleCase(s) {\n  // TODO\n}\n",
        tests: [
          { name: "toTitleCase('hello world')", expected: "Hello World" },
          { name: "toTitleCase('javaScript')", expected: "JavaScript" },
        ],
      }),
      ord: 20,
    },
    {
      id: "prog-task-21",
      courseId,
      title: "Title Case",
      description:
        "Напишите функцию toTitleCase(s), которая делает первую букву каждого слова заглавной. Считайте, что слова разделены одним пробелом.",
      meta: JSON.stringify({
        type: "code",
        language: "javascript",
        difficulty: "Medium",
        topic: "prog-lec-5",
        starterCode: "export function toTitleCase(s) {\n  // TODO\n}\n",
        tests: [
          { name: "toTitleCase('hello world')", expected: "Hello World" },
          { name: "toTitleCase('javaScript')", expected: "JavaScript" },
        ],
      }),
      ord: 21,
    },
  ]

  if (shouldSeedTasks) {
    tasks.forEach((t) => {
      try {
        module.exports.createTask(t)
      } catch (e) {}
    })
  }
}

function resolveLectureQuizTopic(courseCategory, lectureTitle) {
  const t = String(lectureTitle || "").toLowerCase()
  if (courseCategory === "Mathematics") {
    if (t.includes("предел")) return "math_limits"
    if (t.includes("непрерыв")) return "math_continuity"
    if (t.includes("производ")) return "math_derivatives"
    if (t.includes("интеграл")) return "math_integrals"
    if (t.includes("дифф")) return "math_diff_eq"
    return "math_general"
  }

  // Computer Science / programming
  if (t.includes("переменн") || t.includes("тип")) return "cs_variables"
  if (t.includes("услов") || t.includes("логик")) return "cs_conditions"
  if (t.includes("цикл") || t.includes("массив")) return "cs_loops_arrays"
  if (t.includes("функц")) return "cs_functions"
  if (t.includes("строк")) return "cs_strings"
  if (t.includes("объект") || t.includes("структур")) return "cs_objects"
  return "cs_general"
}

function getQuizBank(topicKey) {
  /** @type {{text:string, options:string[], correctIndex:number}[]} */
  const banks = {
    math_limits: [
      {
        text: "Что означает запись lim_{x→x0} f(x) = L?",
        options: [
          "f(x0) = L",
          "f(x) определена только в x0",
          "f(x) стремится к L при x, стремящемся к x0",
          "f(x) всегда равна L",
          "Предел существует только слева",
        ],
        correctIndex: 2,
      },
      {
        text: "Как называется формальное определение предела через ε и δ?",
        options: [
          "Индуктивное",
          "Тригонометрическое",
          "Эпсилон-дельта определение",
          "Определение Коши-Буняковского",
          "Определение Лагранжа",
        ],
        correctIndex: 2,
      },
      {
        text: "Предел функции в точке единственен?",
        options: [
          "Нет",
          "Да",
          "Только для полиномов",
          "Только справа",
          "Только слева",
        ],
        correctIndex: 1,
      },
      {
        text: "Если lim f(x)=A и lim g(x)=B, то lim (f+g) равен:",
        options: ["A·B", "A/B", "A+B", "A−B", "B−A"],
        correctIndex: 2,
      },
      {
        text: "Односторонний предел — это предел:",
        options: [
          "При x→∞",
          "Только при x→0",
          "При приближении к точке с одной стороны",
          "Только для непрерывных функций",
          "Только для рациональных функций",
        ],
        correctIndex: 2,
      },
      {
        text: "Если предел не зависит от пути приближения, то он:",
        options: [
          "Не существует",
          "Существует (при условии существования односторонних)",
          "Всегда равен 0",
          "Всегда равен 1",
          "Зависит от производной",
        ],
        correctIndex: 1,
      },
      {
        text: "Предел произведения двух функций равен:",
        options: ["A+B", "A−B", "A·B", "A/B", "B/A"],
        correctIndex: 2,
      },
      {
        text: "Если f(x)=c (константа), то lim f(x) равен:",
        options: ["0", "1", "c", "∞", "Не существует"],
        correctIndex: 2,
      },
      {
        text: "Предел частного f(x)/g(x) равен A/B при условии:",
        options: ["A=0", "B=0", "B≠0", "A=B", "g(x) линейна"],
        correctIndex: 2,
      },
      {
        text: "Что из ниже перечисленного является свойством пределов?",
        options: [
          "Предел всегда равен значению функции",
          "Предел всегда бесконечен",
          "Линейность (предел суммы равен сумме пределов)",
          "Предел существует только у непрерывных",
          "Предел существует только у дифференцируемых",
        ],
        correctIndex: 2,
      },
    ],
    math_continuity: [
      {
        text: "Функция непрерывна в точке x0, если:",
        options: [
          "Существует производная в x0",
          "f(x0) не определена",
          "lim_{x→x0} f(x) = f(x0)",
          "lim_{x→x0} f(x) = 0",
          "f(x) монотонна",
        ],
        correctIndex: 2,
      },
      {
        text: "Разрыв первого рода — это когда существуют:",
        options: [
          "Только производные",
          "Только интегралы",
          "Оба односторонних предела конечны",
          "Предел всегда бесконечен",
          "Нет односторонних пределов",
        ],
        correctIndex: 2,
      },
      {
        text: "Если функция непрерывна на [a,b], то она:",
        options: [
          "Обязательно линейна",
          "Достигает максимума и минимума",
          "Не имеет корней",
          "Всегда возрастает",
          "Всегда убывает",
        ],
        correctIndex: 1,
      },
      {
        text: "Теорема Больцано–Коши говорит о:",
        options: [
          "Существовании производной",
          "Существовании корня при смене знака",
          "Сходимости ряда",
          "Площадях фигур",
          "Сходимости интеграла",
        ],
        correctIndex: 1,
      },
      {
        text: "Непрерывность суммы непрерывных функций:",
        options: [
          "Не гарантируется",
          "Гарантируется",
          "Только если обе дифференцируемы",
          "Только для полиномов",
          "Только если сумма равна 0",
        ],
        correctIndex: 1,
      },
      {
        text: "Непрерывность произведения непрерывных функций:",
        options: [
          "Нет",
          "Да",
          "Только на (a,b)",
          "Только в 0",
          "Только при A=B",
        ],
        correctIndex: 1,
      },
      {
        text: "Функция может быть непрерывной и не дифференцируемой?",
        options: [
          "Нет",
          "Да",
          "Только если константа",
          "Только если линейна",
          "Никогда",
        ],
        correctIndex: 1,
      },
      {
        text: "Если в точке разрыв, то обязательно:",
        options: [
          "Нет предела",
          "Предел бесконечен",
          "График скачет",
          "Нарушено равенство lim f(x)=f(x0)",
          "f(x0)=0",
        ],
        correctIndex: 3,
      },
      {
        text: "Непрерывность в точке требует, чтобы функция была определена:",
        options: [
          "Везде",
          "В этой точке",
          "Только слева",
          "Только справа",
          "Только на (a,b)",
        ],
        correctIndex: 1,
      },
      {
        text: "Кусочно-заданная функция может быть непрерывной?",
        options: [
          "Нет",
          "Да, при согласовании на стыках",
          "Только если без кусочков",
          "Только если тригонометрическая",
          "Только если полином",
        ],
        correctIndex: 1,
      },
    ],
    math_derivatives: [
      {
        text: "Производная — это:",
        options: [
          "Площадь под графиком",
          "Предел отношения приращений",
          "Значение функции",
          "Корень уравнения",
          "Интеграл функции",
        ],
        correctIndex: 1,
      },
      {
        text: "Производная константы равна:",
        options: ["0", "1", "c", "∞", "Не существует"],
        correctIndex: 0,
      },
      {
        text: "Производная x^n равна:",
        options: ["n·x^(n-1)", "x^(n+1)", "n·x^n", "x^n/n", "0"],
        correctIndex: 0,
      },
      {
        text: "Производная суммы равна:",
        options: [
          "Сумме производных",
          "Произведению производных",
          "Частному производных",
          "Нулю",
          "Всегда 1",
        ],
        correctIndex: 0,
      },
      {
        text: "Геометрический смысл производной:",
        options: [
          "Длина дуги",
          "Тангенс угла наклона касательной",
          "Площадь",
          "Объём",
          "Сумма углов",
        ],
        correctIndex: 1,
      },
      {
        text: "Правило произведения (f·g)' равно:",
        options: ["f'·g'", "f'·g + f·g'", "(f+g)'", "f'/g'", "f·g"],
        correctIndex: 1,
      },
      {
        text: "Правило частного (f/g)' равно:",
        options: [
          "(f'·g - f·g')/g^2",
          "(f'·g + f·g')/g^2",
          "f'/g'",
          "f/g",
          "g/f",
        ],
        correctIndex: 0,
      },
      {
        text: "Производная sin(x) равна:",
        options: ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)", "1"],
        correctIndex: 0,
      },
      {
        text: "Производная cos(x) равна:",
        options: ["sin(x)", "-sin(x)", "cos(x)", "-cos(x)", "0"],
        correctIndex: 1,
      },
      {
        text: "Если f'(x0) > 0, то в окрестности x0 функция:",
        options: [
          "Убывает",
          "Возрастает",
          "Постоянна",
          "Не определена",
          "Всегда равна 0",
        ],
        correctIndex: 1,
      },
    ],
    math_integrals: [
      {
        text: "Неопределённый интеграл — это:",
        options: [
          "Производная функции",
          "Множество первообразных",
          "Предел последовательности",
          "Корень уравнения",
          "Значение функции в точке",
        ],
        correctIndex: 1,
      },
      {
        text: "Производная первообразной F(x) равна:",
        options: ["F(x)", "f(x)", "0", "1", "∞"],
        correctIndex: 1,
      },
      {
        text: "Формула Ньютона–Лейбница относится к:",
        options: [
          "Производным",
          "Определённым интегралам",
          "Пределам",
          "Рядам",
          "Матрицам",
        ],
        correctIndex: 1,
      },
      {
        text: "Определённый интеграл геометрически — это:",
        options: [
          "Угол наклона",
          "Площадь под графиком (с учётом знака)",
          "Длина касательной",
          "Высота",
          "Скорость",
        ],
        correctIndex: 1,
      },
      {
        text: "Интеграл суммы равен:",
        options: [
          "Сумме интегралов",
          "Произведению интегралов",
          "Частному интегралов",
          "0",
          "1",
        ],
        correctIndex: 0,
      },
      {
        text: "Интеграл константы c равен:",
        options: ["c", "c·x + C", "x + C", "0", "1"],
        correctIndex: 1,
      },
      {
        text: "Интеграл x^n (n≠-1) равен:",
        options: [
          "x^(n-1)",
          "x^(n+1)/(n+1) + C",
          "n·x^(n-1)",
          "ln x + C",
          "1/x + C",
        ],
        correctIndex: 1,
      },
      {
        text: "∫ 1/x dx равен:",
        options: ["x", "ln|x| + C", "1/x", "x^2/2", "e^x"],
        correctIndex: 1,
      },
      {
        text: "Замена переменной применяется, чтобы:",
        options: [
          "Усложнить интеграл",
          "Упростить интеграл",
          "Сделать предел",
          "Сделать производную",
          "Найти корни",
        ],
        correctIndex: 1,
      },
      {
        text: "Интегрирование по частям основано на формуле:",
        options: ["(u+v)'", "(u·v)'", "sin^2+cos^2", "a^2+b^2=c^2", "lim"],
        correctIndex: 1,
      },
    ],
    math_diff_eq: [
      {
        text: "Дифференциальное уравнение содержит:",
        options: [
          "Интегралы",
          "Производные",
          "Только числа",
          "Только константы",
          "Только матрицы",
        ],
        correctIndex: 1,
      },
      {
        text: "Уравнение вида y' = f(x) является:",
        options: [
          "Линейным 2-го порядка",
          "Уравнением с разделяющимися переменными",
          "Тригонометрическим",
          "Алгебраическим",
          "Не имеет решения",
        ],
        correctIndex: 1,
      },
      {
        text: "Общее решение обычно содержит:",
        options: [
          "Только x",
          "Константу(ы) интегрирования",
          "Только y",
          "Только числа",
          "Только пределы",
        ],
        correctIndex: 1,
      },
      {
        text: "Начальная задача задаёт:",
        options: [
          "Лекции",
          "Начальные условия",
          "Предел",
          "Интеграл",
          "Матрицу",
        ],
        correctIndex: 1,
      },
      {
        text: "Уравнение y' = ky имеет решения вида:",
        options: ["sin(x)", "e^{kx}", "x^2", "ln(x)", "1/x"],
        correctIndex: 1,
      },
      {
        text: "Линейное ДУ 1-го порядка имеет вид:",
        options: [
          "y' + p(x)y = q(x)",
          "y'' + y = 0",
          "y^2 = x",
          "sin(y)=x",
          "y' = y^2",
        ],
        correctIndex: 0,
      },
      {
        text: "Метод разделения переменных применим, когда:",
        options: [
          "Нельзя разделить",
          "Можно представить y' = f(x)g(y)",
          "Уравнение второго порядка",
          "Есть матрицы",
          "Есть интегралы",
        ],
        correctIndex: 1,
      },
      {
        text: "Частное решение получается после:",
        options: [
          "Дифференцирования",
          "Подстановки начальных условий",
          "Предела",
          "Суммирования",
          "Линеаризации",
        ],
        correctIndex: 1,
      },
      {
        text: "Порядок ДУ — это порядок максимальной производной:",
        options: [
          "Нет",
          "Да",
          "Иногда",
          "Только для линейных",
          "Только для нелинейных",
        ],
        correctIndex: 1,
      },
      {
        text: "Решение ДУ проверяют:",
        options: [
          "По графику",
          "Подстановкой в уравнение",
          "Только численно",
          "Только по таблице",
          "Никак",
        ],
        correctIndex: 1,
      },
    ],
    math_general: [],
    cs_variables: [
      {
        text: "Какой способ объявления переменной нельзя переназначить?",
        options: ["var", "let", "const", "define", "static"],
        correctIndex: 2,
      },
      {
        text: "Какое сравнение является строгим в JS?",
        options: ["==", "=", "===", "<>", "equals()"],
        correctIndex: 2,
      },
      {
        text: "Тип данных для 'hello' — это:",
        options: ["number", "string", "boolean", "object", "undefined"],
        correctIndex: 1,
      },
      {
        text: "Что вернёт typeof null?",
        options: ["null", "undefined", "object", "number", "string"],
        correctIndex: 2,
      },
      {
        text: "Какое значение означает “нет значения” (по смыслу) чаще всего?",
        options: ["0", "''", "null", "NaN", "false"],
        correctIndex: 2,
      },
      {
        text: "Как преобразовать строку в число (самый простой способ)?",
        options: ["toString()", "Number(x)", "String(x)", "x++", "Boolean(x)"],
        correctIndex: 1,
      },
      {
        text: "Какая область видимости у let?",
        options: [
          "Функциональная",
          "Блочная",
          "Глобальная всегда",
          "Только модульная",
          "Нет области",
        ],
        correctIndex: 1,
      },
      {
        text: "Какая конструкция создаёт константу?",
        options: ["var x", "let x", "const x", "x := ", "final x"],
        correctIndex: 2,
      },
      {
        text: "Что такое NaN?",
        options: ["Число 0", "Не число", "Бесконечность", "Строка", "Объект"],
        correctIndex: 1,
      },
      {
        text: "Какая запись объявляет переменную x со значением 5?",
        options: ["x == 5", "let x = 5", "let x == 5", "x := 5", "define x 5"],
        correctIndex: 1,
      },
    ],
    cs_conditions: [
      {
        text: "Конструкция ветвления в JS:",
        options: ["for", "if/else", "switch только", "while", "map"],
        correctIndex: 1,
      },
      {
        text: "Логическое И — это оператор:",
        options: ["||", "&&", "!", "??", "**"],
        correctIndex: 1,
      },
      {
        text: "Логическое ИЛИ — это оператор:",
        options: ["||", "&&", "!", "??", "%"],
        correctIndex: 0,
      },
      {
        text: "Оператор отрицания:",
        options: ["~", "!", "not", "&&", "||"],
        correctIndex: 1,
      },
      {
        text: "Что вернёт (5 > 3)?",
        options: ["true", "false", "5", "3", "undefined"],
        correctIndex: 0,
      },
      {
        text: "Тернарный оператор выглядит как:",
        options: ["a ?? b", "a ? b : c", "a && b", "a || b", "a -> b"],
        correctIndex: 1,
      },
      {
        text: "Что выполнится, если условие истинно?",
        options: [
          "Только else",
          "Только if-блок",
          "Ничего",
          "Всегда оба",
          "Только switch",
        ],
        correctIndex: 1,
      },
      {
        text: "Для нескольких ветвей часто используют:",
        options: ["if/else if/else", "for", "map", "filter", "reduce"],
        correctIndex: 0,
      },
      {
        text: "Строгое неравенство:",
        options: ["!=", "!==", "==", "=", "<>"],
        correctIndex: 1,
      },
      {
        text: "switch сравнивает значение с case с помощью:",
        options: ["==", "===", "!=", "<", ">"],
        correctIndex: 1,
      },
    ],
    cs_loops_arrays: [
      {
        text: "Массив в JS создаётся как:",
        options: ["{}", "[]", "()", "<>", "array()"],
        correctIndex: 1,
      },
      {
        text: "Цикл for...of удобен для:",
        options: [
          "Объектов",
          "Массивов/итераторов",
          "Чисел",
          "Строк только",
          "Функций",
        ],
        correctIndex: 1,
      },
      {
        text: "Длина массива хранится в свойстве:",
        options: ["size", "count", "length", "len", "total"],
        correctIndex: 2,
      },
      {
        text: "Добавить элемент в конец массива:",
        options: ["push", "pop", "shift", "unshift", "slice"],
        correctIndex: 0,
      },
      {
        text: "Удалить элемент с конца массива:",
        options: ["push", "pop", "shift", "unshift", "join"],
        correctIndex: 1,
      },
      {
        text: "Цикл while выполняется пока условие:",
        options: ["Ложно", "Истинно", "Равно 0", "Равно 1", "Не определено"],
        correctIndex: 1,
      },
      {
        text: "Метод map возвращает:",
        options: ["Один элемент", "Новый массив", "Ничего", "Объект", "Строку"],
        correctIndex: 1,
      },
      {
        text: "Метод filter возвращает элементы, которые:",
        options: [
          "Всегда первые",
          "Прошли условие",
          "Не прошли условие",
          "Отсортированы",
          "Уникальны",
        ],
        correctIndex: 1,
      },
      {
        text: "break в цикле делает:",
        options: [
          "Продолжает",
          "Выходит из цикла",
          "Пропускает итерацию",
          "Останавливает программу",
          "Ничего",
        ],
        correctIndex: 1,
      },
      {
        text: "continue в цикле делает:",
        options: [
          "Выходит из цикла",
          "Пропускает итерацию",
          "Перезапускает программу",
          "Удаляет массив",
          "Ничего",
        ],
        correctIndex: 1,
      },
    ],
    cs_functions: [
      {
        text: "Функция в JS объявляется как:",
        options: ["func x()", "function x()", "def x()", "fn x()", "lambda x"],
        correctIndex: 1,
      },
      {
        text: "Что делает return?",
        options: [
          "Выводит в консоль",
          "Возвращает значение и завершает функцию",
          "Создаёт переменную",
          "Создаёт цикл",
          "Ничего",
        ],
        correctIndex: 1,
      },
      {
        text: "Параметры функции — это:",
        options: [
          "Возвращаемое значение",
          "Входные значения",
          "Циклы",
          "Типы",
          "Модули",
        ],
        correctIndex: 1,
      },
      {
        text: "Аргументы — это:",
        options: [
          "Что функция принимает при вызове",
          "Что функция возвращает",
          "Переменные внутри",
          "Ошибки",
          "Классы",
        ],
        correctIndex: 0,
      },
      {
        text: "Стрелочная функция выглядит как:",
        options: [
          "(a,b) => a+b",
          "function =>",
          "=> function()",
          "a -> b",
          "lambda a",
        ],
        correctIndex: 0,
      },
      {
        text: "Замыкание — это когда функция:",
        options: [
          "Не имеет тела",
          "Запоминает внешние переменные",
          "Всегда возвращает 0",
          "Всегда асинхронная",
          "Всегда рекурсивная",
        ],
        correctIndex: 1,
      },
      {
        text: "Рекурсия — это:",
        options: [
          "Цикл for",
          "Вызов функции самой себя",
          "Вызов console.log",
          "Сортировка",
          "Фильтрация",
        ],
        correctIndex: 1,
      },
      {
        text: "Функция может возвращать:",
        options: [
          "Только число",
          "Только строку",
          "Любой тип",
          "Только массив",
          "Только объект",
        ],
        correctIndex: 2,
      },
      {
        text: "export function ... используется для:",
        options: [
          "Удаления функции",
          "Импорта",
          "Экспорта из модуля",
          "Создания класса",
          "Создания массива",
        ],
        correctIndex: 2,
      },
      {
        text: "Если нет return, функция возвращает:",
        options: ["0", "null", "undefined", "false", "''"],
        correctIndex: 2,
      },
    ],
    cs_strings: [
      {
        text: "Длина строки доступна через:",
        options: ["size", "len", "length", "count", "total"],
        correctIndex: 2,
      },
      {
        text: "toLowerCase() делает строку:",
        options: [
          "Верхним регистром",
          "Нижним регистром",
          "Без пробелов",
          "Числом",
          "Массивом",
        ],
        correctIndex: 1,
      },
      {
        text: "split() возвращает:",
        options: ["Число", "Массив", "Объект", "Функцию", "Boolean"],
        correctIndex: 1,
      },
      {
        text: "join() объединяет:",
        options: [
          "Строки в число",
          "Массив в строку",
          "Число в строку",
          "Объект в массив",
          "Функции",
        ],
        correctIndex: 1,
      },
      {
        text: "slice() используется для:",
        options: [
          "Добавления",
          "Вырезания подстроки",
          "Сортировки",
          "Сравнения",
          "Перевода в число",
        ],
        correctIndex: 1,
      },
      {
        text: "Конкатенация строк — это:",
        options: [
          "Умножение",
          "Сложение/склейка",
          "Деление",
          "Сравнение",
          "Предел",
        ],
        correctIndex: 1,
      },
      {
        text: "Шаблонные строки используют:",
        options: ["' '", '" "', "` `", "( )", "{ }"],
        correctIndex: 2,
      },
      {
        text: "Интерполяция в шаблонных строках:",
        options: ["${expr}", "#{expr}", "@{expr}", "<expr>", "(expr)"],
        correctIndex: 0,
      },
      {
        text: "includes(sub) проверяет:",
        options: [
          "Равенство",
          "Содержит ли строка подстроку",
          "Длину",
          "Регистр",
          "Пробелы",
        ],
        correctIndex: 1,
      },
      {
        text: "trim() делает что?",
        options: [
          "Удаляет пробелы по краям",
          "Добавляет пробелы",
          "Меняет регистр",
          "Делает массив",
          "Делает число",
        ],
        correctIndex: 0,
      },
    ],
    cs_objects: [
      {
        text: "Объект в JS создаётся как:",
        options: ["[]", "{}", "()", "<>", "new Array()"],
        correctIndex: 1,
      },
      {
        text: "Доступ к полю obj.name делается через:",
        options: [
          "obj(name)",
          "obj->name",
          "obj.name",
          "obj[name]()",
          "name.obj",
        ],
        correctIndex: 2,
      },
      {
        text: "Как перебрать ключи объекта?",
        options: ["for...of", "for...in", "while", "map", "filter"],
        correctIndex: 1,
      },
      {
        text: "JSON.stringify делает:",
        options: [
          "Парсит JSON",
          "Преобразует объект в строку JSON",
          "Удаляет поля",
          "Сортирует",
          "Сравнивает",
        ],
        correctIndex: 1,
      },
      {
        text: "JSON.parse делает:",
        options: [
          "Преобразует объект в JSON",
          "Преобразует строку JSON в объект",
          "Сливает объекты",
          "Удаляет пробелы",
          "Вычисляет",
        ],
        correctIndex: 1,
      },
      {
        text: "Массив — это тоже объект?",
        options: ["Нет", "Да", "Только в TS", "Только в Python", "Никогда"],
        correctIndex: 1,
      },
      {
        text: "Как добавить новое поле в объект?",
        options: ["obj.add(x)", "obj.x = 1", "push", "map", "split"],
        correctIndex: 1,
      },
      {
        text: "Object.keys(obj) возвращает:",
        options: ["Число", "Массив ключей", "Объект", "Boolean", "Функцию"],
        correctIndex: 1,
      },
      {
        text: "Object.values(obj) возвращает:",
        options: [
          "Массив значений",
          "Массив ключей",
          "Строку",
          "Число",
          "null",
        ],
        correctIndex: 0,
      },
      {
        text: "Доступ к полю по строке key:",
        options: ["obj.key", "obj[key]", "key[obj]", "obj->key", "obj::key"],
        correctIndex: 1,
      },
    ],
    cs_general: [],
  }

  if (banks[topicKey] && banks[topicKey].length >= 10) return banks[topicKey]

  // fallback: choose a sensible default bank
  if (String(topicKey).startsWith("math_")) return banks.math_limits
  return banks.cs_variables
}

function seedLectureQuizzesForCourse(courseId) {
  const course = module.exports.getCourseById(courseId)
  if (!course) return

  const category = course.category || "Computer Science"
  const lectures = module.exports.getLectures(courseId)
  lectures.forEach((lec) => {
    try {
      const existing = module.exports.getLectureQuizByLectureId(lec.id)
      const ok =
        existing &&
        Array.isArray(existing.questions) &&
        existing.questions.length >= 10 &&
        existing.questions.every(
          (q) => Array.isArray(q.options) && q.options.length >= 5,
        )
      if (ok) return

      // recreate quiz for lecture
      module.exports.deleteQuizByLecture(lec.id)

      const quizTitle = `Тест по лекции: ${String(lec.title || "").replace(
        /^\d+\.\s*/,
        "",
      )}`
      const quiz = module.exports.upsertLectureQuiz(lec.id, quizTitle)
      const topicKey = resolveLectureQuizTopic(category, lec.title)
      const bank = getQuizBank(topicKey).slice(0, 10)

      bank.forEach((q, qi) => {
        const qId = uuidv4()
        module.exports.createQuizQuestion({
          id: qId,
          quizId: quiz.id,
          text: q.text,
          ord: qi + 1,
        })
        q.options.slice(0, 5).forEach((optText, oi) => {
          module.exports.createQuizOption({
            id: uuidv4(),
            questionId: qId,
            text: optText,
            isCorrect: oi === q.correctIndex,
            ord: oi + 1,
          })
        })
      })
    } catch (e) {}
  })
}

// Achievements должны быть всегда, даже если курс/задачи уже засидены
seedAchievements()
seedIfEmpty()
seedProgrammingCourse()
seedLectureQuizzesForCourse("higher-math")
seedLectureQuizzesForCourse("programming-js")
