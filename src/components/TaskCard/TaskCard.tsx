import {
  IconCircleCheck,
  IconCircle,
  IconCode,
  IconPencil,
} from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"
import { Badge, Button, Group, Paper, Stack, Text, Title } from "@mantine/core"
import { Task } from "../../App"
import { TaskBadges } from "../TaskBadges/TaskBadges"

interface TaskCardProps {
  task: Task
  onSelect: (task: Task) => void
  courseId?: string
}

export function TaskCard({ task, onSelect, courseId }: TaskCardProps) {
  const navigate = useNavigate()

  const handleSolve = () => {
    if (courseId) {
      if (task.taskType === "code") {
        navigate(`/course/${courseId}/code/${task.id}`)
      } else {
        navigate(`/course/${courseId}/task/${task.id}`)
      }
    } else {
      onSelect(task)
    }
  }

  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      onClick={handleSolve}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        cursor: "pointer",
      }}
    >
      {task.completed ? (
        <IconCircleCheck className="absolute top-4 right-4 w-5 h-5 text-green-500" />
      ) : (
        <IconCircle className="absolute top-4 right-4 w-5 h-5 text-gray-300" />
      )}

      <Stack gap="sm" style={{ flex: 1 }}>
        <div className="pr-7 min-w-0">
          <Title order={5}>{task.title}</Title>
          <Text size="sm">{task.topic}</Text>
        </div>

        <Text size="sm" className="line-clamp-2">
          {task.description}
        </Text>

        <TaskBadges
          difficulty={task.difficulty}
          taskType={task.taskType}
          category={task.category}
          language={task.language}
        />
      </Stack>

      <Button
        fullWidth
        mt="md"
        style={{
          backgroundColor: "#2563eb",
        }}
        onClick={handleSolve}
      >
        {task.completed ? "Повторить" : "Решить"}
      </Button>
    </Paper>
  )
}
