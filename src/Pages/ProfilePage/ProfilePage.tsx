import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import {
  IconArrowLeft,
  IconAward,
  IconBook,
  IconBolt,
  IconCalendar,
  IconFlame,
  IconSchool,
  IconTrophy,
  IconStopwatch,
  IconHttpDelete,
  IconCross,
  IconTrash,
} from "@tabler/icons-react"
import {
  Avatar,
  Box,
  Center,
  Container,
  Divider,
  Group,
  Loader,
  Modal,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core"
import { AppButton } from "../../components/AppButton/AppButton"
import { AchievementsList } from "../../components/Achievements/AchievementsList"
import { CategoryProgressBars } from "../../components/Progress/CategoryProgressBars"
import { useTaskCategoryById } from "../../hooks/useTaskCategoryById"

import avatar1 from "../../assets/avatar/image1.png"
import avatar2 from "../../assets/avatar/image2.png"
import avatar3 from "../../assets/avatar/image3.png"
import avatar4 from "../../assets/avatar/image4.png"
import avatar5 from "../../assets/avatar/image5.png"
import avatar6 from "../../assets/avatar/image6.png"
import avatar7 from "../../assets/avatar/image7.png"
import avatar8 from "../../assets/avatar/image8.png"
import { setAvatarId as setAvatarIdAction } from "../../store/signInSlice"

const API_BASE = "/api"

const AVATARS = [
  { id: "image1", src: avatar1 },
  { id: "image2", src: avatar2 },
  { id: "image3", src: avatar3 },
  { id: "image4", src: avatar4 },
  { id: "image5", src: avatar5 },
  { id: "image6", src: avatar6 },
  { id: "image7", src: avatar7 },
  { id: "image8", src: avatar8 },
] as const

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
  tasks?: Array<{
    taskId: string
    status: string
    category?: "math" | "cs"
    updatedAt?: number | null
  }>
}

const ProfilePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { username, userId, auth, firstName, lastName, avatarId } = useSelector(
    (state: any) => state.signIn,
  )
  const effectiveUserId = auth ? userId : null

  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null)

  const selectedAvatarSrc = useMemo(() => {
    const found = AVATARS.find((a) => a.id === selectedAvatarId)
    return found?.src ?? null
  }, [selectedAvatarId])

  useEffect(() => {
    setSelectedAvatarId(avatarId ?? null)
  }, [avatarId])

  const handleSelectAvatar = async (id: string | null) => {
    if (!effectiveUserId) return
    setSelectedAvatarId(id)
    try {
      const res = await fetch(`${API_BASE}/users/${effectiveUserId}/avatar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ avatarId: id }),
      })
      if (res.ok) {
        dispatch(setAvatarIdAction(id))
      }
    } finally {
      setAvatarModalOpen(false)
    }
  }

  useEffect(() => {
    if (!effectiveUserId) {
      setStats(null)
      setLoading(false)
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/${effectiveUserId}/stats`, {
          credentials: "include",
          cache: "no-store",
        })
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
  const achievements = stats?.achievements ?? []

  const needsCategoryFallback = useMemo(() => {
    const raw = stats?.tasks ?? []
    return raw.some((t) => t && (t as any).category == null)
  }, [stats?.tasks])
  const { mapping: categoryById, loading: categoriesLoading } =
    useTaskCategoryById(needsCategoryFallback)

  const progressByCategory = useMemo(() => {
    const raw = stats?.tasks ?? []
    const by = {
      math: { total: 0, completed: 0, in_progress: 0, not_started: 0 },
      cs: { total: 0, completed: 0, in_progress: 0, not_started: 0 },
    }

    raw.forEach((t) => {
      if (!t?.taskId) return
      const status =
        t.status === "completed" || t.status === "in_progress"
          ? (t.status as "completed" | "in_progress")
          : "not_started"
      const cat: "math" | "cs" = t.category ?? categoryById[t.taskId] ?? "cs"
      by[cat].total += 1
      by[cat][status] += 1
    })

    return by
  }, [stats?.tasks, categoryById])

  if (loading) {
    return (
      <Box className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Center h="100vh">
          <Stack align="center" gap="sm">
            <Loader size="lg" />
            <Text c="dimmed">Загрузка профиля...</Text>
          </Stack>
        </Center>
      </Box>
    )
  }

  return (
    <Box className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Container size="lg" py="xl">
        <Stack gap="xl">
          <Modal
            opened={avatarModalOpen}
            onClose={() => setAvatarModalOpen(false)}
            title="Выберите аватар"
            centered
            size="md"
          >
            <SimpleGrid cols={{ base: 3, sm: 4 }} spacing="sm" p="sm" mb="sm">
              {AVATARS.map((a) => {
                return (
                  <UnstyledButton
                    key={a.id}
                    onClick={() => handleSelectAvatar(a.id)}
                    className="mx-auto inline-flex rounded-full p-0.5 hover:ring-2 hover:ring-blue-600 focus:outline-none"
                  >
                    <Avatar src={a.src} size={72} radius="sm" />
                  </UnstyledButton>
                )
              })}
            </SimpleGrid>
            <Group justify="center">
              <AppButton
                variant="outline"
                onClick={() => handleSelectAvatar(null)}
                size="sm"
              >
                <IconTrash size={18} />
              </AppButton>
            </Group>
          </Modal>

          <Group justify="space-between" wrap="nowrap">
            <Box
              style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}
            >
              <AppButton
                variant="subtle"
                size="md"
                leftSection={<IconArrowLeft size={20} />}
                onClick={() => {
                  navigate("/")
                  window.scrollTo(0, 0)
                }}
              >
                К задачам
              </AppButton>
            </Box>

            <Title order={2}>Профиль</Title>
            <Box style={{ flex: 1 }} />
          </Group>

          <Paper
            radius="xl"
            p="xl"
            className="border-white/15 bg-gradient-to-br from-[#2563eb] to-blue-400 "
          >
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap={4}>
                <Title order={2} c="white">
                  {`${firstName} ${lastName}`}
                </Title>
                <Text c="white" fw={400}>
                  {username}
                </Text>
              </Stack>

              <Tooltip label="Сменить аватар" withArrow>
                <UnstyledButton
                  onClick={() => setAvatarModalOpen(true)}
                  className="rounded-full p-1 transition hover:bg-white/10"
                >
                  <Avatar
                    src={selectedAvatarSrc}
                    size={80}
                    radius="100%"
                    className="ring-2 ring-white/30"
                  >
                    <IconSchool color="white" size={44} />
                  </Avatar>
                </UnstyledButton>
              </Tooltip>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 3 }} mt="lg">
              <Paper
                radius="lg"
                p="md"
                style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
              >
                <Text size="md" fw={600} c="white" m="0">
                  Решено задач
                </Text>
                <Text fw={800} size="xl" c="white">
                  {tasksCompleted}
                </Text>
              </Paper>

              <Paper
                radius="lg"
                p="md"
                style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
              >
                <Text size="md" fw={600} c="white" m="0">
                  В процессе
                </Text>
                <Text fw={800} size="xl" c="white">
                  {tasksInProgress}
                </Text>
              </Paper>

              <Paper
                radius="lg"
                p="md"
                style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
              >
                <Text size="md" fw={600} c="white" m="0">
                  Дневная серия
                </Text>
                <Group gap={6} align="baseline" wrap="nowrap">
                  <Text fw={800} size="xl" c="white">
                    {streakDays}
                  </Text>
                </Group>
              </Paper>
            </SimpleGrid>
          </Paper>

          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <Paper
              withBorder
              radius="xl"
              p="xl"
              className="bg-white border-gray-100 shadow-sm"
            >
              <Group gap="sm" mb="md">
                <ThemeIcon variant="light" color="blue" radius="xl">
                  <IconBook size={18} />
                </ThemeIcon>
                <Title order={4}>Прогресс обучения</Title>
              </Group>

              <Stack gap="md" p="sm" justify="center">
                <CategoryProgressBars
                  isLoading={
                    loading || (needsCategoryFallback && categoriesLoading)
                  }
                  math={{
                    completed: progressByCategory.math.completed,
                    total: progressByCategory.math.total,
                  }}
                  cs={{
                    completed: progressByCategory.cs.completed,
                    total: progressByCategory.cs.total,
                  }}
                />
              </Stack>
            </Paper>

            <Paper
              withBorder
              radius="xl"
              p="xl"
              className="bg-white border-gray-100 shadow-sm"
            >
              <Group gap="sm" mb="md">
                <ThemeIcon variant="light" color="yellow" radius="xl">
                  <IconTrophy size={18} />
                </ThemeIcon>
                <Title order={4}>Достижения</Title>
              </Group>

              <AchievementsList achievements={achievements} isLoading={false} />
            </Paper>
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  )
}

export default ProfilePage
