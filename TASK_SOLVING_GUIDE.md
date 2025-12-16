# 📚 Task Solving System - Complete Guide

## Overview

The learning platform now has a complete task solving system that allows students to:
✅ View task conditions and requirements
✅ Submit solutions with real-time validation
✅ Get immediate feedback on correctness
✅ Track progress and completed tasks
✅ Access related theory materials
✅ See solution history and statistics

---

## Architecture

### File Structure

```
src/
├── components/
│   ├── TaskSolverPage/           # New dedicated task solver page
│   │   ├── TaskSolverPage.tsx    # Main component with full solving workflow
│   │   └── TaskSolverPage.module.scss
│   ├── TaskCard/                 # Updated to navigate to solver
│   │   └── TaskCard.tsx
│   └── TaskView/                 # Legacy modal view (still available)
│       └── TaskView.tsx
├── store/
│   ├── solutionSlice.ts          # NEW: Redux state for solutions
│   ├── progressSlice.ts          # NEW: Redux state for progress
│   └── index.ts                  # Updated with new slices
├── utils/
│   └── api.ts                    # NEW: Centralized API utilities
└── App.tsx                       # Updated with routing
```

### Routing Structure

```
/                                 → Task Grid Page (courses + tasks)
/course/:courseId/task/:taskId   → Full Task Solver Page
```

---

## Component Details

### TaskSolverPage (NEW)

**Purpose**: Full-featured task solving interface

**Features**:

- Task statement display with detailed formatting
- Input area for student answers (textarea)
- Real-time answer validation
- Immediate feedback (passed/failed)
- Hint/explanation display
- Related lecture/theory links
- Progress tracking sidebar
- Status indicators (completed/in-progress)

**Props**:

- Loaded from URL params: `courseId`, `taskId`

**State Management**:

- Redux: `solution.submitting`, `solution.error`
- Local: `userAnswer`, `submitted`, `checkStatus`

**API Calls**:

```typescript
// On page load
fetchTask(courseId, taskId)
fetchLectures(courseId)

// On solution submission
createSolution(...)      // Save answer to DB
createCheckResult(...)   // Record check results
createProgress(...)      // Update user progress
```

---

## Redux Slices

### `solutionSlice.ts`

Manages user solutions and check results

```typescript
state: {
  solutions: Solution[]           // Array of user solutions
  currentSolution: Solution | null
  checkResults: Record<string, CheckResult[]>
  submitting: boolean
  error: string | null
}

actions: {
  setSolutions, setCurrentSolution, addSolution
  setCheckResults, setSubmitting, setError, clearError
}
```

### `progressSlice.ts`

Tracks task completion progress

```typescript
state: {
  records: ProgressRecord[]      // User's progress per task
  loading: boolean
  error: string | null
}

actions: {
  setProgressRecords, updateProgress
  setLoading, setError
}
```

---

## API Integration

### File: `utils/api.ts`

**Task APIs**:

```typescript
fetchTask(courseId: string, taskId: string)
  → Returns: TaskData with meta (type, answer, explanation)

fetchTasks(courseId: string)
  → Returns: TaskData[]

fetchLectures(courseId: string)
  → Returns: LectureData[]
```

**Solution APIs**:

```typescript
createSolution(solution: Solution)
  POST /api/solutions
  → Returns: { id, user_id, task_id, code, created_at }

fetchUserSolutions(userId: string)
  GET /api/users/:userId/solutions
  → Returns: grouped solutions by task
```

**Check & Progress APIs**:

```typescript
createCheckResult(result: CheckResult)
  POST /api/check-results
  → Returns: { id, solution_id, status, passed_tests, ... }

createProgress(progress: ProgressRecord)
  POST /api/progress
  → Returns: { id, userId, taskId, status, updatedAt }

updateProgress(id: string, status: string)
  PUT /api/progress/:id
  → Returns: updated progress record
```

**Answer Validation**:

```typescript
isAnswerCorrect(userAnswer: string, expectedAnswer: string): boolean
  // Normalizes and compares answers
  // Handles whitespace, special characters, case
```

---

## User Workflow

### Step 1: Browse Tasks

1. User sees task grid on main page
2. Selects course from dropdown
3. Views filtered tasks with cards

### Step 2: Click "Solve" Button

1. TaskCard checks if `courseId` is provided
2. Navigates to: `/course/{courseId}/task/{taskId}`
3. ProtectedRoute wrapper ensures authentication (can be extended)

### Step 3: Task Solver Page Loads

1. Fetches task data and parses meta information
2. Loads related lectures
3. Displays:
   - Task title and description
   - Expected answer format
   - Input textarea for solution
   - Hint/explanation button
   - Related theory sidebar

### Step 4: Student Submits Solution

1. Types answer in textarea
2. Clicks "Проверить ответ" (Check Answer)
3. API flow:
   ```
   Create Solution
   → Validate Answer (isAnswerCorrect)
   → Create CheckResult
   → Create/Update Progress
   → Update Redux state
   ```

### Step 5: Receive Feedback

**If Correct** ✅

- Green status badge: "Отлично! Ваш ответ правильный"
- Button changes to: "Задача решена"
- Input disabled
- Progress status: "completed"

**If Incorrect** ❌

- Red status badge: "Ответ неправильный..."
- Button remains active
- Can show hint
- Can try again
- Progress status: "in_progress"

