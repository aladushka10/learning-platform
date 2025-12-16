# 🚀 Quick Start: Task Solving Feature

## What Was Added

A complete **task solving system** that allows students to:

1. Click "Решить" (Solve) button on any task
2. View the task with full conditions and expected answer format
3. Submit their solution
4. Get instant feedback (correct/incorrect)
5. See hints and explanations
6. Track their progress

## How It Works

### 1. User Views Task Grid

```
Main Page
├── Select Course
├── View Task Cards
└── Click "Решить" → Navigates to Task Solver
```

### 2. Task Solver Page Opens

```
/course/higher-math/task/task-1

Shows:
├── Task Statement
├── Expected Answer Format
├── Input Area
├── Hint Button
├── Related Theory
└── Progress Sidebar
```

### 3. Student Submits Answer

```
User Types → Clicks "Проверить ответ"

API Flow:
1. Create Solution (save answer to DB)
2. Validate Answer (compare with expected)
3. Create CheckResult (record pass/fail)
4. Update Progress (mark task as completed/in_progress)
5. Store in Redux + show feedback
```

### 4. Get Feedback

```
✅ Correct Answer
   ├── Green badge "Отлично!"
   ├── Input disabled
   ├── Button: "Задача решена"
   └── Shows "Решено" in sidebar

❌ Wrong Answer
   ├── Red badge "Неправильно"
   ├── Input stays active
   ├── Can show hint
   └── Can try again
```

## File Changes Summary

### New Files Created

```
src/
├── store/
│   ├── solutionSlice.ts        ✨ Redux for solutions
│   └── progressSlice.ts        ✨ Redux for progress
├── components/TaskSolverPage/
│   ├── TaskSolverPage.tsx      ✨ Main solver component
│   └── TaskSolverPage.module.scss
├── utils/
│   └── api.ts                  ✨ API utilities
└── TASK_SOLVING_GUIDE.md       ✨ Full documentation
```

### Updated Files

```
src/
├── App.tsx                      → Added routing & Router setup
├── main.tsx                     → Simplified to use App routing
├── store/index.ts             → Added new slices
└── components/
    ├── TaskCard.tsx           → Added navigation to solver
    └── TaskView.tsx           → Updated interface
```

## Key Features

### ✅ Answer Validation

- Normalizes user input (whitespace, case)
- Compares with expected answer
- Extensible for different task types

### ✅ Real-time Feedback

- Status shown immediately
- Color-coded (green/red)
- Detailed message to user

### ✅ Progress Tracking

- Updates DB and Redux
- Shows in progress sidebar
- Accessible via API

### ✅ Theory Links

- Shows related lecture
- Can be expanded to show full content
- Helps students understand concepts

### ✅ Responsive Design

- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns

## Example Flow

### 1. Start at Home

```
User sees:
- Course dropdown: "Высшая математика"
- Task cards in grid
- Card shows: Title, Description, Difficulty
```

### 2. Click "Решить" on task-1

```
Navigates to: /course/higher-math/task/task-1

Page loads:
- Fetches task data
- Fetches related lectures
- Shows full task interface
```

### 3. View Task Details

```
Task: "Вычисление предела"
Description: "Найдите: lim[x→2] (x² - 4)/(x - 2)"

Expected Answer Format:
┌─────────────────────┐
│         4           │
└─────────────────────┘

Related Theory:
┌─────────────────────┐
│ 1. Теория пределов  │
│ Read more →         │
└─────────────────────┘

Progress:
├─ Attempts: 0
└─ Status: In Progress
```

### 4. Type Solution

```
Student enters: "4"

Or: "x + 2 when x = 2 equals 4"

Or: "(x-2)(x+2)/(x-2) = x+2 = 4"
```

### 5. Submit & Get Feedback

```
Click "Проверить ответ"

✅ "Отлично! Ваш ответ правильный"
   └─ Disabled input
   └─ Button: "Задача решена"
   └─ Progress: "Решено"
```

## API Endpoints Used

### On Page Load

```bash
GET /api/courses/higher-math/tasks
  → Fetch all tasks (or specific task)

GET /api/courses/higher-math/lectures
  → Fetch related theory materials
```

### On Submit

