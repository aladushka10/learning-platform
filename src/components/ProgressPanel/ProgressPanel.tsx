import { Trophy, Target, Flame, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Progress } from "../ui/progress"
import type { Task } from "../../App"

interface UserStats {
  streakDays?: number
  achievements?: { id: string; name: string; description: string; icon: string; unlockedAt: number | null }[]
  recentAchievements?: { id: string; name: string; description: string; icon: string; unlockedAt: number }[]
}

interface ProgressPanelProps {
  tasks: Task[]
  userStats?: UserStats | null
}

export function ProgressPanel({ tasks, userStats }: ProgressPanelProps) {
  const completedTasks = tasks.filter((t) => t.completed).length
  const totalTasks = tasks.length
  const progressPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const mathTasks = tasks.filter((t) => t.category === "Mathematics")
  const csTasks = tasks.filter((t) => t.category === "Computer Science")
  const completedMath = mathTasks.filter((t) => t.completed).length
  const completedCS = csTasks.filter((t) => t.completed).length

  const streakDays = userStats?.streakDays ?? 0
  const achievementsUnlocked = userStats?.achievements?.filter((a) => a.unlockedAt != null).length ?? 0
  const recentAchievements = userStats?.recentAchievements ?? []

  const stats = [
    {
      icon: Target,
      label: "Задач выполнено",
      value: completedTasks,
      total: totalTasks,
      color: "text-blue-600",
    },
    {
      icon: Flame,
      label: "Дней подряд",
      value: String(streakDays),
      total: "дней",
      color: "text-orange-500",
    },
    {
      icon: Trophy,
      label: "Достижения",
      value: String(achievementsUnlocked),
      total: "получено",
      color: "text-yellow-600",
    },
  ]

  return (
    <div className="w-80 space-y-4 flex-shrink-0">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-gray-900">Ваш прогресс</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">Общий прогресс</span>
              <span className="text-gray-900">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-gray-500 mt-2">
              {completedTasks} из {totalTasks} задач выполнено
            </p>
          </div>

          <div className="space-y-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center ${stat.color}`}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">{stat.label}</p>
                  <p className="text-gray-900">
                    {stat.value}{" "}
                    {typeof stat.total === "string"
                      ? stat.total
                      : `/ ${stat.total}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-gray-900">По категориям</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">Математика</span>
              <span className="text-gray-600">
                {completedMath}/{mathTasks.length}
              </span>
            </div>
            <Progress
              value={
                mathTasks.length > 0
                  ? (completedMath / mathTasks.length) * 100
                  : 0
              }
              className="h-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">Информатика</span>
              <span className="text-gray-600">
                {completedCS}/{csTasks.length}
              </span>
            </div>
            <Progress
              value={
                csTasks.length > 0 ? (completedCS / csTasks.length) * 100 : 0
              }
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-gray-900">Недавние достижения</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentAchievements.length > 0 ? (
            recentAchievements.map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl">
                  {a.icon || "🏆"}
                </div>
                <div>
                  <p className="text-gray-900">{a.name}</p>
                  <p className="text-gray-500 text-sm">{a.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">
              Решайте задачи и собирайте серии дней подряд, чтобы получать достижения.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
