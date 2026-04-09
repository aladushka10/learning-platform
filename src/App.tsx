import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useQueryClient } from "@tanstack/react-query"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useSearchParams,
} from "react-router-dom"
import { useDispatch } from "react-redux"
import { TaskCard } from "./components/TaskCard/TaskCard"
import { TaskView } from "./components/TaskView/TaskView"
import { ProgressPanel } from "./components/ProgressPanel/ProgressPanel"
import TaskSolverPage from "./Pages/TaskSolverPage/TaskSolverPage"
import CodeTaskPage from "./Pages/CodeTaskPage/CodeTaskPage"
import LecturePage from "./Pages/LecturePage/LecturePage"
import TheoryPage from "./Pages/TheoryPage/TheoryPage"
import ProgressPage from "./Pages/ProgressPage/ProgressPage"
import ProfilePage from "./Pages/ProfilePage/ProfilePage"
import AchievementsPage from "./Pages/AchievementsPage/AchievementsPage"
import QuizPage from "./Pages/QuizPage/QuizPage"
import SignIn from "./Pages/SignIn/SignIn"
import SignUp from "./Pages/SignUp/SignUp"
import { hydrateAuth } from "./store/signInSlice"
import { Box, Loader, Skeleton, Title } from "@mantine/core"
import { useUserProgress } from "./services/progress/progress.hooks"
import { usePagination } from "./hooks/usePagination"
import { AppState } from "./components/AppState/AppState"
import { AppButton } from "./components/AppButton/AppButton"
import { AppLayout } from "./components/AppLayout/AppLayout"

export interface Task {
  id: string
  title: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  category: "Mathematics" | "Computer Science"
  topic: string
  completed: boolean
  progressStatus?: "not_started" | "in_progress" | "completed"
  progressUpdatedAt?: number | null
  taskType?: string
  language?: string
  lectureTitle?: string | null
}

interface Course {
  id: string
  title: string
  description?: string
  category?: string
}

const formatLectureTitle = (title: string) =>
  title.replace(/^\d+\.\s*/, "").trim()

const resolveLectureTitle = (
  topic: string,
  lectureTitleByTopic: Record<string, string>,
) => {
  if (!topic) return null
  if (lectureTitleByTopic[topic]) return lectureTitleByTopic[topic]

  const topicNum = topic.match(/(\d+)$/)?.[1]
  if (!topicNum) return null

  const fallbackLectureId = Object.keys(lectureTitleByTopic).find(
    (lectureId) => lectureId.match(/(\d+)$/)?.[1] === topicNum,
  )

  return fallbackLectureId ? lectureTitleByTopic[fallbackLectureId] : null
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useSelector((state: any) => state.signIn?.auth) as boolean
  const initialized = useSelector(
    (state: any) => state.signIn?.initialized,
  ) as boolean

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader size="lg" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!auth) return <Navigate to="/sign-in" replace />

  return <>{children}</>
}