```bash
POST /api/solutions
  {
    "id": "sol-123",
    "user_id": "demo-user",
    "task_id": "task-1",
    "code": "4",
    "created_at": 1765841731056
  }

POST /api/check-results
  {
    "id": "check-123",
    "solution_id": "sol-123",
    "status": "passed",
    "time_ms": 45,
    "passed_tests": 1,
    "error_message": null
  }

POST /api/progress
  {
    "id": "prog-123",
    "userId": "demo-user",
    "taskId": "task-1",
    "status": "completed",
    "updatedAt": 1765841731056
  }
```

## Redux State

### Solution State

```typescript
{
  solutions: [],                    // Array of Solutions
  currentSolution: null,           // Currently viewed solution
  checkResults: {},               // Check results by solutionId
  submitting: false,              // Submission in progress
  error: null                     // Error message
}
```

### Progress State

```typescript
{
  records: [],                    // Array of ProgressRecords
  loading: false,                // Loading state
  error: null                    // Error message
}
```

## Testing the Feature

### 1. Start Server

```bash
cd learning-platform/server
npm install
node index.js
# Server runs on http://localhost:4000
```

### 2. Start Frontend

```bash
cd learning-platform
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 3. Test Workflow

```
1. Go to http://localhost:5173
2. Select "Высшая математика" course
3. See task cards
4. Click "Решить" on first task
5. View task details page
6. Type "4" in input
7. Click "Проверить ответ"
8. See green "Отлично!" message
9. Click "Вернуться к задачам"
10. See task marked as completed (green checkmark)
```

## Database Demo Data

Pre-loaded with:

```
Course: "Высшая математика"
├── 5 Tasks
│   ├── task-1: Limits (answer: "4")
│   ├── task-2: Derivatives (answer: "2x + 3")
│   ├── task-3: Product rule (answer: "sin(x) + x·cos(x)")
│   ├── task-4: Integrals (answer: "x³ + x² + C")
│   └── task-5: By parts (answer: "eˣ(x - 1) + C")
├── 3 Lectures with theory
├── 3 Modules organizing content
└── Demo User with 2 completed tasks

User: "demo-user"
- Email: demo@example.com
- Progress: 2 completed + 1 in progress
- Solutions: 2 recorded
```

## Customization

### Change Answer Validation

Edit `src/utils/api.ts`:

```typescript
export function isAnswerCorrect(
  userAnswer: string,
  expectedAnswer: string
): boolean {
  // Add your logic here
}
```

### Modify Task Types

Edit `TaskSolverPage.tsx`:

```typescript
// In TaskSolverPage component
const handleSubmit = async () => {
  // Add custom validation based on task.meta.type
  if (task.meta.type === "code") {
    // Run code evaluation
  }
}
```

### Add More Feedback

Edit task `meta`:

```json
{
  "type": "numeric",
  "answer": "4",
  "explanation": "...",
  "hints": ["Check left side", "Simplify fraction"],
  "resources": ["lecture-1", "doc-1"]
}
```

## Troubleshooting

### Issue: Button "Решить" not navigating

**Solution**: Check that `courseId` is passed to `TaskCard`

### Issue: Task data not loading

**Solution**: Ensure server is running and `/api/courses/:id/tasks` returns data

### Issue: Answer validation always fails

**Solution**: Check `isAnswerCorrect` logic in `api.ts`

### Issue: Redux state not updating

**Solution**: Check that actions are dispatched in `TaskSolverPage`

## Next Steps

1. **Add More Task Types**

   - Multiple choice
   - Drag & drop
   - Code editor with execution

2. **Enhance Validation**

   - Regex pattern matching
   - Math expression evaluation
   - Code syntax checking

3. **Add Complexity**

   - Test cases with multiple inputs
   - Scoring system
   - Time limits

4. **Social Features**

   - Discussion threads
   - Peer reviews
   - Teacher feedback

5. **Analytics**
   - Attempt history
   - Time per task
   - Difficulty metrics

---

## Documentation Files

- `TASK_SOLVING_GUIDE.md` - Complete technical guide
- `API_DOCUMENTATION.md` - All API endpoints
- This file - Quick start

Good luck! 🎓
