import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { IconArrowLeft, IconChartLine } from "@tabler/icons-react"
import {
  Box,
  Container,
  Group,
  Loader,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { AppButton } from "../../components/AppButton/AppButton"
import { useUserProgress } from "../../services/progress/progress.hooks"
import { useTaskCategoryById } from "../../hooks/useTaskCategoryById"

type RangeKey = "7d" | "30d" | "90d"
type StatusKey = "completed" | "in_progress" | "not_started"
type CategoryKey = "all" | "math" | "cs"
type DonutViewKey = "categories" | "all"

const COMPLETED_COLOR_BY_CATEGORY: Record<CategoryKey, string> = {
  all: "#ff6f00",
  math: "#228be6",
  cs: "#12b886",
}

const STATUS_COLORS: Record<Exclude<StatusKey, "completed">, string> = {
  in_progress: "#ff2828",
  not_started: "#ced4da",
}

function LineLegend({ payload }: { payload?: any[] }) {
  if (!payload || payload.length === 0) return null

  return (
    <Group gap="md" wrap="wrap" justify="flex-start" pb="15">
      {payload.map((entry) => {
        const label = String(entry?.value ?? "")
        const color = String(entry?.color ?? "#000")
        return (
          <Group
            key={String(entry?.dataKey ?? label)}
            gap={8}
            wrap="nowrap"
            mb="10"
          >
            <Box
              w={10}
              h={10}
              style={{ borderRadius: 100, backgroundColor: color }}
            />
            <Text size="sm" c="dimmed" m="0">
              {label}
            </Text>
          </Group>
        )
      })}
    </Group>
  )
}

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: any[]
}) {
  if (!active || !payload || payload.length === 0) return null
  const p = payload[0]?.payload
  const name = String(p?.name ?? "")
  const value = typeof p?.value === "number" ? p.value : 0

  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <div className="text-sm font-medium text-gray-900">{name}</div>
      <div className="text-xs text-gray-600">Количество: {value}</div>
    </div>
  )
}

function toDayKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function toLabel(d: Date) {
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })
}