function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchParams, setSearchParams] = useSearchParams()
  const auth = useSelector((state: any) => state.signIn?.auth)
  const userIdFromStore = useSelector(
    (state: any) => state.signIn?.userId as string | undefined,
  )
  const effectiveUserId = auth && userIdFromStore ? userIdFromStore : null

  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoaded, setCoursesLoaded] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [recentAchievement, setRecentAchievement] = useState<{
    id: string
    name: string
    description: string
    icon?: string
    unlockedAt?: number | null
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const statusFilterParam = searchParams.get("status")
  const statusFilter =
    statusFilterParam === "completed" ||
    statusFilterParam === "in_progress" ||
    statusFilterParam === "not_started"
      ? (statusFilterParam as "completed" | "in_progress" | "not_started")
      : null

  const typeFilterParam = searchParams.get("type")
  const typeFilter =
    typeFilterParam === "math" || typeFilterParam === "cs"
      ? (typeFilterParam as "math" | "cs")
      : null

  const typeLabel =
    typeFilter === "math"
      ? "Математика"
      : typeFilter === "cs"
        ? "Программирование"
        : null
  const statusLabel =
    statusFilter === "completed"
      ? "Выполнено"
      : statusFilter === "in_progress"
        ? "В процессе"
        : statusFilter === "not_started"
          ? "Не начато"
          : null

  const typePhrase =
    typeFilter === "math"
      ? "по математике"
      : typeFilter === "cs"
        ? "по программированию"
        : null
  const statusPhrase =
    statusFilter === "completed"
      ? "Выполненные задачи"
      : statusFilter === "in_progress"
        ? "Задачи в процессе"
        : statusFilter === "not_started"
          ? "Не начатые задачи"
          : null

  const pageTitle =
    statusPhrase && typePhrase
      ? `${statusPhrase} ${typePhrase}`
      : typePhrase
        ? `Задачи ${typePhrase}`
        : statusPhrase
          ? statusPhrase
          : "Библиотека задач"
  const pageSubtitle =
    typeLabel || statusLabel
      ? "Список отфильтрован по выбранным параметрам прогресса."
      : "Выберите курс и задачу для начала обучения"

  const { data: statsData, isLoading: progressLoading } =
    useUserProgress(effectiveUserId)

  const userStats =
    effectiveUserId && statsData
      ? {
          streakDays: statsData.streakDays ?? 0,
          achievements: statsData.achievements ?? [],
          tasks: statsData.tasks ?? [],
        }
      : null
  const progressPanelLoading =
    loading || (!!effectiveUserId && (!statsData || progressLoading))

  const showErrorOverlay = coursesLoaded && !loading && Boolean(error)
  const showEmptyOverlay =
    coursesLoaded && !loading && !error && courses.length === 0

  useEffect(() => {
    // load courses
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/courses")
        if (!res.ok) throw new Error("failed to load courses")
        const data: Course[] = await res.json()
        setCourses(data)
        if (data.length > 0) {
          const fromQuery = searchParams.get("course")
          const exists = fromQuery && data.some((c) => c.id === fromQuery)
          const byType = typeFilter
            ? data.find((c) => {
                const isMath = String(c.category || "")
                  .toLowerCase()
                  .includes("math")
                return typeFilter === "math" ? isMath : !isMath
              })?.id
            : null
          const initial =
            (exists ? (fromQuery as string) : null) ?? byType ?? data[0].id
          setSelectedCourseId(initial)
          const next = new URLSearchParams(searchParams)
          next.set("course", initial)
          setSearchParams(next, { replace: true })
        }
      } catch (e: any) {
        setError(e.message || "error")
      } finally {
        setLoading(false)
        setCoursesLoaded(true)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedCourseId) {
      setTasks([])
      return
    }

    const loadTasks = async () => {
      setLoading(true)
      try {
        const [tasksRes, lecturesRes] = await Promise.all([
          fetch(`/api/courses/${selectedCourseId}/tasks`),
          fetch(`/api/courses/${selectedCourseId}/lectures`),
        ])
        if (!tasksRes.ok) throw new Error("failed to load tasks")
        const rawTasks = await tasksRes.json()
        const lectures: { id: string; title: string }[] = lecturesRes.ok
          ? await lecturesRes.json()
          : []
        const lectureTitleByTopic: Record<string, string> = {}
        lectures.forEach((l: any) => {
          lectureTitleByTopic[l.id] = formatLectureTitle(l.title || l.id)
        })

        let userProgress = null
        if (effectiveUserId) {
          userProgress = statsData?.tasks || []
        }

        const course = courses.find((c) => c.id === selectedCourseId)
        const mapped: Task[] = rawTasks.map((t: any) => {
          let meta = {}
          try {
            if (t.meta) {
              meta = typeof t.meta === "string" ? JSON.parse(t.meta) : t.meta
            }
          } catch (e) {
            meta = {}
          }
          const topic = (meta as any).topic || (course && course.title) || ""

          const taskProgress = userProgress?.find((p: any) => p.taskId === t.id)
          const progressStatus =
            taskProgress?.status === "completed" ||
            taskProgress?.status === "in_progress"
              ? (taskProgress.status as "completed" | "in_progress")
              : "not_started"
          const progressUpdatedAt =
            typeof taskProgress?.updatedAt === "number"
              ? taskProgress.updatedAt
              : null
          const isCompleted = progressStatus === "completed"

          return {
            id: t.id,
            title: t.title || "Без названия",
            description: t.description || "",
            difficulty: (meta as any).difficulty
              ? (meta as any).difficulty
              : "Easy",
            category:
              course &&
              course.category &&
              course.category.toLowerCase().includes("math")
                ? "Mathematics"
                : "Computer Science",
            topic,
            completed: isCompleted,
            progressStatus,
            progressUpdatedAt,
            taskType: (meta as any).type,
            language: (meta as any).language,
            lectureTitle: topic
              ? resolveLectureTitle(topic, lectureTitleByTopic)
              : null,
          }
        })

        setTasks(mapped)
      } catch (e: any) {
        setError(e.message || "error")
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [selectedCourseId, courses, effectiveUserId, statsData])

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.topic.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const statusFilteredTasks = statusFilter
    ? filteredTasks.filter(
        (t) => (t.progressStatus || "not_started") === statusFilter,
      )
    : filteredTasks

  // Keep backend order (ord ASC) without extra sorting.
  const sortedTasks = statusFilteredTasks
  const {
    displayedItems: visibleTasks,
    hasMore,
    loadMore,
    reset,
  } = usePagination(sortedTasks, 9)

  useEffect(() => {
    reset()
  }, [selectedCourseId, searchQuery, statusFilter, reset])

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task)
  }

  const handleBackToGrid = () => {
    setSelectedTask(null)
  }

  const handleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t)),
    )
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, completed: true })
    }
    if (effectiveUserId) {
      queryClient.invalidateQueries({
        queryKey: ["user-progress", effectiveUserId],
      })
    }
  }

  return (
    <AppLayout
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      aside={
        <ProgressPanel
          tasks={tasks}
          userStats={userStats}
          recentAchievement={recentAchievement}
          onRecentAchievementClose={() => setRecentAchievement(null)}
          userStatsLoading={progressPanelLoading}
          tasksLoading={progressPanelLoading}
        />
      }
    >
      {showErrorOverlay ? (
        <AppState
          title="Не удалось загрузить данные"
          actionLabel="Обновить страницу"
          onAction={() => window.location.reload()}
        />
      ) : showEmptyOverlay ? (
        <AppState
          title="Курсы не найдены"
          actionLabel="Обновить страницу"
          onAction={() => window.location.reload()}
        />
      ) : null}
      {loading && !selectedTask ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton height={28} width={260} radius="sm" mb={20} />
              <Skeleton mt={8} height={16} width={360} radius="sm" />
            </div>
            <Skeleton height={36} width={180} radius="md" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div
                key={idx}
                className="relative w-full h-[240px]"
                style={{ perspective: "1000px" }}
              >
                <div
                  className="relative w-full h-full"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div
                    className="absolute w-full h-full rounded-xl border border-gray-200 bg-white p-4 flex flex-col"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="absolute top-4 right-4">
                      <Skeleton height={24} width={24} circle />
                    </div>
                    <div className="flex flex-col h-full justify-between pt-4">
                      <div className="pr-7 min-w-0">
                        <Skeleton height={20} width="80%" radius="sm" mb={15} />
                        <Skeleton height={18} width="90%" radius="sm" />
                      </div>

                      <div className="mt-4 flex justify-end w-full">
                        <div className="flex flex-wrap justify-end gap-3">
                          {Array.from({ length: 4 }).map((_, badgeIdx) => (
                            <Skeleton
                              key={badgeIdx}
                              height={22}
                              width={
                                badgeIdx === 0
                                  ? 80
                                  : badgeIdx === 1
                                    ? 100
                                    : badgeIdx === 2
                                      ? 120
                                      : 80
                              }
                              radius="xl"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="absolute w-full h-full rounded-xl border border-gray-200 bg-white p-4 flex flex-col"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div className="flex-1 flex flex-col">
                      <Skeleton height={16} width="40%" radius="sm" mb={8} />
                      <div className="space-y-2">
                        <Skeleton height={14} width="100%" radius="sm" />
                        <Skeleton height={14} width="95%" radius="sm" />
                        <Skeleton height={14} width="90%" radius="sm" />
                        <Skeleton height={14} width="85%" radius="sm" />
                      </div>
                    </div>
                    <Skeleton height={36} width="100%" radius="md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {selectedTask ? (
            <TaskView
              task={selectedTask}
              onBack={handleBackToGrid}
              onComplete={handleTaskComplete}
              courseId={selectedCourseId || ""}
              userId={effectiveUserId}
              onAchievementUnlocked={(a) => setRecentAchievement(a)}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Title order={2}>{pageTitle}</Title>
                  <p className="text-gray-600 mt-1">{pageSubtitle}</p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={selectedCourseId ?? ""}
                    onChange={(e) => {
                      const value = e.currentTarget.value
                      setSelectedCourseId(value)
                      const next = new URLSearchParams(searchParams)
                      next.set("course", value)
                      setSearchParams(next, { replace: true })
                    }}
                    className="rounded-md border px-3 py-1"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter ?? ""}
                    onChange={(e) => {
                      const value = e.currentTarget.value
                      const next = new URLSearchParams(searchParams)
                      if (!value) next.delete("status")
                      else next.set("status", value)
                      setSearchParams(next, { replace: true })
                    }}
                    className="rounded-md border px-3 py-1"
                  >
                    <option value="">Все</option>
                    <option value="completed">Выполненные</option>
                    <option value="not_started">Невыполненные</option>
                    <option value="in_progress">В процессе</option>
                  </select>
                </div>
              </div>
              {showErrorOverlay ? (
                <div className="py-10 flex justify-center">
                  <AppState
                    title="Не удалось загрузить данные"
                    actionLabel="Обновить страницу"
                    onAction={() => window.location.reload()}
                  />
                </div>
              ) : showEmptyOverlay ? (
                <div className="py-10 flex justify-center">
                  <AppState
                    title="Курсы не найдены"
                    actionLabel="Обновить страницу"
                    onAction={() => window.location.reload()}
                  />
                </div>
              ) : sortedTasks.length === 0 ? (
                <Box className="py-16 min-h-[40vh] flex flex-col items-center justify-center gap-4 text-center">
                  <Title order={5} fw={400} m={0} mb={30}>
                    Таких задач пока нет
                  </Title>
                  <AppButton
                    onClick={() => {
                      const next = new URLSearchParams(searchParams)
                      next.delete("status")
                      setSearchParams(next, { replace: true })
                      setSearchQuery("")
                    }}
                  >
                    Сбросить фильтр
                  </AppButton>
                </Box>
              ) : null}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
                {visibleTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onSelect={handleTaskSelect}
                    courseId={selectedCourseId || ""}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={loadMore}
                    className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Показать больше
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </AppLayout>
  )
}

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    ;(dispatch as any)(hydrateAuth())
  }, [dispatch])

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <TheoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course/:courseId/task/:taskId"
          element={
            <ProtectedRoute>
              <TaskSolverPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course/:courseId/code/:taskId"
          element={
            <ProtectedRoute>
              <CodeTaskPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course/:courseId/quiz"
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecture/:lectureId"
          element={
            <ProtectedRoute>
              <LecturePage />
            </ProtectedRoute>
          }
        />
        <Route path="/theory" element={<Navigate to="/" replace />} />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <ProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/achievements"
          element={
            <ProtectedRoute>
              <AchievementsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
