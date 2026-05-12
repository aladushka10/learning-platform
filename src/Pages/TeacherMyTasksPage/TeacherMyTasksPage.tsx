import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ActionIcon,
  Alert,
  Badge,
  Container,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core"
import { IconArrowLeft, IconTrash } from "@tabler/icons-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSelector } from "react-redux"
import { AppButton } from "../../components/AppButton/AppButton"
import { AppLayout } from "../../components/AppLayout/AppLayout"
import { AppState } from "../../components/AppState/AppState"
import { CoursesService } from "../../services/courses/courses.service"
import { TasksService } from "../../services/tasks/tasks.service"

type MyTaskRow = {
  id: string
  courseId: string
  courseTitle: string
  title: string
  difficulty?: string
  tags?: string[]
}

export default function TeacherMyTasksPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const userId = useSelector((s: any) => s.signIn?.userId) as string | null

  const [courseFilter, setCourseFilter] = useState<string | null>(null)
  const [q, setQ] = useState("")

  const coursesQuery = useQuery({
    queryKey: ["courses"],
    queryFn: () => CoursesService.getCourses(),
  })

  const myTasksQuery = useQuery({
    queryKey: ["my-created-tasks", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) return [] as MyTaskRow[]
      const courses = await CoursesService.getCourses()
      const all = await Promise.all(
        courses.map(async (c) => {
          const tasks = await CoursesService.getCourseTasks(c.id)
          return tasks.map((t: any) => ({ course: c, task: t }))
        }),
      )
      const rows: MyTaskRow[] = []
      for (const bundle of all.flat()) {
        const t = bundle.task
        if (String(t.createdBy || "") !== String(userId)) continue
        let meta: any = {}
        try {
          meta = t.meta ? (typeof t.meta === "string" ? JSON.parse(t.meta) : t.meta) : {}
        } catch {
          meta = {}
        }
        rows.push({
          id: String(t.id),
          courseId: String(bundle.course.id),
          courseTitle: String(bundle.course.title || bundle.course.id),
          title: String(t.title || t.id),
          difficulty: meta?.difficulty,
          tags: Array.isArray(meta?.tags) ? meta.tags.map(String) : [],
        })
      }
      return rows.sort((a, b) => a.courseTitle.localeCompare(b.courseTitle, "ru"))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => TasksService.deleteTask(taskId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["my-created-tasks", userId] })
    },
  })

  const courseOptions = useMemo(() => {
    const list = coursesQuery.data ?? []
    return [{ value: "", label: "Все курсы" }].concat(
      list.map((c) => ({ value: c.id, label: c.title || c.id })),
    )
  }, [coursesQuery.data])

  const filtered = useMemo(() => {
    const rows = myTasksQuery.data ?? []
    const byCourse =
      courseFilter && courseFilter !== ""
        ? rows.filter((r) => r.courseId === courseFilter)
        : rows
    const query = q.trim().toLowerCase()
    if (!query) return byCourse
    return byCourse.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.courseTitle.toLowerCase().includes(query) ||
        (r.tags || []).some((t) => String(t).toLowerCase().includes(query)),
    )
  }, [myTasksQuery.data, courseFilter, q])

  return (
    <AppLayout>
      <Container size="xl" py="xl" className="min-h-[60vh]">
        <Stack gap="xl">
          <Group justify="space-between" wrap="wrap">
            <Title order={2}>Мои созданные задачи</Title>
            <AppButton
              variant="subtle"
              leftSection={<IconArrowLeft size={18} />}
              onClick={() => navigate("/tasks")}
            >
              К задачам
            </AppButton>
          </Group>

          <Paper withBorder radius="lg" p="lg" className="bg-white border-gray-100 shadow-sm">
            {!userId ? (
              <Alert color="red" title="Нет пользователя">
                Выйдите и войдите снова.
              </Alert>
            ) : coursesQuery.isLoading || myTasksQuery.isLoading ? (
              <Group justify="center" py="xl">
                <Loader />
              </Group>
            ) : coursesQuery.error || myTasksQuery.error ? (
              <AppState
                title="Не удалось загрузить задачи"
                actionLabel="Повторить"
                onAction={() => {
                  coursesQuery.refetch()
                  myTasksQuery.refetch()
                }}
              />
            ) : (
              <Stack gap="md">
                <Group grow align="flex-end">
                  <Select
                    label="Курс"
                    data={courseOptions}
                    value={courseFilter || ""}
                    onChange={(v) => setCourseFilter(v || "")}
                    searchable
                  />
                  <TextInput
                    label="Поиск"
                    placeholder="Название, курс или тег"
                    value={q}
                    onChange={(e) => setQ(e.currentTarget.value)}
                  />
                </Group>

                {deleteMutation.isError ? (
                  <Alert color="red" title="Ошибка удаления">
                    {(deleteMutation.error as Error).message}
                  </Alert>
                ) : null}

                <Group justify="space-between" wrap="wrap">
                  <Text c="dimmed">Показываются только задачи, созданные вами.</Text>
                  <Badge variant="light" color="blue">
                    {filtered.length} шт.
                  </Badge>
                </Group>

                {filtered.length === 0 ? (
                  <Text c="dimmed">Пока нет созданных задач.</Text>
                ) : (
                  <Table striped highlightOnHover horizontalSpacing="md">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Курс</Table.Th>
                        <Table.Th>Задача</Table.Th>
                        <Table.Th>Сложность</Table.Th>
                        <Table.Th>Теги</Table.Th>
                        <Table.Th ta="right">Удалить</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filtered.map((r) => (
                        <Table.Tr key={r.id}>
                          <Table.Td>{r.courseTitle}</Table.Td>
                          <Table.Td>
                            <Text fw={600} size="sm">
                              {r.title}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {r.id}
                            </Text>
                          </Table.Td>
                          <Table.Td>{r.difficulty || "—"}</Table.Td>
                          <Table.Td>
                            {(r.tags || []).length ? (r.tags || []).join(", ") : "—"}
                          </Table.Td>
                          <Table.Td ta="right">
                            <ActionIcon
                              variant="light"
                              color="red"
                              onClick={() => deleteMutation.mutate(r.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <IconTrash size={18} />
                            </ActionIcon>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )}
              </Stack>
            )}
          </Paper>
        </Stack>
      </Container>
    </AppLayout>
  )
}

