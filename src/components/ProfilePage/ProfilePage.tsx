import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  IconArrowLeft,
  IconTrophy,
  IconCalendar,
  IconBook,
  IconBolt,
  IconAward,
  IconSchool,
  IconFlame,
} from "@tabler/icons-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Loader } from "@mantine/core"
import { renderAchievementIcon } from "../../utils/achievementIcons"

const API_BASE = "/api"

interface AchievementItem {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: number | null
}

interface StatsResponse {
  completedTasks: number
  inProgressTasks: number
  totalTasks: number
  streakDays: number
  achievements: AchievementItem[]
}

const ProfilePage = () => {
  const navigate = useNavigate()
  const { username, userId, auth } = useSelector((state: any) => state.signIn)
  const effectiveUserId = auth ? userId : null

  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!effectiveUserId) {
      setStats(null)
      setLoading(false)
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/${effectiveUserId}/stats`)
        if (!res.ok) throw new Error("Failed to load stats")
        const data = await res.json()
        if (!cancelled) setStats(data)
      } catch {
        if (!cancelled) setStats(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [effectiveUserId])

  const tasksCompleted = stats?.completedTasks ?? 0
  const tasksInProgress = stats?.inProgressTasks ?? 0
  const streakDays = stats?.streakDays ?? 0
  const totalTasks = stats?.totalTasks ?? 0
  const totalPoints = Math.min(3000, tasksCompleted * 150)
  const level = Math.floor(totalPoints / 300) + 1
  const achievements = stats?.achievements ?? []

  const activityData = [
    { day: "Пн", solved: 2 },
    { day: "Вт", solved: 3 },
    { day: "Ср", solved: 1 },
    { day: "Чт", solved: 2 },
    { day: "Пт", solved: 3 },
    { day: "Сб", solved: 2 },
    { day: "Вс", solved: 1 },
  ]
  const maxSolved = Math.max(1, ...activityData.map((d) => d.solved))

  if (!auth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Войдите в аккаунт, чтобы видеть прогресс и достижения.</p>
            <Button onClick={() => navigate("/sign-in")}>Войти</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader size="lg" />
          <p className="text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <IconArrowLeft size={20} />К задачам
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Профиль</h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Profile Header Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-4xl font-bold mb-2">
                  {username || "User"}
                </h2>
                <p className="text-blue-100 text-lg">Уровень {stats.level}</p>
              </div>
              <div className="text-6xl">
                <IconSchool size={56} />
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 mt-8">
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
                <p className="text-blue-100 text-sm">Решено задач</p>
                <p className="text-3xl font-bold">{stats.tasksCompleted}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
                <p className="text-blue-100 text-sm">В процессе</p>
                <p className="text-3xl font-bold">{stats.tasksInProgress}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
                <p className="text-blue-100 text-sm">Дневная серия</p>
                <p className="text-3xl font-bold inline-flex items-center gap-1">
                  {stats.streakDays}
                  <IconFlame size={26} />
                </p>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
                <p className="text-blue-100 text-sm">Очки</p>
                <p className="text-3xl font-bold">{stats.totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <IconBook size={24} className="text-blue-600" />
                Прогресс обучения
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Level Progress */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Уровень {stats.level}</span>
                  <span className="text-gray-600">
                    {stats.totalPoints}/3000 XP
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${(stats.totalPoints / 3000) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Course Progress */}
              <div className="space-y-3 mt-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 font-medium">Прогресс по задачам</span>
                    <span className="text-gray-600">{tasksCompleted} из {totalTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: totalTasks > 0 ? `${(tasksCompleted / totalTasks) * 100}%` : "0%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <IconCalendar size={24} className="text-green-600" />
                Активность на неделе
              </h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-40 gap-1">
                {activityData.map((data, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className="relative group">
                      <div
                        className="w-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all duration-300 hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                        style={{
                          height: `${(data.solved / maxSolved) * 100}px`,
                        }}
                      ></div>
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">
                        {data.solved} задач
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">
                      {data.day}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <IconTrophy size={24} className="text-yellow-500" />
              Достижения
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                      achievement.unlockedAt
                        ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 hover:shadow-lg"
                        : "bg-gray-50 border-gray-300 opacity-60"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2 flex justify-center">
                        {renderAchievementIcon(
                          achievement.icon,
                          achievement.unlockedAt != null,
                          32,
                          achievement.unlockedAt ? "text-amber-600" : "text-gray-500",
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {achievement.name}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.unlockedAt && (
                      <div className="absolute top-2 right-2">
                        <IconAward size={16} className="text-yellow-500" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-full">Пока нет достижений. Решайте задачи и собирайте серии дней!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <IconBolt size={24} className="text-orange-500" />
              Статистика
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-gray-600 text-sm">Всего решено</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.tasksCompleted}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-gray-600 text-sm">Текущая серия</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.streakDays} дн
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-gray-600 text-sm">Всего XP</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalPoints}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-gray-600 text-sm">Уровень</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.level}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProfilePage
