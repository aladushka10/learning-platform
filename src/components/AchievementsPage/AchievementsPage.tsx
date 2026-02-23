import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { IconArrowLeft, IconTrophy, IconAward } from "@tabler/icons-react"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Button } from "../ui/button"
import { renderAchievementIcon } from "../../utils/achievementIcons"

const API_BASE = "/api"

interface AchievementItem {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: number | null
}

export default function AchievementsPage() {
  const navigate = useNavigate()
  const { auth, userId } = useSelector((state: any) => state.signIn)
  const effectiveUserId = auth ? userId : null

  const [achievements, setAchievements] = useState<AchievementItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!effectiveUserId) {
      setAchievements([])
      setLoading(false)
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/${effectiveUserId}/stats`)
        if (!res.ok) throw new Error("Failed to load")
        const data = await res.json()
        if (!cancelled) {
          setAchievements(data.achievements ?? [])
        }
      } catch {
        if (!cancelled) {
          setAchievements([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [effectiveUserId])

  const unlockedCount = achievements.filter((a) => a.unlockedAt != null).length
  const totalCount = achievements.length

  if (!auth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <IconTrophy className="w-16 h-16 mx-auto text-amber-500 mb-4" />
            <p className="text-gray-600 mb-4">
              Войдите в аккаунт, чтобы видеть свои достижения.
            </p>
            <Button onClick={() => navigate("/sign-in")}>Войти</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
        <p className="text-gray-600">Загрузка достижений...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <IconArrowLeft size={20} /> К задачам
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Достижения</h1>
          <div className="w-24" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Сводка */}
        <Card className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <IconTrophy className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {unlockedCount} из {totalCount}
                  </h2>
                  <p className="text-amber-100">достижений получено</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%</p>
                <p className="text-amber-100 text-sm">прогресс</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Все достижения */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <IconTrophy className="w-6 h-6 text-amber-500" />
              Достижения
            </h3>
          </CardHeader>
          <CardContent>
            {achievements.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Список достижений загружается. Решайте задачи и собирайте серии дней, чтобы получать награды.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {achievements.map((a) => (
                  <div
                    key={a.id}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                      a.unlockedAt
                        ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-sm hover:shadow-md"
                        : "bg-gray-50 border-gray-200 opacity-80"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl flex-shrink-0">
                        {renderAchievementIcon(
                          a.icon,
                          a.unlockedAt != null,
                          28,
                          a.unlockedAt ? "text-amber-600" : "text-gray-500",
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {a.name}
                        </h4>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {a.description}
                        </p>
                        {a.unlockedAt && (
                          <p className="text-xs text-amber-600 mt-2">
                            Получено{" "}
                            {new Date(a.unlockedAt).toLocaleDateString("ru-RU")}
                          </p>
                        )}
                      </div>
                    </div>
                    {a.unlockedAt && (
                      <div className="absolute top-2 right-2">
                        <IconAward
                          size={18}
                          className="text-amber-500"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
