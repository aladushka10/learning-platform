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
import TaskSolverPage from "./components/TaskSolverPage/TaskSolverPage"
import CodeTaskPage from "./components/CodeTaskPage/CodeTaskPage"
import LecturePage from "./components/LecturePage/LecturePage"
import ProfilePage from "./components/ProfilePage/ProfilePage"
import AchievementsPage from "./components/AchievementsPage/AchievementsPage"
import SignIn from "./Pages/SignIn/SignIn"
import SignUp from "./Pages/SignUp/SignUp"
import { hydrateAuth } from "./store/signInSlice"
import { useUserProgress } from "./hooks/useUserProgress"
import { Title } from "@mantine/core"

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
}

interface Course {
  id: string
  title: string
  description?: string
  category?: string
}

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useSelector((state: any) => state.signIn?.auth) as boolean
  const initialized = useSelector(
    (state: any) => state.signIn?.initialized,
  ) as boolean

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Загрузка...</p>
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

  // Только прогресс пользователя грузим через React Query
  const { data: statsData } = useUserProgress(effectiveUserId)

  const userStats = effectiveUserId
    ? {
        streakDays: statsData?.streakDays ?? 0,
        achievements: statsData?.achievements ?? [],
      }
    : null

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
        const res = await fetch(`/api/courses/${selectedCourseId}/tasks`)
        if (!res.ok) throw new Error("failed to load tasks")
        const rawTasks = await res.json()

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
            topic: (meta as any).topic || (course && course.title) || "",
            completed: isCompleted,
            taskType: (meta as any).type,
            language: (meta as any).language,
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
              {loading && <p>Загрузка...</p>}
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
            </div>

            <ProgressPanel
              tasks={tasks}
              userStats={userStats}
              recentAchievement={recentAchievement}
              onRecentAchievementClose={() => setRecentAchievement(null)}
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
          path="/lecture/:lectureId"
          element={
            <ProtectedRoute>
              <LecturePage />
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
