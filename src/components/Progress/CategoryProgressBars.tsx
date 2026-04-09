import { Group, Progress, Skeleton, Stack, Text } from "@mantine/core"

export function CategoryProgressBars({
  isLoading = false,
  math,
  cs,
  labels = { math: "Математика", cs: "Программирование" },
  colors = { math: "blue", cs: "blue" },
}: {
  isLoading?: boolean
  math: { completed: number; total: number }
  cs: { completed: number; total: number }
  labels?: { math: string; cs: string }
  colors?: { math: string; cs: string }
}) {
  const blocks = [
    { key: "math" as const, label: labels.math, ...math, color: colors.math },
    { key: "cs" as const, label: labels.cs, ...cs, color: colors.cs },
  ]

  return (
    <Stack gap="md">
      {blocks.map((b) => (
        <Stack key={b.key} gap={6}>
          <Group justify="space-between">
            <Text size="sm" m="0" c="dark">
              {b.label}
            </Text>
            {isLoading ? (
              <Skeleton height={14} width={44} radius="md" />
            ) : (
              <Text size="sm" c="dimmed">
                {b.completed}/{b.total}
              </Text>
            )}
          </Group>

          {isLoading ? (
            <Skeleton height={10} radius="xl" />
          ) : (
            <Progress
              value={b.total > 0 ? (b.completed / b.total) * 100 : 0}
              size="sm"
              color={b.color}
            />
          )}
        </Stack>
      ))}
    </Stack>
  )
}

