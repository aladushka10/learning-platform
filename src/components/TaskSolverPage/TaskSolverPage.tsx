import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  ArrowLeft,
  Lightbulb,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
} from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import {
  setSubmitting,
  setError,
  clearError,
  addSolution,
  setCheckResults,
} from "../../store/solutionSlice"
import { updateProgress } from "../../store/progressSlice"
import {
  fetchTask,
  fetchLectures,
  createSolution,
  createCheckResult,
  createProgress,
  updateProgress as updateProgressAPI,
  isAnswerCorrect,
  fetchLectureById,
} from "../../utils/api"
import type { RootState } from "../../store"
import style from "./TaskSolverPage.module.scss"

interface TaskData {
  id: string
  courseId: string
  title: string
  description: string
  meta: {
    type: string
    answer: string
    explanation: string
    topic?: string
    difficulty?: string
  }
  ord: number
}

interface LectureData {
  id: string
  title: string
  content: string
}

const TaskSolverPage = () => {
  const { courseId, taskId } = useParams<{
    courseId: string
    taskId: string
  }>()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [task, setTask] = useState<TaskData | null>(null)
  const [lectures, setLectures] = useState<LectureData[]>([])
  const [relatedLecture, setRelatedLecture] = useState<LectureData | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [checkStatus, setCheckStatus] = useState<{
    passed: boolean
    message: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setErrorState] = useState<string | null>(null)
  const { submitting } = useSelector((state: RootState) => state.solution)

  // Load task data
  useEffect(() => {
    const loadTask = async () => {
      setLoading(true)
      setErrorState(null)
      try {
        if (!courseId || !taskId) throw new Error("Missing course or task ID")

        const taskData = await fetchTask(courseId, taskId)
        if (!taskData) throw new Error("Task not found")

        // Parse meta if it's a string
        const meta =
          typeof taskData.meta === "string"
            ? JSON.parse(taskData.meta)
            : taskData.meta

        setTask({ ...taskData, meta })

        // Load lectures to find related material
        try {
          const lectData = await fetchLectures(courseId)
          setLectures(lectData)
          // Try to find a relevant lecture
          if (lectData.length > 0) {
            setRelatedLecture(lectData[0])
          }
        } catch (e) {
          // Lectures loading is optional
        }
      } catch (err: any) {
        setErrorState(err.message || "Error loading task")
      } finally {
        setLoading(false)
      }
    }

    if (courseId && taskId) {
      loadTask()
    }
  }, [courseId, taskId])

  const handleSubmit = async () => {
    if (!task || !userAnswer.trim()) return

    dispatch(setSubmitting(true))
    dispatch(clearError())
    setErrorState(null)

    try {
      // Create solution
      const solution = await createSolution(taskId!, {
        user_id: "demo-user",
        task_id: taskId!,
        code: userAnswer,
        created_at: Date.now(),
      })

      // Check if answer is correct
      const correct = isAnswerCorrect(userAnswer, task.meta.answer)

      // Create check result
      const checkResult = await createCheckResult(solution.id, {
        solution_id: solution.id,
        status: correct ? "passed" : "failed",
        time_ms: Math.random() * 100,
        passed_tests: correct ? 1 : 0,
        error_message: correct ? null : "Answer does not match expected result",
      })

      setCheckStatus({
        passed: correct,
        message: correct
          ? "Отлично! Ваш ответ правильный"
          : "Ответ неправильный. Попробуйте ещё раз или посмотрите подсказку",
      })

      // Update progress
      try {
        if (correct) {
          await updateProgressAPI("demo-user", taskId!, "completed")
        } else {
          await updateProgressAPI("demo-user", taskId!, "in_progress")
        }
      } catch (e) {
        // Progress update is optional
      }

      // Store solution in Redux
      dispatch(addSolution(solution))
      dispatch(
        setCheckResults({ solutionId: solution.id, results: [checkResult] })
      )

      setSubmitted(true)
    } catch (err: any) {
      const errorMsg = err.message || "Error submitting solution"
      setErrorState(errorMsg)
      dispatch(setError(errorMsg))
    } finally {
      dispatch(setSubmitting(false))
    }
  }

  const handleLectureClick = () => {
    if (relatedLecture) {
      navigate(`/lecture/${relatedLecture.id}`, {
        state: { lecture: relatedLecture },
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка задачи...</p>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-red-600 mb-4">{error || "Task not found"}</p>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
            >
              Вернуться
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={style.solverPage}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft size={20} />
          Вернуться
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
        <div className="w-20"></div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Statement Card */}
          <Card className="border-l-4 border-l-blue-600">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                Условие задачи
              </h2>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {task.description}
              </p>
            </CardContent>
          </Card>

          {/* Solution Input Card */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                Ваше решение
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <Textarea
                placeholder="Введите ваше решение..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={submitted && checkStatus?.passed}
                className="min-h-40 font-mono text-sm"
              />

              {checkStatus && (
                <div
                  className={`p-4 rounded-lg flex items-center gap-3 ${
                    checkStatus.passed
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  {checkStatus.passed ? (
                    <CheckCircle className="text-green-600" size={24} />
                  ) : (
                    <XCircle className="text-red-600" size={24} />
                  )}
                  <p
                    className={
                      checkStatus.passed
                        ? "text-green-700 font-medium"
                        : "text-red-700 font-medium"
                    }
                  >
                    {checkStatus.message}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !userAnswer.trim() ||
                    submitting ||
                    (submitted && checkStatus?.passed)
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? "Проверка..." : "Проверить ответ"}
                </Button>

                {checkStatus?.passed && (
                  <Button
                    onClick={() => navigate("/")}
                    variant="outline"
                    className="flex-1"
                  >
                    К другим задачам
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Task Info Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Информация
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {task.meta.topic && (
                <div>
                  <p className="text-sm text-gray-600">Тема</p>
                  <p className="font-medium text-gray-900">{task.meta.topic}</p>
                </div>
              )}
              {task.meta.difficulty && (
                <div>
                  <p className="text-sm text-gray-600">Сложность</p>
                  <div className="mt-1">
                    <Badge
                      variant={
                        task.meta.difficulty === "Easy"
                          ? "outline"
                          : task.meta.difficulty === "Medium"
                          ? "outline"
                          : "outline"
                      }
                    >
                      {task.meta.difficulty}
                    </Badge>
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Тип</p>
                <p className="font-medium text-gray-900">
                  {task.meta.type || "Текстовая задача"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Hint Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Lightbulb size={20} className="text-yellow-500" />
                Подсказка
              </h3>
            </CardHeader>
            <CardContent>
              {!showHint ? (
                <Button
                  onClick={() => setShowHint(true)}
                  variant="outline"
                  className="w-full"
                >
                  Показать подсказку
                </Button>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    {task.meta.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Theory Card */}
          {relatedLecture && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen size={20} className="text-purple-600" />
                  Теория
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Рекомендуемый материал для изучения:
                </p>
                <Button
                  onClick={handleLectureClick}
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <span className="truncate">📖 {relatedLecture.title}</span>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Progress Card */}
          {submitted && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock size={20} className="text-blue-600" />
                  Результат
                </h3>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Статус:</span>
                  <span
                    className={
                      checkStatus?.passed
                        ? "text-green-600 font-bold"
                        : "text-red-600 font-bold"
                    }
                  >
                    {checkStatus?.passed ? "Решено" : "Не решено"}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskSolverPage
