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
  Title,
} from "@mantine/core"
import {
  IconArrowLeft,
  IconPlus,
  IconTrash,
  IconUsers,
  IconUser,
} from "@tabler/icons-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSelector } from "react-redux"
import { AppButton } from "../../components/AppButton/AppButton"
import { AppLayout } from "../../components/AppLayout/AppLayout"
import { AppState } from "../../components/AppState/AppState"
import { AssignmentsService } from "../../services/assignments/assignments.service"
import { CoursesService } from "../../services/courses/courses.service"

function studentLabel(s: { firstName?: string; lastName?: string; email: string }) {
  const name = `${s.firstName || ""} ${s.lastName || ""}`.trim()
  return name ? `${name} (${s.email})` : s.email
}

export default function AdminTaskAssignmentsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const role = useSelector((s: any) => s.signIn?.role) as
    | "student"
    | "teacher"
    | "admin"
    | null
  const isAdmin = useSelector((s: any) => Boolean(s.signIn?.isAdmin)) as boolean
  const effectiveRole = role ?? (isAdmin ? "admin" : "student")
  const actorId = useSelector((s: any) => s.signIn?.userId) as string | null
  const mode: "admin" | "teacher" = effectiveRole === "teacher" ? "teacher" : "admin"

  const [studentId, setStudentId] = useState<string | null>(null)
  const [courseId, setCourseId] = useState<string | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)

  const studentsQuery = useQuery({
    queryKey: [mode === "admin" ? "admin-students" : "teacher-students"],
    queryFn: () =>
      mode === "admin"
        ? AssignmentsService.getAdminStudents()
        : AssignmentsService.getTeacherStudents(),
  })

  const coursesQuery = useQuery({
    queryKey: ["courses"],
    queryFn: () => CoursesService.getCourses(),
  })

  const tasksQuery = useQuery({
    queryKey: ["course-tasks", courseId],
    queryFn: () => CoursesService.getCourseTasks(courseId as string),
    enabled: !!courseId,
  })

  const assignmentsQuery = useQuery({
    queryKey: [mode === "admin" ? "admin-task-assignments" : "teacher-task-assignments", studentId],
    queryFn: () =>
      mode === "admin"
        ? AssignmentsService.getAdminAssignmentsByUser(studentId as string)
        : AssignmentsService.getTeacherAssignmentsByUser(studentId as string),
    enabled: !!studentId,
  })

  const assignMutation = useMutation({
    mutationFn: () =>
      mode === "admin"
        ? AssignmentsService.upsertAdminAssignment({
            userId: studentId as string,
            taskId: taskId as string,
          })
        : AssignmentsService.upsertTeacherAssignment({
            userId: studentId as string,
            taskId: taskId as string,
          }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          mode === "admin" ? "admin-task-assignments" : "teacher-task-assignments",
          studentId,
        ],
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      mode === "admin"
        ? AssignmentsService.deleteAdminAssignment(id)
        : AssignmentsService.deleteTeacherAssignment(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          mode === "admin" ? "admin-task-assignments" : "teacher-task-assignments",
          studentId,
        ],
      })
    },
  })

  const studentOptions = useMemo(() => {
    const list = studentsQuery.data?.students ?? []
    return list.map((s) => ({ value: s.id, label: studentLabel(s) }))
  }, [studentsQuery.data?.students])

  const selectedStudent = useMemo(() => {
    const list = studentsQuery.data?.students ?? []
    return studentId ? list.find((s) => s.id === studentId) ?? null : null
  }, [studentsQuery.data?.students, studentId])

  const selectedStudentLabel = selectedStudent
    ? studentLabel(selectedStudent)
    : null

  const courseOptions = useMemo(() => {
    const list = coursesQuery.data ?? []
    return list.map((c) => ({ value: c.id, label: c.title }))
  }, [coursesQuery.data])

  const taskOptions = useMemo(() => {
    const list = tasksQuery.data ?? []
    return list.map((t: any) => ({ value: t.id, label: t.title || t.id }))
  }, [tasksQuery.data])

  const assignments = assignmentsQuery.data?.assignments ?? []

  const canAssign = Boolean(studentId && courseId && taskId) && !assignMutation.isPending

  return (
    <AppLayout>
      <Container size="xl" py="xl" className="min-h-[60vh]">
        <Stack gap="xl">
          <Group justify="space-between" wrap="wrap">
            <Group gap="sm" align="center">
              <IconUsers size={28} className="text-blue-600" />
              <Title order={2}>Назначение задач</Title>
            </Group>
            <AppButton
              variant="subtle"
              leftSection={<IconArrowLeft size={18} />}
              onClick={() =>
                mode === "admin" ? navigate("/admin/users-progress") : navigate("/tasks")
              }
            >
              {mode === "admin" ? "К прогрессу всех" : "К задачам"}
            </AppButton>
          </Group>

          <Paper withBorder radius="lg" p="lg" className="bg-white border-gray-100 shadow-sm">
            {studentsQuery.isLoading || coursesQuery.isLoading ? (
              <Group justify="center" py="xl">
                <Loader />
              </Group>
            ) : studentsQuery.error || coursesQuery.error ? (
              <AppState
                title="Не удалось загрузить данные"
                actionLabel="Повторить"
                onAction={() => {
                  studentsQuery.refetch()
                  coursesQuery.refetch()
                }}
              />
            ) : (
              <Stack gap="md">
                {selectedStudentLabel ? (
                  <Alert
                    color="blue"
                    variant="light"
                    title="Выбран студент"
                    icon={<IconUser size={18} />}
                  >
                    {selectedStudentLabel}
                  </Alert>
                ) : (
                  <Alert
                    color="gray"
                    variant="light"
                    title="Сначала выбери студента"
                    icon={<IconUser size={18} />}
                  >
                    Назначение и список ниже относятся к выбранному студенту.
                  </Alert>
                )}

                <Group grow align="flex-end">
                  <Select
                    label="Студент"
                    placeholder="Выберите студента"
                    data={studentOptions}
                    searchable
                    value={studentId}
                    onChange={(v) => {
                      setStudentId(v)
                    }}
                  />
                  <Select
                    label="Курс"
                    placeholder="Выберите курс"
                    data={courseOptions}
                    value={courseId}
                    onChange={(v) => {
                      setCourseId(v)
                      setTaskId(null)
                    }}
                  />
                  <Select
                    label="Задача"
                    placeholder={courseId ? "Выберите задачу" : "Сначала выберите курс"}
                    data={taskOptions}
                    value={taskId}
                    onChange={(v) => setTaskId(v)}
                    disabled={!courseId || tasksQuery.isLoading}
                    searchable
                  />
                  <AppButton
                    leftSection={<IconPlus size={18} />}
                    onClick={() => assignMutation.mutate()}
                    disabled={!canAssign}
                  >
                    Назначить
                  </AppButton>
                </Group>

                {assignMutation.isError && (
                  <Alert color="red" title="Ошибка назначения">
                    {(assignMutation.error as Error).message}
                  </Alert>
                )}
              </Stack>
            )}
          </Paper>

          <Paper withBorder radius="lg" p="lg" className="bg-white border-gray-100 shadow-sm">
            <Group justify="space-between" mb="sm" wrap="wrap">
              <Stack gap={2}>
                <Title order={4}>Текущие назначения</Title>
                {selectedStudentLabel ? (
                  <Text size="sm" c="dimmed">
                    Для: {selectedStudentLabel}
                  </Text>
                ) : null}
              </Stack>
              {studentId ? (
                <Badge variant="light" color="blue">
                  {assignments.length} шт.
                </Badge>
              ) : (
                <Badge variant="light" color="gray">
                  выберите студента
                </Badge>
              )}
            </Group>

            {!studentId ? (
              <Text c="dimmed">Выберите студента, чтобы увидеть назначения.</Text>
            ) : assignmentsQuery.isLoading ? (
              <Group justify="center" py="xl">
                <Loader />
              </Group>
            ) : assignmentsQuery.error ? (
              <AppState
                title="Не удалось загрузить назначения"
                actionLabel="Повторить"
                onAction={() => assignmentsQuery.refetch()}
              />
            ) : assignments.length === 0 ? (
              <Text c="dimmed">Пока нет назначенных задач.</Text>
            ) : (
              <Table striped highlightOnHover horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Студент</Table.Th>
                    <Table.Th>Курс</Table.Th>
                    <Table.Th>Задача</Table.Th>
                    <Table.Th>Назначено</Table.Th>
                    <Table.Th ta="right">Действия</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {assignments.map((a) => (
                    <Table.Tr key={a.id}>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {selectedStudentLabel || a.userId}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {a.courseTitle || a.courseId}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={0}>
                          <Text size="sm" fw={600}>
                            {a.taskTitle || a.taskId}
                          </Text>
                          {a.taskDescription ? (
                            <Text size="xs" c="dimmed" className="line-clamp-1">
                              {a.taskDescription}
                            </Text>
                          ) : null}
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {new Date(a.assignedAt).toLocaleString("ru-RU")}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        {mode === "admin" || (actorId && String(a.assignedBy) === String(actorId)) ? (
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => deleteMutation.mutate(a.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        ) : (
                          <Text size="xs" c="dimmed">
                            —
                          </Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Paper>
        </Stack>
      </Container>
    </AppLayout>
  )
}

