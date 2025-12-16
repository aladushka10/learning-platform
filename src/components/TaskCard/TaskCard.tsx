import { CheckCircle2, Circle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import style from "./TaskCard.module.scss"
import { Task } from "../../App"

interface TaskCardProps {
  task: Task
  onSelect: (task: Task) => void
  courseId?: string
}

const difficultyColors = {
  Easy: "bg-green-100 text-green-700 border-green-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Hard: "bg-red-100 text-red-700 border-red-200",
}

const difficultyLabels = {
  Easy: "Легко",
  Medium: "Средне",
  Hard: "Сложно",
}

export function TaskCard({ task, onSelect, courseId }: TaskCardProps) {
  const navigate = useNavigate()

  const handleSolve = () => {
    if (courseId) {
      navigate(`/course/${courseId}/task/${task.id}`)
    } else {
      onSelect(task)
    }
  }

  return (
    <Card
      className={`hover:shadow-md transition-shadow cursor-pointer group ${style.card}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-gray-900 group-hover:text-blue-600 transition-colors">
              {task.title}
            </h3>
            <p className="text-gray-500 mt-1">{task.topic}</p>
          </div>
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-gray-600 line-clamp-2">{task.description}</p>

        <div className="flex items-center gap-2 mt-3">
          <Badge
            variant="outline"
            className={difficultyColors[task.difficulty]}
          >
            {difficultyLabels[task.difficulty]}
          </Badge>
          <Badge variant="outline" className="text-gray-600">
            {task.category === "Mathematics" ? "Математика" : "Информатика"}
          </Badge>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={handleSolve}
        >
          {task.completed ? "Повторить" : "Решить"}
        </Button>
      </CardFooter>
    </Card>
  )
}