### Step 6: Return to Grid

- "Вернуться к задачам" button (shown after success)
- Back arrow button (always available)
- Maintains scroll position in Redux

---

## Task Meta Structure

Each task has a `meta` field (JSON) containing:

```typescript
{
  type: "numeric" | "formula" | "code"      // Answer type
  answer: "expected correct answer"          // For validation
  explanation: "detailed explanation"        // For hints
  topic?: "string"                          // Related topic
  difficulty?: "Easy" | "Medium" | "Hard"   // Difficulty level
}
```

**Example (from database)**:

```json
{
  "type": "numeric",
  "answer": "4",
  "explanation": "(x² - 4)/(x - 2) = x + 2 = 4"
}
```

---

## Database Schema

### tables required:

- `tasks` - task definitions with meta
- `solutions` - user submitted answers
- `check_results` - validation results
- `progress` - user task progress
- `lectures` - related theory materials

### Example Query Flow:

```sql
-- Get task with meta
SELECT * FROM tasks WHERE id = 'task-1' AND courseId = 'higher-math'

-- Record solution
INSERT INTO solutions (id, user_id, task_id, code, created_at)
VALUES ('sol-123', 'user-1', 'task-1', 'user answer', timestamp)

-- Record check result
INSERT INTO check_results (id, solution_id, status, passed_tests)
VALUES ('check-123', 'sol-123', 'passed', 1)

-- Update progress
INSERT INTO progress (userId, taskId, status, updatedAt)
VALUES ('user-1', 'task-1', 'completed', timestamp)
```

---

## Styling & UI

### Colors

- **Primary**: Blue (#1e40af, #1e3a8a)
- **Success**: Green (#059669)
- **Error**: Red (#dc2626)
- **Warning**: Yellow (#d97706)
- **Neutral**: Gray (#6b7280)

### Components Used

- `Card` - Container for content sections
- `Button` - Action triggers (outlined, primary, ghost)
- `Badge` - Status indicators
- `Textarea` - Answer input
- Lucide icons (ArrowLeft, Lightbulb, CheckCircle, etc.)

### Responsive Design

- **Mobile**: Single column layout
- **Tablet**: 2-column (content + sidebar)
- **Desktop**: 3-column grid (main task / sidebar)

---

## Extending the System

### Add Answer Validation Logic

Edit `utils/api.ts`:

```typescript
export function isAnswerCorrect(...): boolean {
  // Add custom validation logic
  // E.g., regex patterns, mathematical expressions
}
```

### Add New Task Types

1. Update task `meta.type`
2. Customize validation in `TaskSolverPage.tsx`
3. Update UI based on type

### Track More Statistics

1. Add fields to `progressSlice.ts`
2. Update `/api/users/:userId/stats` endpoint
3. Display in progress sidebar

### Add Peer Review

1. Create solution comments table
2. Add comment form in TaskSolverPage
3. Display teacher feedback

---

## Error Handling

All API calls wrapped in try-catch:

```typescript
try {
  const data = await fetchTask(...)
} catch (err) {
  setErrorState(err.message)
  dispatch(setError(err.message))
  // UI shows error message to user
}
```

**Error States**:

- Task not found → Navigate back to grid
- Network error → Show error message + retry
- Validation error → Show in UI with suggestion

---

## Performance Optimizations

1. **Lazy Loading**: Lectures loaded on-demand
2. **Memoization**: Task data cached in state
3. **Conditional Rendering**: Only show relevant sections
4. **Debouncing**: Answer input validated on submit (not keystroke)

---

## Testing Checklist

- [ ] Navigate to task grid
- [ ] Select course from dropdown
- [ ] Click "Решить" button → navigates to solver
- [ ] Task title and description displays
- [ ] Can type in textarea
- [ ] Submit correct answer → shows "passed" status
- [ ] Submit wrong answer → shows "failed" status
- [ ] Show hint button displays explanation
- [ ] Back button returns to grid
- [ ] Progress shows in sidebar
- [ ] Related lecture link visible

---

## Future Enhancements

1. **Multi-part Tasks**: Support tasks with multiple test cases
2. **Code Execution**: Run Python/JS code in browser
3. **File Upload**: Accept .pdf, .txt, .jpg solutions
4. **Time Limits**: Add task time constraints
5. **Scoring System**: Points per difficulty level
6. **Achievements**: Badges for completions
7. **Leaderboard**: Compare progress with peers
8. **Difficulty Adjustment**: Adapt based on performance

---

## FAQ

**Q: How is correctness determined?**
A: Via `isAnswerCorrect()` utility - compares normalized strings. For real evaluation, integrate with a backend evaluator (e.g., judge system, Python sandbox).

**Q: Can users see other solutions?**
A: Currently only their own. Add endpoint `/api/solutions/:taskId` to show class solutions.

**Q: What if validation fails?**
A: User gets feedback, can show hints, and try again. No attempts limit yet.

**Q: How are progress tracked?**
A: Via `progressSlice` Redux state + `/api/progress` endpoint. Shows in sidebar and main stats page.

**Q: Can tasks be edited after submission?**
A: Currently no, but can add edit button that allows retries and tracks attempt history.

---

## Support

For issues or questions:

1. Check the task data in database
2. Verify API endpoints are working: `curl http://localhost:4000/api/courses`
3. Check Redux devtools for state changes
4. Check browser console for errors
