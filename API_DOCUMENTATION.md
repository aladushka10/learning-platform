# Learning Platform API Documentation

## 🚀 Server Setup & Start

```bash
cd server
npm install
node index.js
```

Server запускается на **http://localhost:4000**
API документация доступна на **http://localhost:4000/api-docs** (Swagger UI)

---

## 📚 Database & Demo Data

При первом запуске база данных автоматически заполняется следующей информацией:

### Course: "Высшая математика"

- **ID**: `higher-math`
- **Категории**:
  - Пределы
  - Производные
  - Интегралы
  - Дифференциальные уравнения

### 5 Tasks с решениями и тестовыми случаями:

1. **task-1**: Вычисление предела → lim[x→2] (x² - 4)/(x - 2) = 4
2. **task-2**: Производная полинома → f'(x) для x² + 3x - 5 = 2x + 3
3. **task-3**: Производная произведения → f'(x) для x·sin(x)
4. **task-4**: Интеграл полинома → ∫(3x² + 2x)dx = x³ + x² + C
5. **task-5**: Интегрирование по частям → ∫x·eˣ dx

### 3 Lectures с теорией:

- Теория пределов функций
- Производная функции
- Неопределённый интеграл

### 3 Modules (Модули курса):

- Модуль 1: Пределы и непрерывность
- Модуль 2: Дифференциальное исчисление
- Модуль 3: Интегральное исчисление

### Demo User:

- **ID**: `demo-user`
- **Email**: `demo@example.com`
- **Progress**:
  - ✅ 2 completed tasks (task-1, task-2)
  - 🔄 1 in_progress task (task-3)
  - Sample solutions with passed test checks

---

## 📡 API Endpoints

### Courses

```bash
GET  /courses                    # Список всех курсов
GET  /courses/:courseId          # Данные конкретного курса
POST /courses                    # Создать курс
PUT  /courses/:courseId          # Обновить курс
DELETE /courses/:courseId        # Удалить курс
```

### Tasks (с курсом)

```bash
GET  /courses/:courseId/tasks    # Задачи курса
GET  /tasks/:taskId              # Конкретная задача
POST /courses/:courseId/tasks    # Создать задачу в курсе
PUT  /tasks/:taskId              # Обновить задачу
DELETE /tasks/:taskId            # Удалить задачу
```

### Modules

```bash
GET  /courses/:courseId/modules  # Модули курса
GET  /modules/:moduleId          # Конкретный модуль
POST /courses/:courseId/modules  # Создать модуль
PUT  /modules/:moduleId          # Обновить модуль
DELETE /modules/:moduleId        # Удалить модуль
```

### Lectures

```bash
GET  /courses/:courseId/lectures # Лекции курса
GET  /lectures/:lectureId        # Конкретная лекция
POST /courses/:courseId/lectures # Создать лекцию
PUT  /lectures/:lectureId        # Обновить лекцию
DELETE /lectures/:lectureId      # Удалить лекцию
```

### Users

```bash
GET  /users                      # Список пользователей
GET  /users/:userId              # Данные пользователя
POST /users                      # Создать пользователя
PUT  /users/:userId              # Обновить пользователя
DELETE /users/:userId            # Удалить пользователя
```

### Categories

```bash
GET  /categories                 # Все категории
GET  /categories/:categoryId      # Конкретная категория
POST /categories                 # Создать категорию
PUT  /categories/:categoryId      # Обновить категорию
DELETE /categories/:categoryId    # Удалить категорию
```

### Test Cases

```bash
GET  /test-cases                 # Все тест-кейсы
GET  /test-cases/:testCaseId     # Конкретный тест-кейс
POST /test-cases                 # Создать тест-кейс
PUT  /test-cases/:testCaseId     # Обновить тест-кейс
DELETE /test-cases/:testCaseId   # Удалить тест-кейс
```

### Solutions & Check Results

```bash
GET  /solutions                  # Все решения
GET  /solutions/:solutionId      # Конкретное решение
POST /solutions                  # Создать решение
PUT  /solutions/:solutionId      # Обновить решение
DELETE /solutions/:solutionId    # Удалить решение

GET  /check-results              # Результаты проверки
GET  /check-results/:resultId    # Конкретный результат
POST /check-results              # Создать результат проверки
PUT  /check-results/:resultId    # Обновить результат
DELETE /check-results/:resultId  # Удалить результат
```

### Progress Tracking

```bash
GET  /progress                   # Прогресс всех пользователей
GET  /progress/:progressId       # Конкретный прогресс
POST /progress                   # Создать запись прогресса
PUT  /progress/:progressId       # Обновить прогресс
DELETE /progress/:progressId     # Удалить прогресс
```

---

## 📊 Statistics Endpoints

### User Statistics

```bash
GET /users/:userId/stats
```

