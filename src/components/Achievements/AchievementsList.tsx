import { Card, Group, Skeleton, Stack, Text } from "@mantine/core"
import { renderAchievementIcon } from "../../utils/achievementIcons"
export type AchievementItem = {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: number | null
}
export function AchievementsList({
  achievements,
  isLoading,
}: {
  achievements: AchievementItem[]
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <Stack gap="sm">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card key={idx} radius="md" p="md" withBorder bg="gray.0">
            <Group align="flex-start" gap="md" wrap="nowrap">
              <Skeleton height={24} width={24} radius="xl" />
              <Stack gap={8} style={{ flex: 1 }}>
                <Skeleton height={12} width="70%" radius="md" />
                <Skeleton height={10} width="90%" radius="md" />
                <Skeleton height={10} width="55%" radius="md" />
              </Stack>
            </Group>
          </Card>
        ))}
      </Stack>
    )
  }

  if (achievements.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        Решайте задачи, чтобы открывать достижения.
      </Text>
    )
  }

  return (
    <Stack gap="sm">
      {achievements.slice(0, 3).map((a) => (
        <Card
          key={a.id}
          radius="md"
          p="sm"
          withBorder
          bg={a.unlockedAt ? "yellow.0" : "gray.0"}
        >
          <Group align="flex-start" gap="sm" wrap="nowrap">
            <Text size="lg" m="0">
              {renderAchievementIcon(
                a.icon,
                a.unlockedAt != null,
                24,
                a.unlockedAt ? "text-amber-600" : "text-gray-500",
              )}
            </Text>
            <Stack gap={2} style={{ flex: 1 }}>
              <Text size="sm" m="0" fw={600} c="dark">
                {a.name}
              </Text>
              <Text size="xs" m="0" c="dimmed">
                {a.description}
              </Text>
              {a.unlockedAt && (
                <Text size="xs" m="0" c="yellow.9">
                  Получено {new Date(a.unlockedAt).toLocaleDateString("ru-RU")}
                </Text>
              )}
            </Stack>
          </Group>
        </Card>
      ))}
    </Stack>
  )
}
