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
  updateCourse: (id, data) =>
    db
      .prepare(
        "UPDATE courses SET title = ?, description = ?, category = ? WHERE id = ?"
      )
      .run(data.title, data.description, data.category, id),
  deleteCourse: (id) => db.prepare("DELETE FROM courses WHERE id = ?").run(id),

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
  getModuleById: (id) =>
    db.prepare("SELECT * FROM modules WHERE id = ?").get(id),
  updateModule: (id, data) =>
    db
      .prepare(
        "UPDATE modules SET title = ?, description = ?, ord = ? WHERE id = ?"
      )
      .run(data.title, data.description, data.ord, id),
  deleteModule: (id) => db.prepare("DELETE FROM modules WHERE id = ?").run(id),

  // lectures
  getLectures: (courseId) =>
    db
      .prepare(
        "SELECT id, courseId, title, content, ord FROM lectures WHERE courseId = ? ORDER BY ord ASC"
      )
      .all(courseId),
  getLectureById: (id) =>
    db
      .prepare(
        "SELECT id, courseId, title, content, ord FROM lectures WHERE id = ?"
      )
      .get(id),
  createLecture: (l) =>
    db
      .prepare(
        "INSERT INTO lectures (id, courseId, title, content, ord) VALUES (?, ?, ?, ?, ?)"
      )
      .run(l.id, l.courseId, l.title, l.content, l.ord),
  updateLecture: (id, data) =>
    db
      .prepare(
        "UPDATE lectures SET title = ?, content = ?, ord = ? WHERE id = ?"
      )
      .run(data.title, data.content, data.ord, id),
  deleteLecture: (id) =>
    db.prepare("DELETE FROM lectures WHERE id = ?").run(id),

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
  updateTask: (id, data) =>
    db
      .prepare(
        "UPDATE tasks SET title = ?, description = ?, meta = ?, ord = ? WHERE id = ?"
      )
      .run(data.title, data.description, data.meta, data.ord, id),
  deleteTask: (id) => db.prepare("DELETE FROM tasks WHERE id = ?").run(id),

  // users
  getUsers: () =>
    db
      .prepare(
        "SELECT id, email, firstName, lastName, createdAt FROM users ORDER BY createdAt DESC"
      )
      .all(),
  getUserById: (id) =>
    db
      .prepare(
        "SELECT id, email, passwordHash, firstName, lastName, createdAt FROM users WHERE id = ?"
      )
      .get(id),
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
  updateUser: (id, data) =>
    db
      .prepare(
        "UPDATE users SET email = ?, firstName = ?, lastName = ? WHERE id = ?"
      )
      .run(data.email, data.firstName, data.lastName, id),
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
        "INSERT INTO task_categories (id, task_id, category_id) VALUES (?, ?, ?)"
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
        "UPDATE test_cases SET input = ?, expected_output = ? WHERE id = ?"
      )
      .run(data.input, data.expected_output, id),
  deleteTestCase: (id) =>
    db.prepare("DELETE FROM test_cases WHERE id = ?").run(id),

  // solutions/checks/progress
  getSolutionsByTask: (taskId) =>
    db
      .prepare(
        "SELECT * FROM solutions WHERE task_id = ? ORDER BY created_at DESC"
      )
      .all(taskId),
  getSolutionById: (id) =>
    db.prepare("SELECT * FROM solutions WHERE id = ?").get(id),
  updateSolution: (id, data) =>
    db.prepare("UPDATE solutions SET code = ? WHERE id = ?").run(data.code, id),
  deleteSolution: (id) =>
    db.prepare("DELETE FROM solutions WHERE id = ?").run(id),

  getCheckResultsBySolution: (solutionId) =>
    db
      .prepare(
        "SELECT * FROM check_results WHERE solution_id = ? ORDER BY ROWID DESC"
      )
      .all(solutionId),
  getCheckResultById: (id) =>
    db.prepare("SELECT * FROM check_results WHERE id = ?").get(id),
  updateCheckResult: (id, data) =>
    db
      .prepare(
        "UPDATE check_results SET status = ?, time_ms = ?, passed_tests = ?, error_message = ? WHERE id = ?"
      )
      .run(
        data.status,
        data.time_ms,
        data.passed_tests,
        data.error_message,
        id
      ),
  deleteCheckResult: (id) =>
    db.prepare("DELETE FROM check_results WHERE id = ?").run(id),

  createProgress: (p) =>
    db
      .prepare(
        "INSERT INTO progress (id, userId, taskId, status, updatedAt) VALUES (?, ?, ?, ?, ?)"
      )
      .run(p.id, p.userId, p.taskId, p.status, p.updatedAt),

  createSolution: (s) =>
    db
      .prepare(
        "INSERT INTO solutions (id, user_id, task_id, code, created_at) VALUES (?, ?, ?, ?, ?)"
      )
      .run(s.id, s.user_id, s.task_id, s.code, s.created_at),

  createCheckResult: (c) =>
    db
      .prepare(
        `INSERT INTO check_results
     (id, solution_id, status, time_ms, passed_tests, error_message)
     VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        c.id,
        c.solution_id,
        c.status,
        c.time_ms,
        c.passed_tests,
        c.error_message
      ),

  getProgressByUser: (userId) =>
    db
      .prepare(
        "SELECT * FROM progress WHERE userId = ? ORDER BY updatedAt DESC"
      )
      .all(userId),
  getProgressById: (id) =>
    db.prepare("SELECT * FROM progress WHERE id = ?").get(id),
  updateProgress: (id, data) =>
    db
      .prepare("UPDATE progress SET status = ?, updatedAt = ? WHERE id = ?")
      .run(data.status, data.updatedAt, id),
  deleteProgress: (id) =>
    db.prepare("DELETE FROM progress WHERE id = ?").run(id),
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
  //   const lectures = [
  //     {
  //       id: "lec-1",
  //       courseId,
  //       title: "1. Понятие предела функции",
  //       content: `
  // ### Понятие предела функции

  // Понятие предела является одним из базовых понятий математического анализа и служит основой для изучения непрерывности, производных и интегралов. Интуитивно предел функции описывает поведение значений функции при приближении аргумента к некоторой фиксированной точке.

  // Пусть функция \( f(x) \) определена в окрестности точки \( x_0 \), за исключением, возможно, самой точки \( x_0 \). Число \( L \) называется **пределом функции** \( f(x) \) при \( x \to x_0 \), если значения функции становятся сколь угодно близкими к \( L \) при достаточно близких к \( x_0 \) значениях аргумента:

  // $$
  // \lim_{x \to x_0} f(x) = L
  // $$

  // Формальное определение предела даётся с помощью \( \varepsilon \)–\( \delta \) определения: для любого \( \varepsilon > 0 \) существует такое \( \delta > 0 \), что при выполнении условия
  // \( 0 < |x - x_0| < \delta \) выполняется неравенство
  // \( |f(x) - L| < \varepsilon \).

  // Рассматриваются также **односторонние пределы** — левосторонний и правосторонний, которые характеризуют поведение функции при приближении к точке только с одной стороны.

  // К основным свойствам пределов относятся:
  // - единственность предела;
  // - линейность;
  // - правила вычисления пределов суммы, произведения и частного функций.

  // Эти свойства позволяют находить пределы сложных выражений, сводя задачу к более простым случаям.
  // `,
  //       ord: 1,
  //     },
  //     {
  //       id: "lec-2",
  //       courseId,
  //       title: "2. Непрерывность функции",
  //       content: `
  // ### Непрерывность функции

  // Понятие непрерывности функции тесно связано с понятием предела и описывает отсутствие скачков и разрывов в поведении функции. Интуитивно функция считается непрерывной, если её график можно начертить, не отрывая карандаша от бумаги.

  // Функция \( f(x) \) называется **непрерывной в точке** \( x_0 \), если выполняются три условия:
  // 1. функция определена в точке \( x_0 \);
  // 2. существует предел \( \lim_{x \to x_0} f(x) \);
  // 3. значение предела равно значению функции в точке:
  // $$
  // \lim_{x \to x_0} f(x) = f(x_0)
  // $$

  // Если функция непрерывна в каждой точке некоторого промежутка, то говорят, что она непрерывна на этом промежутке.

  // Классами непрерывных функций являются многочлены, показательные, логарифмические и тригонометрические функции в областях их определения.

  // Непрерывные функции обладают важными свойствами:
  // - принимают все промежуточные значения;
  // - достигают на замкнутом отрезке максимума и минимума.
  // `,
  //       ord: 2,
  //     },
  //     {
  //       id: "lec-3",
  //       courseId,
  //       title: "3. Производная и её смысл",
  //       content: `
  // ### Производная функции и её смысл

  // Производная является одной из ключевых характеристик функции и показывает, как быстро изменяется значение функции при изменении аргумента.

  // Производная функции \( f(x) \) в точке \( x_0 \) определяется как предел:
  // $$
  // f'(x_0) = \lim_{\Delta x \to 0} \frac{f(x_0 + \Delta x) - f(x_0)}{\Delta x}
  // $$

  // **Геометрический смысл производной** заключается в том, что она равна угловому коэффициенту касательной к графику функции в данной точке.

  // **Физический смысл производной** связан со скоростью изменения величины. Например, если функция описывает путь тела во времени, то её производная соответствует мгновенной скорости.

  // Не каждая функция имеет производную. Для существования производной функция должна быть непрерывной в данной точке, однако непрерывность не гарантирует дифференцируемость.
  // `,
  //       ord: 3,
  //     },
  //     {
  //       id: "lec-4",
  //       courseId,
  //       title: "4. Таблица производных",
  //       content: `
  // ### Таблица производных и правила дифференцирования

  // Для упрощения вычислений в математическом анализе используется таблица производных элементарных функций. Она позволяет находить производные без применения определения через предел.

  // К основным формулам относятся:
  // - \( (x^n)' = n x^{n-1} \)
  // - \( (\sin x)' = \cos x \)
  // - \( (\cos x)' = -\sin x \)
  // - \( (e^x)' = e^x \)

  // Помимо таблицы используются **правила дифференцирования**:
  // - правило суммы;
  // - правило произведения;
  // - правило частного;
  // - правило цепочки.

  // Использование этих правил позволяет находить производные сложных функций и является основой для исследования функций и решения прикладных задач.
  // `,
  //       ord: 4,
  //     },
  //     {
  //       id: "lec-5",
  //       courseId,
  //       title: "5. Неопределённый интеграл",
  //       content: `
  // ### Неопределённый интеграл

  // Неопределённый интеграл является операцией, обратной дифференцированию, и используется для нахождения функции по известной производной.

  // Неопределённым интегралом функции \( f(x) \) называется совокупность всех её первообразных:
  // $$
  // \int f(x) \, dx = F(x) + C
  // $$
  // где \( F'(x) = f(x) \), а \( C \) — произвольная постоянная.

  // Для вычисления интегралов применяется таблица основных интегралов и правила интегрирования:
  // - линейность;
  // - замена переменной;
  // - интегрирование по частям.

  // Неопределённые интегралы широко применяются при решении дифференциальных уравнений и прикладных задач.
  // `,
  //       ord: 5,
  //     },
  //     {
  //       id: "lec-6",
  //       courseId,
  //       title: "6. Определённый интеграл",
  //       content: `
  // ### Определённый интеграл

  // Определённый интеграл используется для вычисления численных характеристик и имеет наглядный геометрический смысл.

  // Определённый интеграл функции \( f(x) \) на отрезке \([a, b]\) обозначается:
  // $$
  // \int_a^b f(x)\, dx
  // $$

  // Он определяется как предел интегральных сумм при стремлении длины разбиения к нулю.

  // Важнейшим результатом является **формула Ньютона–Лейбница**:
  // $$
  // \int_a^b f(x)\,dx = F(b) - F(a)
  // $$
  // где \( F(x) \) — первообразная функции \( f(x) \).

  // Определённые интегралы применяются для вычисления площадей, объёмов тел, работы силы и других физических величин.
  // `,
  //       ord: 6,
  //     },
  //   ]
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

seedIfEmpty()
