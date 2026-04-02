import { useEffect, useState } from "react"
import {
  IconTrophy,
  IconTarget,
  IconFlame,
  IconTrendingUp,
} from "@tabler/icons-react"
import {
  Card,
  Group,
  Progress,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core"
import type { Task } from "../../App"
import { renderAchievementIcon } from "../../utils/achievementIcons"
import { AchievementsList } from "../Achievements/AchievementsList"
import { CategoryProgressBars } from "../Progress/CategoryProgressBars"

interface UserStats {
  streakDays?: number
  achievements?: {
    id: string
    name: string
    description: string
    icon: string
    unlockedAt: number | null
  }[]
  tasks?: {
    taskId: string
    taskTitle?: string
    category?: "math" | "cs"
    status: string
    updatedAt?: number | null
  }[]
}

interface ProgressPanelProps {
  tasks: Task[]
  userStats?: UserStats | null
  recentAchievement?: {
    id: string
    name: string
    description: string
    icon?: string
    unlockedAt?: number | null
  } | null
  onRecentAchievementClose?: () => void
  userStatsLoading?: boolean
  tasksLoading?: boolean
}

export function ProgressPanel({
  tasks,
  userStats,
  recentAchievement,
  onRecentAchievementClose,
  userStatsLoading = false,
  tasksLoading = false,
}: ProgressPanelProps) {
  const [banner, setBanner] = useState<{
    id: string
    name: string
    description: string
    icon?: string
  } | null>(null)

  useEffect(() => {
    if (!recentAchievement) return
    setBanner({
      id: recentAchievement.id,
      name: recentAchievement.name,
      description: recentAchievement.description,
      icon: recentAchievement.icon,
    })
  }, [recentAchievement])

  useEffect(() => {
    if (!banner) return
    const t = setTimeout(() => {
      setBanner(null)
      onRecentAchievementClose?.()
    }, 6000)
    return () => clearTimeout(t)
  }, [banner, onRecentAchievementClose])

  const completedTasks = tasks.filter((t) => t.completed).length
  const totalTasks = tasks.length
  const progressPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const statsTasks = userStats?.tasks
  const categorySource = Array.isArray(statsTasks) ? statsTasks : null
  const mathTotal = categorySource
    ? categorySource.filter((t) => t.category === "math").length
    : tasks.filter((t) => t.category === "Mathematics").length
  const csTotal = categorySource
    ? categorySource.filter((t) => t.category === "cs").length
    : tasks.filter((t) => t.category === "Computer Science").length
  const completedMath = categorySource
    ? categorySource.filter((t) => t.category === "math" && t.status === "completed")
        .length
    : tasks.filter((t) => t.category === "Mathematics" && t.completed).length
  const completedCS = categorySource
    ? categorySource.filter((t) => t.category === "cs" && t.status === "completed")
        .length
    : tasks.filter((t) => t.category === "Computer Science" && t.completed).length

  const streakDays = userStats?.streakDays ?? 0
  const achievementsUnlocked =
    userStats?.achievements?.filter((a) => a.unlockedAt != null).length ?? 0
  const achievementsTotal =
    (userStats?.achievements?.length ?? 0) > 0
      ? userStats!.achievements!.length
      : 3

  const showSkeleton = tasksLoading || userStatsLoading

  const isLoadingAll = tasksLoading || userStatsLoading

  if (isLoadingAll) {
    return (
      <Stack w={350} gap="lg" flex="0 0 auto">
        <Card withBorder radius="md" p="xl">
          <Stack gap="md">
            <Group gap="xs">
              <ThemeIcon variant="light" color="blue" radius="md" size="md">
                <IconTrendingUp size={18} />
              </ThemeIcon>
              <Title order={5} fw={600}>
                Ваш прогресс
              </Title>
            </Group>
            <Text size="sm" c="dimmed">
              Данные о задачах и достижениях ещё загружаются. Это может занять
              пару секунд.
            </Text>
            <Skeleton height={12} width="80%" radius="xl" />
            <Skeleton height={12} width="60%" radius="xl" />
          </Stack>
        </Card>
      </Stack>
    )
  }
  return (
    <Stack w={350} gap="lg" flex="0 0 auto">
      <Card withBorder radius="md" p="xl">
        <Stack gap="lg">
          <Group gap="xs">
            <ThemeIcon variant="light" color="blue" radius="md" size="md">
              <IconTrendingUp size={18} />
            </ThemeIcon>
            <Title order={5} fw={600}>
              Ваш прогресс
            </Title>
          </Group>

          {banner && (
            <Card withBorder radius="md" p="sm" bg="blue.0">
              <Stack gap={2}>
                <Text fw={600}>Достижение получено!</Text>
                <Group gap="sm" wrap="nowrap" align="flex-start">
                  <Text size="lg">
                    {renderAchievementIcon(banner.icon, true, 28)}
                  </Text>
                  <Stack gap={0} style={{ flex: 1 }}>
                    <Text fw={600}>{banner.name}</Text>
                    <Text size="sm" c="dimmed">
                      {banner.description}
                    </Text>
                  </Stack>
                </Group>
              </Stack>
            </Card>
          )}

          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm" c="dark">
                Общий прогресс
              </Text>
              {showSkeleton ? (
                <Skeleton height={14} width={35} radius="xl" />
              ) : (
                <Text size="sm" fw={600}>
                  {Math.round(progressPercentage)}%
                </Text>
              )}
            </Group>
            {showSkeleton ? (
              <Skeleton height={10} radius="xl" />
            ) : (
              <Progress value={progressPercentage} size="sm" />
            )}
            {showSkeleton ? (
              <Skeleton height={16} width={180} mt="16" radius="sm" />
            ) : (
              <Text size="sm">
                {completedTasks} из {totalTasks} задач выполнено
              </Text>
            )}
          </Stack>

          <Stack gap="sm">
            <Group gap="sm" justify="space-between" align="center">
              <Group gap="xs">
                <ThemeIcon variant="light" color="blue" radius="md" size="md">
                  <IconTarget size={18} />
                </ThemeIcon>
                <Text size="sm" m="0" c="dark">
                  Задач выполнено
                </Text>
              </Group>
              {showSkeleton ? (
                <Skeleton height={14} width={35} radius="md" />
              ) : (
                <Text size="sm" m="0" fw={500}>
                  {completedTasks} / {totalTasks}
                </Text>
              )}
            </Group>

            <Group gap="sm" justify="space-between">
              <Group gap="xs">
                <ThemeIcon variant="light" color="orange" radius="md" size="md">
                  <IconFlame size={18} />
                </ThemeIcon>
                <Text size="sm" m="0" c="dark">
                  Дней подряд
                </Text>
              </Group>
              {showSkeleton ? (
                <Skeleton height={14} width={35} radius="md" />
              ) : (
                <Text size="sm" m="0" fw={500}>
                  {streakDays}
                </Text>
              )}
            </Group>

            <Group gap="sm" justify="space-between">
              <Group gap="xs">
                <ThemeIcon variant="light" color="yellow" radius="md" size="md">
                  <IconTrophy size={18} />
                </ThemeIcon>
                <Text size="sm" m="0" c="dark">
                  Достижения
                </Text>
              </Group>
              {showSkeleton ? (
                <Skeleton height={14} width={35} radius="md" />
              ) : (
                <Text size="sm" m="0" fw={500}>
                  {achievementsUnlocked} / {achievementsTotal}
                </Text>
              )}
            </Group>
          </Stack>
        </Stack>
      </Card>

      <Card withBorder radius="md" p="xl">
        <Stack gap="sm">
          <Title order={5} fw={600}>
            По категориям
          </Title>

          <Stack gap="md" p="sm">
            <CategoryProgressBars
              isLoading={showSkeleton}
              math={{ completed: completedMath, total: mathTotal }}
              cs={{ completed: completedCS, total: csTotal }}
            />
          </Stack>
        </Stack>
      </Card>

      <Card withBorder radius="md" p="xl">
        <Stack gap="lg">
          <Title order={5} fw={600}>
            Достижения
          </Title>
          <AchievementsList
            isLoading={showSkeleton}
            achievements={(userStats?.achievements ?? []) as any}
          />
        </Stack>
      </Card>
    </Stack>
  )
}
