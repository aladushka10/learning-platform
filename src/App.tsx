import { useEffect, useState } from "react"
import { Header } from "./components/Header/Header"
import { Sidebar } from "./components/Sidebar/Sidebar"
import { TaskCard } from "./components/TaskCard/TaskCard"
import { TaskView } from "./components/TaskView/TaskView"
import { ProgressPanel } from "./components/ProgressPanel/ProgressPanel"
import { Footer } from "./components/Footer/Footer"

export interface Task {
  id: string
  title: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  category: "Mathematics" | "Computer Science"
  topic: string
  completed: boolean
}

interface Course {
  id: string
  title: string
  description?: string
  category?: string
}

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // load courses
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/courses")
        if (!res.ok) throw new Error("failed to load courses")
        const data: Course[] = await res.json()
        setCourses(data)
        if (data.length > 0) setSelectedCourseId(data[0].id)
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
            completed: !!(meta as any).completed,
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
  }, [selectedCourseId, courses])

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.topic.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task)
  }

  const handleBackToGrid = () => {
    setSelectedTask(null)
  }

  const handleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t))
    )
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, completed: true })
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
          <div className="flex gap-6 p-6 max-w-[1800px] mx-auto">
            <div className="flex-1">
              {loading && <p>Загрузка...</p>}
              {error && <p className="text-red-600">{error}</p>}

              {selectedTask ? (
                <TaskView
                  task={selectedTask}
                  onBack={handleBackToGrid}
                  onComplete={handleTaskComplete}
                />
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-gray-900">Библиотека задач</h1>
                      <p className="text-gray-600 mt-1">
                        Выберите курс и задачу для начала обучения
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={selectedCourseId ?? ""}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onSelect={handleTaskSelect}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <ProgressPanel tasks={tasks} />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
