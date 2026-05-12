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
import { IconArrowLeft, IconLink, IconTrash, IconUserCheck } from "@tabler/icons-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AppButton } from "../../components/AppButton/AppButton"
import { AppLayout } from "../../components/AppLayout/AppLayout"
import { AppState } from "../../components/AppState/AppState"
import { AdminService } from "../../services/admin/admin.service"

function labelUser(u: { firstName?: string | null; lastName?: string | null; email: string }) {
  const n = `${u.firstName || ""} ${u.lastName || ""}`.trim()
  return n ? `${n} (${u.email})` : u.email
}

export default function AdminRolesPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => AdminService.listUsers(),
  })

  const users = usersQuery.data ?? []

  const teachers = useMemo(
    () =>
      users.filter((u) => (u.role ?? (u.isAdmin ? "admin" : "student")) === "teacher"),
    [users],
  )
  const students = useMemo(
    () =>
      users.filter((u) => (u.role ?? (u.isAdmin ? "admin" : "student")) === "student"),
    [users],
  )

  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [studentId, setStudentId] = useState<string | null>(null)

  const teacherStudentsQuery = useQuery({
    queryKey: ["admin-teacher-students", teacherId],
    queryFn: () => AdminService.listTeacherStudents(teacherId as string),
    enabled: !!teacherId,
  })

  const setRoleMutation = useMutation({
    mutationFn: (params: { userId: string; role: "student" | "teacher" | "admin" }) =>
      AdminService.setUserRole(params),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })

  const linkMutation = useMutation({
    mutationFn: () =>
      AdminService.linkTeacherStudent({
        teacherId: teacherId as string,
        studentId: studentId as string,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-teacher-students", teacherId] })
    },
  })

  const unlinkMutation = useMutation({
    mutationFn: (params: { teacherId: string; studentId: string }) =>
      AdminService.unlinkTeacherStudent(params),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-teacher-students", teacherId] })
    },
  })

  const teacherOptions = useMemo(
    () => teachers.map((t) => ({ value: t.id, label: labelUser(t) })),
    [teachers],
  )
  const studentOptions = useMemo(
    () => students.map((s) => ({ value: s.id, label: labelUser(s) })),
    [students],
  )

  return (
    <AppLayout>
      <Container size="xl" py="xl" className="min-h-[60vh]">
        <Stack gap="xl">
          <Group justify="space-between" wrap="wrap">
            <Group gap="sm" align="center">
              <IconUserCheck size={28} className="text-blue-600" />
              <Title order={2}>Роли и ученики</Title>
            </Group>
            <AppButton
              variant="subtle"
              leftSection={<IconArrowLeft size={18} />}
              onClick={() => navigate("/admin/users-progress")}
            >
              Назад
            </AppButton>
          </Group>

          <Paper withBorder radius="lg" p="lg" className="bg-white border-gray-100 shadow-sm">
            <Title order={4} mb="sm">
              Пользователи
            </Title>

            {usersQuery.isLoading ? (
              <Group justify="center" py="xl">
                <Loader />
              </Group>
            ) : usersQuery.error ? (
              <AppState
                title="Не удалось загрузить пользователей"
                actionLabel="Повторить"
                onAction={() => usersQuery.refetch()}
              />
            ) : (
              <>
                {setRoleMutation.isError ? (
                  <Alert color="red" title="Ошибка изменения роли" mb="sm">
                    {(setRoleMutation.error as Error).message}
                  </Alert>
                ) : null}

                <Table striped highlightOnHover horizontalSpacing="md">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Пользователь</Table.Th>
                      <Table.Th>Роль</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {users.map((u) => {
                      const effectiveRole =
                        (u.role as any) ?? (u.isAdmin ? "admin" : "student")
                      return (
                        <Table.Tr key={u.id}>
                          <Table.Td>
                            <Stack gap={0}>
                              <Text fw={500} size="sm">
                                {labelUser(u)}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {u.id}
                              </Text>
                            </Stack>
                          </Table.Td>
                          <Table.Td>
                            {effectiveRole === "admin" ? (
                              <Badge size="sm" color="grape" variant="light">
                                Админ
                              </Badge>
                            ) : (
                              <Select
                                data={[
                                  { value: "student", label: "Студент" },
                                  { value: "teacher", label: "Преподаватель" },
                                ]}
                                value={effectiveRole}
                                onChange={(v) => {
                                  if (!v) return
                                  setRoleMutation.mutate({
                                    userId: u.id,
                                    role: v as "student" | "teacher",
                                  })
                                }}
                                disabled={setRoleMutation.isPending}
                                size="xs"
                                w={210}
                              />
                            )}
                          </Table.Td>
                        </Table.Tr>
                      )
                    })}
                  </Table.Tbody>
                </Table>
              </>
            )}
          </Paper>

          <Paper withBorder radius="lg" p="lg" className="bg-white border-gray-100 shadow-sm">
            <Group justify="space-between" mb="sm" wrap="wrap">
              <Title order={4}>Привязка учеников к преподавателю</Title>
              <Badge variant="light" color="blue">
                {teacherStudentsQuery.data?.students?.length ?? 0} шт.
              </Badge>
            </Group>

            <Stack gap="md">
              <Group grow align="flex-end">
                <Select
                  label="Преподаватель"
                  placeholder="Выберите преподавателя"
                  data={teacherOptions}
                  value={teacherId}
                  onChange={(v) => {
                    setTeacherId(v)
                    setStudentId(null)
                  }}
                  searchable
                />
                <Select
                  label="Ученик"
                  placeholder={teacherId ? "Выберите ученика" : "Сначала выберите преподавателя"}
                  data={studentOptions}
                  value={studentId}
                  onChange={setStudentId}
                  searchable
                  disabled={!teacherId}
                />
                <AppButton
                  leftSection={<IconLink size={18} />}
                  onClick={() => linkMutation.mutate()}
                  disabled={!teacherId || !studentId || linkMutation.isPending}
                >
                  Привязать
                </AppButton>
              </Group>

              {linkMutation.isError ? (
                <Alert color="red" title="Не удалось привязать">
                  {(linkMutation.error as Error).message}
                </Alert>
              ) : null}

              {!teacherId ? (
                <Text c="dimmed">Выберите преподавателя, чтобы увидеть список учеников.</Text>
              ) : teacherStudentsQuery.isLoading ? (
                <Group justify="center" py="xl">
                  <Loader />
                </Group>
              ) : teacherStudentsQuery.error ? (
                <AppState
                  title="Не удалось загрузить учеников"
                  actionLabel="Повторить"
                  onAction={() => teacherStudentsQuery.refetch()}
                />
              ) : (teacherStudentsQuery.data?.students?.length ?? 0) === 0 ? (
                <Text c="dimmed">Пока нет привязанных учеников.</Text>
              ) : (
                <Table striped highlightOnHover horizontalSpacing="md">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Ученик</Table.Th>
                      <Table.Th ta="right">Отвязать</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {(teacherStudentsQuery.data?.students ?? []).map((s) => (
                      <Table.Tr key={s.id}>
                        <Table.Td>
                          <Text fw={500} size="sm">
                            {labelUser(s)}
                          </Text>
                        </Table.Td>
                        <Table.Td ta="right">
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() =>
                              unlinkMutation.mutate({
                                teacherId: teacherId as string,
                                studentId: s.id,
                              })
                            }
                            disabled={unlinkMutation.isPending}
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
          </Paper>
        </Stack>
      </Container>
    </AppLayout>
  )
}

