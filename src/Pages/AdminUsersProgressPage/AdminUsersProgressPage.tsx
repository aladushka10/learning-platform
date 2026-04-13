import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  Badge,
  Container,
  Group,
  Loader,
  Paper,
  Progress,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core"
import { IconArrowLeft, IconUsers } from "@tabler/icons-react"
import { AppButton } from "../../components/AppButton/AppButton"
import { AppLayout } from "../../components/AppLayout/AppLayout"
import { AppState } from "../../components/AppState/AppState"
import { useAdminUsersProgress } from "../../services/progress/progress.hooks"

function displayName(row: {
  firstName: string
  lastName: string
  email: string
}) {
  const n = `${row.firstName} ${row.lastName}`.trim()
  return n || row.email
}

export default function AdminUsersProgressPage() {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useAdminUsersProgress(true)
  const isAdmin = useSelector((state: any) => state.signIn?.isAdmin) as boolean

  const sorted = useMemo(() => {
    const users = data?.users ?? []
    return [...users].sort(
      (a, b) =>
        b.completionRate - a.completionRate ||
        b.completedTasks - a.completedTasks ||
        b.inProgressTasks - a.inProgressTasks,
    )
  }, [data?.users])

  return (
    <AppLayout>
      <Container size="xl" py="xl" className="min-h-[60vh]">
        <Stack gap="xl">
          <Group justify="space-between" wrap="wrap">
            <Group gap="sm" align="center">
              <IconUsers size={28} className="text-blue-600" />
              <Title order={2}>Прогресс пользователей</Title>
            </Group>
            <AppButton
              variant="subtle"
              leftSection={<IconArrowLeft size={18} />}
              onClick={() => navigate("/tasks")}
            >
              К задачам
            </AppButton>
          </Group>

          <Paper
            withBorder
            radius="lg"
            p="md"
            className="bg-white border-gray-100 shadow-sm"
          >
            {isLoading ? (
              <Group justify="center" py="xl">
                <Loader />
              </Group>
            ) : error ? (
              <AppState
                title="Не удалось загрузить данные"
                actionLabel="Повторить"
                onAction={() => refetch()}
              />
            ) : sorted.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                Пользователей пока нет.
              </Text>
            ) : (
              <Table striped highlightOnHover horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Пользователь</Table.Th>
                    <Table.Th>Роль</Table.Th>
                    <Table.Th ta="center">Завершено</Table.Th>
                    <Table.Th ta="center">В процессе</Table.Th>
                    <Table.Th ta="center">Не начато</Table.Th>
                    <Table.Th>Прогресс</Table.Th>
                    <Table.Th ta="center">Серия</Table.Th>
                    <Table.Th ta="center">Достижения</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sorted.map((row) => (
                    <Table.Tr key={row.id}>
                      <Table.Td>
                        <Stack gap={0}>
                          <Text fw={500} c="dark" size="sm">
                            {displayName(row)}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {row.email}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        {row.isAdmin ? (
                          <Badge size="sm" color="grape" variant="light">
                            Админ
                          </Badge>
                        ) : (
                          <Badge size="sm" color="gray" variant="light">
                            Студент
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td ta="center">
                        {row.completedTasks} / {row.totalTasks}
                      </Table.Td>
                      <Table.Td ta="center">{row.inProgressTasks}</Table.Td>
                      <Table.Td ta="center">{row.notStartedTasks}</Table.Td>
                      <Table.Td maw={200}>
                        <Progress
                          value={row.completionRate}
                          size="sm"
                          color="blue"
                        />
                        <Text size="xs" c="dimmed" mt={4}>
                          {row.completionRate}%
                        </Text>
                      </Table.Td>
                      <Table.Td ta="center">{row.streakDays}</Table.Td>
                      <Table.Td ta="center">
                        {row.achievementsUnlocked}
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
