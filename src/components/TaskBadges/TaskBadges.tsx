import { Badge, Group } from "@mantine/core"
import { IconCode, IconPencil } from "@tabler/icons-react"
import { useMediaQuery } from "@mantine/hooks"

type Props = {
  difficulty?: undefined | string
  taskType?: "code" | "text" | undefined | string
  category?: "Mathematics" | "Computer Science"
  language?: string
}

const difficultyColors = {
  Easy: "rgb(61, 238, 123)",
  Medium: "rgb(255, 195, 104)",
  Hard: "rgb(255, 110, 110)",
}

const difficultyLabels = {
  Easy: "Легко",
  Medium: "Средне",
  Hard: "Сложно",
}

export const TaskBadges = ({
  difficulty,
  taskType,
  category,
  language,
}: Props) => {
  const isXs = useMediaQuery("(max-width: 1330px)")
  const isSm = useMediaQuery("(max-width: 1490px)")

  const badgeSize = isXs ? "xs" : isSm ? "sm" : "lg"
  const gap = isXs ? "xs" : isSm ? "sm" : "md"

  return (
    <Group justify="flex-end" gap={gap} wrap="wrap">
      {difficulty && (
        <Badge
          size={badgeSize}
          variant="outline"
          color={difficultyColors[difficulty]}
        >
          {difficultyLabels[difficulty]}
        </Badge>
      )}

      {taskType === "code" && language && (
        <Badge size={badgeSize} fw={500} variant="light" color="gray">
          {language}
        </Badge>
      )}
      {category && (
        <Badge size={badgeSize} fw={500} variant="light" color="gray">
          {category === "Mathematics" ? "Математика" : "Программирование"}
        </Badge>
      )}
      {taskType && (
        <Badge
          size={badgeSize}
          fw={500}
          variant="light"
          color="blue"
          leftSection={
            taskType === "code" ? (
              <IconCode size={13} />
            ) : (
              <IconPencil size={13} />
            )
          }
        >
          {taskType === "code" ? "Код" : "Задача"}
        </Badge>
      )}
    </Group>
  )
}