const ProgressPage = () => {
  const navigate = useNavigate()
  const userId = useSelector((s: any) => s.signIn?.userId) as string | null
  const { courseId } = useParams<{ courseId: string; taskId: string }>()

  const [range, setRange] = useState<RangeKey>("30d")
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30

  const { data, isLoading, error } = useUserProgress(userId)

  const needsCategoryFallback = useMemo(() => {
    const raw = data?.tasks ?? []
    return raw.some((t: any) => t && t.taskId && t.category == null)
  }, [data?.tasks])
  const { mapping: categoryById } = useTaskCategoryById(needsCategoryFallback)

  const chartData = useMemo(() => {
    const tasks = data?.tasks ?? []
    const byDayMath = new Map<string, number>()
    const byDayCs = new Map<string, number>()
    let baselineMath = 0
    let baselineCs = 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const rangeStart = new Date(today)
    rangeStart.setDate(today.getDate() - (days - 1))

    tasks.forEach((t: any) => {
      if (t?.status !== "completed") return
      if (typeof t?.updatedAt !== "number") return
      const d = new Date(t.updatedAt)
      d.setHours(0, 0, 0, 0)
      const key = toDayKey(d)
      const category: "math" | "cs" =
        t.category ?? categoryById[t.taskId] ?? "cs"
      if (d < rangeStart) {
        if (category === "math") baselineMath += 1
        else baselineCs += 1
        return
      }
      if (category === "math") {
        byDayMath.set(key, (byDayMath.get(key) ?? 0) + 1)
      } else {
        byDayCs.set(key, (byDayCs.get(key) ?? 0) + 1)
      }
    })

    let cumulativeMath = baselineMath
    let cumulativeCs = baselineCs
    const out: {
      date: string
      label: string
      cumulativeMath: number
      cumulativeCs: number
    }[] = []

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = toDayKey(d)
      cumulativeMath += byDayMath.get(key) ?? 0
      cumulativeCs += byDayCs.get(key) ?? 0
      out.push({
        date: key,
        label: toLabel(d),
        cumulativeMath,
        cumulativeCs,
      })
    }

    return out
  }, [data?.tasks, days, categoryById])

  const normalizedTasks = useMemo(() => {
    const raw = data?.tasks ?? []
    const unique = new Map<
      string,
      { taskId: string; status: StatusKey; category?: "math" | "cs" }
    >()
    raw.forEach((t: any) => {
      if (!t?.taskId) return
      const status: StatusKey =
        t.status === "completed" || t.status === "in_progress"
          ? t.status
          : "not_started"
      unique.set(t.taskId, {
        taskId: t.taskId,
        status,
        category: t.category ?? categoryById[t.taskId],
      })
    })
    return Array.from(unique.values())
  }, [data?.tasks, categoryById])

  const totalTasks = normalizedTasks.length
  const completedTasks = normalizedTasks.filter(
    (t) => t.status === "completed",
  ).length
  const inProgressTasks = normalizedTasks.filter(
    (t) => t.status === "in_progress",
  ).length
  const notStartedTasks = normalizedTasks.filter(
    (t) => t.status === "not_started",
  ).length
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const streakDays = data?.streakDays ?? 0
  const [donutView, setDonutView] = useState<DonutViewKey>("categories")

  const statsByCategory = useMemo(() => {
    const by: Record<
      CategoryKey,
      Record<StatusKey, number> & { total: number }
    > = {
      all: { completed: 0, in_progress: 0, not_started: 0, total: 0 },
      math: { completed: 0, in_progress: 0, not_started: 0, total: 0 },
      cs: { completed: 0, in_progress: 0, not_started: 0, total: 0 },
    }

    normalizedTasks.forEach((t) => {
      const cat: "math" | "cs" = t.category ?? "cs"

      by.all[t.status] += 1
      by.all.total += 1

      by[cat][t.status] += 1
      by[cat].total += 1
    })

    return by
  }, [normalizedTasks])

  const donutData = (key: CategoryKey) => {
    const s = statsByCategory[key]
    return [
      {
        name: "Выполнено",
        value: s.completed,
        color: COMPLETED_COLOR_BY_CATEGORY[key],
        status: "completed" as const,
      },
      {
        name: "В процессе",
        value: s.in_progress,
        color: STATUS_COLORS.in_progress,
        status: "in_progress" as const,
      },
      {
        name: "Не начато",
        value: s.not_started,
        color: STATUS_COLORS.not_started,
        status: "not_started" as const,
      },
    ].filter((x) => x.value > 0)
  }

  const handleDonutClick = (category: CategoryKey, payload: any) => {
    if (category !== "math" && category !== "cs") return
    const status: StatusKey | null =
      payload?.status === "completed" ||
      payload?.status === "in_progress" ||
      payload?.status === "not_started"
        ? payload.status
        : null
    if (!status) return

    navigate(`/?type=${category}&status=${status}&sort=recent`)
    window.scrollTo(0, 0)
  }

  return (
    <Container size="lg" py="xl" className="min-h-screen">
      <Stack gap="xl">
        <Group justify="space-between" wrap="nowrap">
          <Box
            style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}
          >
            <AppButton
              variant="subtle"
              size="md"
              leftSection={<IconArrowLeft size={20} />}
              onClick={() => {
                navigate(`/?course=${courseId || ""}`)
                window.scrollTo(0, 0)
              }}
            >
              Вернуться
            </AppButton>
          </Box>
          <Group gap="sm" align="center">
            <IconChartLine size={26} className="text-blue-600" />
            <Title order={2}>Прогресс</Title>
          </Group>
        </Group>

        <Paper
          withBorder
          radius="lg"
          p="xl"
          className="bg-white border-gray-100 shadow-sm"
        >
          <Group justify="space-between" align="center" mb="md">
            <Stack gap={2}>
              <Title order={4}>Распределение задач</Title>
              <Text size="sm" c="dimmed">
                Выполнено / в процессе / не начато — по категориям или по всем.
              </Text>
            </Stack>
            <SegmentedControl
              value={donutView}
              onChange={(v) => setDonutView(v as DonutViewKey)}
              data={[
                { label: "По категориям", value: "categories" },
                { label: "Все задачи", value: "all" },
              ]}
            />
          </Group>

          <SimpleGrid
            cols={{ base: 1, md: donutView === "all" ? 1 : 2 }}
            spacing="lg"
          >
            {(donutView === "all"
              ? ([{ key: "all" as const, title: "Все задачи" }] as const)
              : ([
                  { key: "math" as const, title: "Математика" },
                  { key: "cs" as const, title: "Информатика" },
                ] as const)
            ).map((item) => {
              const s = statsByCategory[item.key]
              const d = donutData(item.key)

              return (
                <Paper key={item.key} withBorder radius="lg" p="lg">
                  <Stack gap="sm" align="center">
                    <Title order={5}>{item.title}</Title>

                    <Group align="center" justify="space-between" wrap="nowrap">
                      <Box h={180} w={180} className="donut-chart">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Tooltip
                              content={<PieTooltip />}
                              isAnimationActive={false}
                              wrapperStyle={{ transition: "none" }}
                            />
                            <Pie
                              data={d}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={58}
                              outerRadius={82}
                              paddingAngle={2}
                              isAnimationActive
                              animationDuration={800}
                              onClick={(_, idx) => {
                                const entry = d[idx]
                                handleDonutClick(item.key, entry)
                              }}
                              onMouseDown={(_, __, e: any) => {
                                e?.preventDefault?.()
                              }}
                              onTouchStart={(_, __, e: any) => {
                                e?.preventDefault?.()
                              }}
                              style={{
                                cursor:
                                  item.key === "math" || item.key === "cs"
                                    ? "pointer"
                                    : "default",
                              }}
                            >
                              {d.map((entry, idx) => (
                                <Cell key={idx} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>

                      <Stack gap={6} style={{ flex: 1 }}>
                        <Text size="sm" c="dimmed">
                          Всего:{" "}
                          <Text span c="dark" fw={700}>
                            {s.total}
                          </Text>
                        </Text>
                        <Text size="sm" c="dimmed">
                          Выполнено:{" "}
                          <Text span c="dark" fw={700}>
                            {s.completed}
                          </Text>
                        </Text>
                        <Text size="sm" c="dimmed">
                          В процессе:{" "}
                          <Text span c="dark" fw={700}>
                            {s.in_progress}
                          </Text>
                        </Text>
                        <Text size="sm" c="dimmed">
                          Не начато:{" "}
                          <Text span c="dark" fw={700}>
                            {s.not_started}
                          </Text>
                        </Text>
                      </Stack>
                    </Group>
                  </Stack>
                </Paper>
              )
            })}
          </SimpleGrid>
        </Paper>

        <Paper
          withBorder
          radius="lg"
          p="xl"
          className="bg-white border-gray-100 shadow-sm"
        >
          <Group justify="space-between" align="center" mb="md">
            <Stack gap={2}>
              <Title order={4}>Динамика выполнения</Title>
            </Stack>
            <SegmentedControl
              value={range}
              onChange={(v) => setRange(v as RangeKey)}
              data={[
                { label: "7 дней", value: "7d" },
                { label: "30 дней", value: "30d" },
                { label: "90 дней", value: "90d" },
              ]}
            />
          </Group>

          {isLoading ? (
            <Group justify="center" py="xl">
              <Loader />
            </Group>
          ) : error ? (
            <Text c="red" size="sm">
              Не удалось загрузить прогресс
            </Text>
          ) : (
            <Box h={320}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  key={`${range}-${data?.tasks?.length ?? 0}`}
                  data={chartData}
                  margin={{ left: 0, right: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickMargin={8} />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    formatter={(value: any, name: any) => {
                      const key = String(name ?? "")
                      if (key === "cumulativeMath") return [value, "Математика"]
                      if (key === "cumulativeCs") return [value, "Информатика"]
                      return [value, key]
                    }}
                    labelFormatter={(label: any) => `Дата: ${label}`}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    content={<LineLegend />}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativeMath"
                    stroke="#0088ff"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={650}
                    name="Математика"
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativeCs"
                    stroke="#12b886"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={650}
                    name="Информатика"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}

          <Text size="sm" c="dimmed" mt="md">
            Текущая завершённость: {completionRate}%
          </Text>
        </Paper>
      </Stack>
    </Container>
  )
}

export default ProgressPage
