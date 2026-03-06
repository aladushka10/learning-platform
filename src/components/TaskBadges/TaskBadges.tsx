import { Badge, Group } from "@mantine/core"
import { IconCode, IconPencil } from "@tabler/icons-react"

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
  return (
    <Group justify="flex-end" gap="md" className="flex-wrap">
      {difficulty && (
        <Badge size="lg" variant="outline" color={difficultyColors[difficulty]}>
          {difficultyLabels[difficulty]}
        </Badge>
      )}

      {taskType === "code" && language && (
        <Badge size="lg" fw={500} variant="light" color="gray">
          {language}
        </Badge>
      )}
      {category && (
        <Badge size="lg" fw={500} variant="light" color="gray">
          {category === "Mathematics" ? "Математика" : "Информатика"}
        </Badge>
      )}
      {taskType && (
        <Badge
          size="lg"
          fw={500}
          variant="light"
          color="blue"
          leftSection={
            taskType === "code" ? (
              <IconCode size={14} />
            ) : (
              <IconPencil size={14} />
            )
          }
        >
          {taskType === "code" ? "Код" : "Задача"}
        </Badge>
      )}
    </Group>
  )
}
