import { ArrowLeft, Lightbulb, CheckCircle } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { useState } from "react"
import type { Task } from "../../App"
import style from "../TaskView/TaskView.module.scss"

interface TaskViewProps {
  task: Task
  onBack: () => void
  onComplete: (taskId: string) => void
  courseId?: string
}

const taskDetails: Record<
  string,
  { statement: string; hint: string; example: string }
> = {
  "1": {
    statement:
      "Реализуйте класс бинарного дерева поиска (БДП) со следующими методами:\n\n• insert(value): Добавляет новый узел с заданным значением\n• search(value): Возвращает true, если значение существует в дереве\n• inorderTraversal(): Возвращает массив значений в отсортированном порядке\n\nБДП должно поддерживать свойство, где левые дочерние элементы меньше, а правые дочерние элементы больше своего родителя.",
    hint: "Начните с создания класса Node со свойствами value, left и right. Для вставки сравните значение с текущим узлом и рекурсивно пройдите влево или вправо.",
    example:
      "Пример:\nbst.insert(5)\nbst.insert(3)\nbst.insert(7)\nbst.search(3) // вернёт true\nbst.inorderTraversal() // вернёт [3, 5, 7]",
  },
  "2": {
    statement:
      "Решите следующую систему линейных уравнений методом Гаусса:\n\n2x + 3y - z = 5\n4x + 4y - 3z = 3\n-2x + 3y - z = 1\n\nПокажите ваши действия на каждом шаге процесса исключения и предоставьте окончательное решение для x, y и z.",
    hint: "Начните с записи расширенной матрицы. Затем используйте операции со строками для создания нулей ниже диагонали. Наконец, используйте обратную подстановку для нахождения значений.",
    example: "Ваш ответ должен быть в форме:\nx = ...\ny = ...\nz = ...",
  },
  "3": {
    statement:
      "Дан массив целых чисел, найдите непрерывный подмассив с наибольшей суммой, используя алгоритм Кадане.\n\nРеализуйте функцию maxSubarraySum(arr), которая возвращает максимальную сумму.\n\nОграничения:\n• Длина массива: 1 ≤ n ≤ 10^5\n• Значения: -10^4 ≤ arr[i] ≤ 10^4",
    hint: "Отслеживайте максимальную сумму, заканчивающуюся в текущей позиции, и общую максимальную сумму. Обновляйте их по мере итерации по массиву.",
    example:
      "Пример:\nmaxSubarraySum([-2, 1, -3, 4, -1, 2, 1, -5, 4]) = 6\n// Подмассив [4, -1, 2, 1] имеет наибольшую сумму",
  },
}

export function TaskView({ task, onBack, onComplete }: TaskViewProps) {
  const [solution, setSolution] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const details = taskDetails[task.id] || {
    statement: "Детали задачи скоро появятся...",
    hint: "Подсказок пока нет.",
    example: "Примеров пока нет.",
  }

  const handleSubmit = () => {
    setSubmitted(true)
    if (solution.trim().length > 10) {
      onComplete(task.id)
    }
  }

  return (
    <div className={`${style.taskView} space-y-6`}>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-gray-900">{task.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {task.category === "Mathematics" ? "Математика" : "Информатика"}
            </Badge>
            <Badge variant="outline" className="text-gray-600">
              {task.topic}
            </Badge>
            <Badge
              variant="outline"
              className={
                task.difficulty === "Easy"
                  ? "bg-green-100 text-green-700 border-green-200"
                  : task.difficulty === "Medium"
                  ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                  : "bg-red-100 text-red-700 border-red-200"
              }
            >
              {task.difficulty === "Easy"
                ? "Легко"
                : task.difficulty === "Medium"
                ? "Средне"
                : "Сложно"}
            </Badge>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-gray-900">Условие задачи</h2>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-gray-700">
            {details.statement}
          </div>

          {details.example && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-900 mb-2">Пример:</p>
              <pre className="text-gray-700 whitespace-pre-wrap">
                {details.example}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">Ваше решение</h2>
            {submitted && solution.trim().length > 10 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>Отправлено</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Напишите ваше решение здесь..."
            className="min-h-[300px] font-mono"
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
          />

          <div className="flex items-center gap-3">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmit}
              disabled={solution.trim().length === 0}
            >
              Проверить ответ
            </Button>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowHint(!showHint)}
            >
              <Lightbulb className="w-4 h-4" />
              {showHint ? "Скрыть подсказку" : "Показать подсказку"}
            </Button>
          </div>

          {showHint && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 mb-1">Подсказка</p>
                  <p className="text-gray-700">{details.hint}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
