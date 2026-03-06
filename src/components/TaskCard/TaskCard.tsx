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
import { useState } from "react"

interface TaskCardProps {
  task: Task
  onSelect: (task: Task) => void
  courseId?: string
}

export function TaskCard({ task, onSelect, courseId }: TaskCardProps) {
  const navigate = useNavigate()
  const [isFlipped, setIsFlipped] = useState(false)

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
    <div
      className="relative w-full h-[240px] cursor-pointer"
      style={{
        perspective: "1000px",
      }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={handleSolve}
    >
      <div
        className="relative w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.70,-0.55,0.270,1.55)]"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <Paper
          withBorder
          radius="lg"
          p="lg"
          className="absolute w-full h-full"
          style={{
            display: "flex",
            flexDirection: "column",
            backfaceVisibility: "hidden",
          }}
        >
          {task.completed ? (
            <IconCircleCheck className="absolute top-4 right-4 w-6 h-6 text-green-500" />
          ) : (
            <IconCircle className="absolute top-4 right-4 w-6 h-6 text-gray-300" />
          )}
          <div className="flex flex-col h-full  justify-between">
            <div className="pr-7 min-w-0">
              <Title mb={10} order={5}>
                {task.title}
              </Title>
              {task.lectureTitle && (
                <Text size="md" mt={4}>
                  {task.lectureTitle}
                </Text>
              )}
            </div>

            <TaskBadges
              difficulty={task.difficulty}
              taskType={task.taskType}
              category={task.category}
              language={task.language}
            />
          </div>
        </Paper>

        <Paper
          withBorder
          radius="lg"
          p="lg"
          className="absolute w-full h-full"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack gap="sm" style={{ flex: 1 }}>
            <Text size="sm" fw={500} c="dimmed">
              Условие задачи:
            </Text>
            <Text size="sm" className="line-clamp-4">
              {task.description}
            </Text>
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
      </div>
    </div>
  )
}
