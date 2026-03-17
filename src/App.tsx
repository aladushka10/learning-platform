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
import { Header } from "./components/Header/Header"
import { Sidebar } from "./components/Sidebar/Sidebar"
import { TaskCard } from "./components/TaskCard/TaskCard"
import { TaskView } from "./components/TaskView/TaskView"
import { ProgressPanel } from "./components/ProgressPanel/ProgressPanel"
import { Footer } from "./components/Footer/Footer"
import TaskSolverPage from "./Pages/TaskSolverPage/TaskSolverPage"
import CodeTaskPage from "./Pages/CodeTaskPage/CodeTaskPage"
import LecturePage from "./Pages/LecturePage/LecturePage"
import TheoryPage from "./Pages/TheoryPage/TheoryPage"
import ProfilePage from "./Pages/ProfilePage/ProfilePage"
import AchievementsPage from "./Pages/AchievementsPage/AchievementsPage"
import QuizPage from "./Pages/QuizPage/QuizPage"
import SignIn from "./Pages/SignIn/SignIn"
import SignUp from "./Pages/SignUp/SignUp"
import { hydrateAuth } from "./store/signInSlice"
import { Loader, Skeleton, Title } from "@mantine/core"
import { useUserProgress } from "./services/progress/progress.hooks"

export interface Task {
  id: string
  title: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  category: "Mathematics" | "Computer Science"
  topic: string
  completed: boolean
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchParams, setSearchParams] = useSearchParams()
  const auth = useSelector((state: any) => state.signIn?.auth)
  const userIdFromStore = useSelector(
    (state: any) => state.signIn?.userId as string | undefined,
  )
  const effectiveUserId = auth && userIdFromStore ? userIdFromStore : null

  const [courses, setCourses] = useState<Course[]>([])
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

  const { data: statsData, isLoading: progressLoading } =
    useUserProgress(effectiveUserId)

  const userStats =
    effectiveUserId && statsData
      ? {
          streakDays: statsData.streakDays ?? 0,
          achievements: statsData.achievements ?? [],
        }
      : null
  const progressPanelLoading =
    loading || (!!effectiveUserId && (!statsData || progressLoading))

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
          const initial = exists ? (fromQuery as string) : data[0].id
          setSelectedCourseId(initial)
          const next = new URLSearchParams(searchParams)
          next.set("course", initial)
          setSearchParams(next, { replace: true })
        }
      } catch (e: any) {
        setError(e.message || "error")
      } finally {
        setLoading(false)
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

        // Загружаем прогресс только для авторизованного пользователя
        let userProgress = null
        if (effectiveUserId) {
          userProgress = statsData?.tasks || []
        }

        // map backend task shape to client Task
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

          // Check if task is completed in user progress
          const taskProgress = userProgress?.find((p: any) => p.taskId === t.id)
          const isCompleted = taskProgress?.status === "completed"

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="flex flex-1">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          // you can expand Sidebar component later to show courses
        />

        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "ml-16" : "ml-64"
          }`}
        >
          <div className="flex gap-6 p-6 max-w-7xl mx-auto">
            <div className="flex-1">
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
                                <Skeleton
                                  height={20}
                                  width="80%"
                                  radius="sm"
                                  mb={15}
                                />
                                <Skeleton height={18} width="90%" radius="sm" />
                              </div>

                              <div className="mt-4 flex justify-end w-full">
                                <div className="flex flex-wrap justify-end gap-3">
                                  {Array.from({ length: 4 }).map(
                                    (_, badgeIdx) => (
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
                                    ),
                                  )}
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
                              <Skeleton
                                height={16}
                                width="40%"
                                radius="sm"
                                mb={8}
                              />
                              <div className="space-y-2">
                                <Skeleton
                                  height={14}
                                  width="100%"
                                  radius="sm"
                                />
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
                  {error && <p className="text-red-600">{error}</p>}

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
                          <Title order={2}>Библиотека задач</Title>
                          <p className="text-gray-600 mt-1">
                            Выберите курс и задачу для начала обучения
                          </p>
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
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
                        {filteredTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onSelect={handleTaskSelect}
                            courseId={selectedCourseId || ""}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <ProgressPanel
              tasks={tasks}
              userStats={userStats}
              recentAchievement={recentAchievement}
              onRecentAchievementClose={() => setRecentAchievement(null)}
              userStatsLoading={progressPanelLoading}
              tasksLoading={progressPanelLoading}
            />
          </div>
        </main>
      </div>

      <Footer />
    </div>
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
        <Route
          path="/theory"
          element={
            <ProtectedRoute>
              <TheoryPage />
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
