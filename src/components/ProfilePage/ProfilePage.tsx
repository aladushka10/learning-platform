import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { ArrowLeft, Trophy, Calendar, BookOpen, Zap, Award } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader } from "../ui/card"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: number
}

const ProfilePage = () => {
  const navigate = useNavigate()
  const { username } = useSelector((state: any) => state.signIn)

  // Demo data - в реальном приложении это будет из API
  const stats = {
    tasksCompleted: 7,
    tasksInProgress: 3,
    streakDays: 14,
    totalPoints: 2450,
    level: 5,
  }

  const achievements: Achievement[] = [
    {
      id: "1",
      name: "Первый шаг",
      description: "Решить первую задачу",
      icon: "🎯",
      unlockedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    },
    {
      id: "2",
      name: "Неделя активности",
      description: "Решать задачи 7 дней подряд",
      icon: "🔥",
      unlockedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    },
    {
      id: "3",
      name: "Эксперт",
      description: "Достичь уровня 5",
      icon: "⭐",
      unlockedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    },
    {
      id: "4",
      name: "Спидран",
      description: "Решить задачу быстрее 1 минуты",
      icon: "⚡",
    },
    {
      id: "5",
      name: "Перфекционист",
      description: "Решить все задачи в курсе без ошибок",
      icon: "💎",
    },
  ]

  const activityData = [
    { day: "Пн", solved: 2 },
    { day: "Вт", solved: 3 },
    { day: "Ср", solved: 1 },
    { day: "Чт", solved: 2 },
    { day: "Пт", solved: 3 },
    { day: "Сб", solved: 2 },
    { day: "Вс", solved: 1 },
  ]

  const maxSolved = Math.max(...activityData.map((d) => d.solved))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft size={20} />К задачам
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
              <div className="text-6xl">🎓</div>
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
                <p className="text-3xl font-bold">{stats.streakDays} 🔥</p>
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
                <BookOpen size={24} className="text-blue-600" />
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
                    <span className="text-gray-700 font-medium">
                      Высшая математика
                    </span>
                    <span className="text-gray-600">7 из 10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "70%" }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 font-medium">
                      Программирование
                    </span>
                    <span className="text-gray-600">5 из 8</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: "62.5%" }}
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
                <Calendar size={24} className="text-green-600" />
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
              <Trophy size={24} className="text-yellow-500" />
              Достижения
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                    achievement.unlockedAt
                      ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 hover:shadow-lg"
                      : "bg-gray-50 border-gray-300 opacity-60"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {achievement.name}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {achievement.description}
                    </p>
                  </div>

                  {achievement.unlockedAt && (
                    <div className="absolute top-2 right-2">
                      <Award
                        size={16}
                        className="text-yellow-500"
                        fill="currentColor"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Zap size={24} className="text-orange-500" />
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