**Response example:**

```json
{
  "totalTasks": 5,
  "completedTasks": 2,
  "inProgressTasks": 1,
  "notStartedTasks": 2,
  "completionRate": 40,
  "tasks": [
    {
      "taskId": "task-1",
      "taskTitle": "Вычисление предела",
      "status": "completed",
      "updatedAt": 1765841731056
    }
  ]
}
```

### Course Statistics for User

```bash
GET /courses/:courseId/stats/:userId
```

**Response example:**

```json
{
  "courseId": "higher-math",
  "userId": "demo-user",
  "completionStats": {
    "totalTasks": 5,
    "completedTasks": 2,
    "inProgressTasks": 1,
    "completionRate": 40
  },
  "taskStats": [
    {
      "taskId": "task-1",
      "taskTitle": "Вычисление предела",
      "attempts": 1,
      "lastAttempt": 1765841731056,
      "checkStatus": "passed",
      "passedTests": 1
    }
  ]
}
```

### User Solutions History

```bash
GET /users/:userId/solutions
```

**Response example:**

```json
[
  {
    "taskId": "task-1",
    "taskTitle": "Вычисление предела",
    "solutionCount": 1,
    "solutions": [
      {
        "solutionId": "uuid-123",
        "code": "solution code here",
        "createdAt": 1765841731056,
        "checkResults": [
          {
            "status": "passed",
            "time_ms": 45,
            "passed_tests": 1,
            "error_message": null
          }
        ]
      }
    ]
  }
]
```

---

## 🧪 Example API Calls

### Get all courses

```bash
curl http://localhost:4000/courses
```

### Get tasks for a course

```bash
curl http://localhost:4000/courses/higher-math/tasks
```

### Get demo user statistics

```bash
curl http://localhost:4000/users/demo-user/stats
```

### Get course statistics for a user

```bash
curl http://localhost:4000/courses/higher-math/stats/demo-user
```

### Get user's solution history

```bash
curl http://localhost:4000/users/demo-user/solutions
```

### Create a new course

```bash
curl -X POST http://localhost:4000/courses \
  -H "Content-Type: application/json" \
  -d '{
    "id": "new-course",
    "title": "Новый курс",
    "description": "Описание",
    "category": "Math",
    "createdAt": 1765841731056
  }'
```

---

## 📦 Database Structure

### Tables:

- **courses** - Курсы
- **lectures** - Лекции с теорией
- **tasks** - Задачи (с meta JSON содержащим type, answer, explanation)
- **modules** - Модули курса
- **users** - Пользователи
- **categories** - Категории задач
- **task_categories** - Связь задач и категорий
- **test_cases** - Тестовые случаи для проверки
- **solutions** - Решения пользователей
- **check_results** - Результаты проверки решений
- **progress** - Прогресс пользователя по задачам

### Task Meta Structure:

```json
{
  "type": "numeric|formula|code",
  "answer": "правильный ответ",
  "explanation": "объяснение решения"
}
```

---

## 🔄 Workflow: Student Solution & Statistics

1. **Student submits solution**

   ```bash
   POST /solutions
   {
     "id": "sol-123",
     "user_id": "student-1",
     "task_id": "task-1",
     "code": "student's answer"
   }
   ```

2. **System checks solution**

   ```bash
   POST /check-results
   {
     "id": "check-123",
     "solution_id": "sol-123",
     "status": "passed|failed",
     "passed_tests": 1
   }
   ```

3. **Update progress**

   ```bash
   POST /progress
   {
     "userId": "student-1",
     "taskId": "task-1",
     "status": "completed"
   }
   ```

4. **Student checks statistics**
   ```bash
   GET /users/student-1/stats
   GET /courses/higher-math/stats/student-1
   ```

---

## 🛠️ Project Structure

```
learning-platform/
├── server/
│   ├── index.js          # Express app с всеми routes
│   ├── db.js             # SQLite database initialization & helpers
│   ├── swagger.js        # OpenAPI specification
│   ├── data/
│   │   └── app.db        # SQLite database (auto-created)
│   └── package.json
├── src/                  # React/TypeScript frontend
├── package.json
└── tsconfig.json
```

---

## ✅ Ready to Use

База данных полностью заполнена и содержит:

- ✅ 1 полный курс "Высшая математика"
- ✅ 5 задач с тестовыми случаями
- ✅ 3 лекции с теорией
- ✅ 3 модуля
- ✅ 1 демо-пользователь с решениями
- ✅ Статистика по решенным задачам
- ✅ История попыток и результаты проверок

Можете сразу начать:

1. Просматривать курсы и задачи
2. Добавлять новых пользователей
3. Создавать решения
4. Проверять статистику по прогрессу
5. Расширять базу данных новыми курсами и задачами
