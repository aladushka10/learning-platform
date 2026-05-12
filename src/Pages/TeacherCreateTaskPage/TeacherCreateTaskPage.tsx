import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Alert,
  Container,
  Group,
  Loader,
  NumberInput,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  TagsInput,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core"
import { IconArrowLeft, IconPlus, IconTrash } from "@tabler/icons-react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useSelector } from "react-redux"
import { AppButton } from "../../components/AppButton/AppButton"
import { AppLayout } from "../../components/AppLayout/AppLayout"
import { AppState } from "../../components/AppState/AppState"
import { CoursesService } from "../../services/courses/courses.service"
import { TasksService } from "../../services/tasks/tasks.service"

type Difficulty = "Easy" | "Medium" | "Hard"
type TaskKind = "code" | "text"
type CodeTest = { expr: string; expected: string }

function buildDescription(parts: {
  statement: string
  input: string
  output: string
  constraints: string
  examples: string
}) {
  const out: string[] = []
  if (parts.statement.trim()) out.push("Условие:\n" + parts.statement.trim())
  if (parts.input.trim()) out.push("Входные данные:\n" + parts.input.trim())
  if (parts.output.trim()) out.push("Выходные данные:\n" + parts.output.trim())
  if (parts.constraints.trim()) out.push("Ограничения:\n" + parts.constraints.trim())
  if (parts.examples.trim()) out.push("Примеры:\n" + parts.examples.trim())
  return out.join("\n\n")
}

export default function TeacherCreateTaskPage() {
  const navigate = useNavigate()
  const userId = useSelector((s: any) => s.signIn?.userId) as string | null

  const coursesQuery = useQuery({
    queryKey: ["courses"],
    queryFn: () => CoursesService.getCourses(),
  })

  const [courseId, setCourseId] = useState<string | null>(null)

  const lecturesQuery = useQuery({
    queryKey: ["course-lectures", courseId],
    queryFn: () => CoursesService.getCourseLectures(courseId as string),
    enabled: !!courseId,
  })

  const [taskKind, setTaskKind] = useState<TaskKind>("code")
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy")
  const [tags, setTags] = useState<string[]>([])
  const [language] = useState<string>("javascript")
  const [starterCode, setStarterCode] = useState<string>("")
  const [tests, setTests] = useState<CodeTest[]>([
    { expr: "sumUnique([1,2,2,3])", expected: "4" },
  ])

  const [title, setTitle] = useState("Сумма уникальных чисел")
  const [statement, setStatement] = useState(
    "Дан массив целых чисел arr. Посчитайте сумму только тех чисел, которые встречаются в массиве ровно один раз.",
  )
  const [examples, setExamples] = useState(
    "arr = [1, 2, 2, 3] → 4\narr = [5, 5, 5] → 0\narr = [-1, 2, -1, 3, 3, 4] → 6",
  )
  const [lectureId, setLectureId] = useState<string | null>(null)

  const [ord, setOrd] = useState<number | string>(0)

  const courseOptions = useMemo(() => {
    const list = coursesQuery.data ?? []
    return list.map((c) => ({ value: c.id, label: c.title || c.id }))
  }, [coursesQuery.data])

  const lectureOptions = useMemo(() => {
    const list = lecturesQuery.data ?? []
    return [{ value: "", label: "Не привязана" }].concat(
      list.map((l: any) => ({ value: String(l.id), label: String(l.title || l.id) })),
    )
  }, [lecturesQuery.data])

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!courseId) throw new Error("Выберите курс")
      if (!title.trim()) throw new Error("Введите название задачи")
      if (taskKind === "code") {
        const okTests = tests.filter((t) => t.expr.trim()).length
        if (!okTests) throw new Error("Добавьте хотя бы один тест")
      }

      const description = buildDescription({
        statement,
        input: "",
        output: "",
        constraints: "",
        examples,
      })

      const metaObj: any = {
        type: taskKind,
        difficulty,
        tags: tags.filter(Boolean),
      }
      if (lectureId) {
        metaObj.topic = lectureId
      }
      if (taskKind === "code") {
        metaObj.language = String(language || "javascript").toLowerCase()
        if (starterCode.trim()) metaObj.starterCode = starterCode
        metaObj.tests = tests
          .map((t) => ({ expr: t.expr.trim(), expected: t.expected }))
          .filter((t) => Boolean(t.expr))
      }

      return CoursesService.createCourseTask(courseId, {
        title: title.trim(),
        description,
        meta: JSON.stringify(metaObj),
        ord: typeof ord === "number" ? ord : Number(ord) || 0,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const id = createMutation.data?.id
      if (!id) throw new Error("Нет задачи для удаления")
      await TasksService.deleteTask(id)
    },
  })

  const canCreate =
    Boolean(courseId && title.trim()) && !createMutation.isPending && !coursesQuery.isLoading

  return (
    <AppLayout>
      <Container size="md" py="xl" className="min-h-[60vh]">
        <Stack gap="lg">
          <Group justify="space-between" wrap="wrap">
            <Title order={2}>Создать задачу</Title>
            <AppButton
              variant="subtle"
              leftSection={<IconArrowLeft size={18} />}
              onClick={() => navigate("/tasks")}
            >
              К задачам
            </AppButton>
          </Group>

          <Paper withBorder radius="lg" p="lg" className="bg-white border-gray-100 shadow-sm">
            {coursesQuery.isLoading ? (
              <Group justify="center" py="xl">
                <Loader />
              </Group>
            ) : coursesQuery.error ? (
              <AppState
                title="Не удалось загрузить курсы"
                actionLabel="Повторить"
                onAction={() => coursesQuery.refetch()}
              />
            ) : (
              <Stack gap="md">
                <Select
                  label="Курс"
                  placeholder="Выберите курс"
                  data={courseOptions}
                  value={courseId}
                  onChange={(v) => {
                    setCourseId(v)
                    setLectureId(null)
                  }}
                  searchable
                />

                <div>
                  <Text size="sm" fw={500} mb={6}>
                    Тип задачи
                  </Text>
                  <SegmentedControl
                    value={taskKind}
                    onChange={(v) => setTaskKind(v as TaskKind)}
                    data={[
                      { value: "code", label: "Программирование" },
                      { value: "text", label: "Текстовая" },
                    ]}
                  />
                </div>

                <TextInput
                  label="Название"
                  placeholder="Например: Сумма уникальных чисел"
                  value={title}
                  onChange={(e) => setTitle(e.currentTarget.value)}
                />

                <Group grow>
                  <Select
                    label="Сложность"
                    data={[
                      { value: "Easy", label: "Easy" },
                      { value: "Medium", label: "Medium" },
                      { value: "Hard", label: "Hard" },
                    ]}
                    value={difficulty}
                    onChange={(v) => setDifficulty((v as Difficulty) || "Easy")}
                  />
                  <div />
                </Group>

                <TagsInput
                  label="Теги"
                  placeholder="Например: arrays, hashmap, strings"
                  value={tags}
                  onChange={setTags}
                  acceptValueOnBlur
                  clearable
                />

                <Textarea
                  label="Условие"
                  placeholder="Опишите, что нужно сделать"
                  minRows={4}
                  value={statement}
                  onChange={(e) => setStatement(e.currentTarget.value)}
                />

                <Select
                  label="Связанная лекция (опционально)"
                  placeholder={courseId ? "Выберите лекцию" : "Сначала выберите курс"}
                  data={lectureOptions}
                  value={lectureId || ""}
                  onChange={(v) => setLectureId(v && v !== "" ? v : null)}
                  disabled={!courseId || lecturesQuery.isLoading}
                  searchable
                />

                <Textarea
                  label="Примеры"
                  minRows={2}
                  value={examples}
                  onChange={(e) => setExamples(e.currentTarget.value)}
                />

                {taskKind === "code" ? (
                  <>
                    <Textarea
                      label="Стартовый код (опционально)"
                      minRows={6}
                      value={starterCode}
                      onChange={(e) => setStarterCode(e.currentTarget.value)}
                      placeholder="function sumUnique(arr) {\n  // ...\n}\n"
                    />

                    <Stack gap="xs">
                      <Group justify="space-between" align="flex-end" wrap="wrap">
                        <div>
                          <Text size="sm" fw={500}>
                            Тестовые данные (expr → expected)
                          </Text>
                          <Text size="xs" c="dimmed">
                            Эти тесты используются на странице запуска кода.
                          </Text>
                        </div>
                        <AppButton
                          variant="light"
                          size="xs"
                          onClick={() =>
                            setTests((prev) => [...prev, { expr: "", expected: "" }])
                          }
                        >
                          Добавить тест
                        </AppButton>
                      </Group>

                      {tests.map((t, idx) => (
                        <Group key={idx} align="flex-end" wrap="nowrap">
                          <TextInput
                            label={idx === 0 ? "expr" : undefined}
                            placeholder="sumUnique([1,2,2,3])"
                            value={t.expr}
                            onChange={(e) => {
                              const v = e.currentTarget.value
                              setTests((prev) =>
                                prev.map((x, i) => (i === idx ? { ...x, expr: v } : x)),
                              )
                            }}
                            style={{ flex: 1 }}
                          />
                          <TextInput
                            label={idx === 0 ? "expected" : undefined}
                            placeholder="4"
                            value={t.expected}
                            onChange={(e) => {
                              const v = e.currentTarget.value
                              setTests((prev) =>
                                prev.map((x, i) =>
                                  i === idx ? { ...x, expected: v } : x,
                                ),
                              )
                            }}
                            style={{ width: 170 }}
                          />
                          <AppButton
                            variant="subtle"
                            color="red"
                            size="xs"
                            onClick={() => setTests((prev) => prev.filter((_, i) => i !== idx))}
                            disabled={tests.length <= 1}
                          >
                            Удалить
                          </AppButton>
                        </Group>
                      ))}
                    </Stack>
                  </>
                ) : null}

                <NumberInput
                  label="Порядок (ord)"
                  value={ord}
                  onChange={setOrd}
                  min={0}
                />

                {createMutation.isError ? (
                  <Alert color="red" title="Не удалось создать задачу">
                    {(createMutation.error as Error).message}
                  </Alert>
                ) : null}

                {createMutation.isSuccess ? (
                  <Alert color="green" title="Задача создана">
                    <Group justify="space-between" wrap="wrap">
                      <div>{createMutation.data.title || createMutation.data.id}</div>
                      {userId ? (
                        <AppButton
                          variant="light"
                          color="red"
                          leftSection={<IconTrash size={18} />}
                          onClick={() => deleteMutation.mutate()}
                          disabled={deleteMutation.isPending}
                        >
                          Удалить
                        </AppButton>
                      ) : null}
                    </Group>
                  </Alert>
                ) : null}

                {deleteMutation.isError ? (
                  <Alert color="red" title="Не удалось удалить задачу">
                    {(deleteMutation.error as Error).message}
                  </Alert>
                ) : null}

                <Group justify="flex-end">
                  <AppButton
                    leftSection={<IconPlus size={18} />}
                    onClick={() => createMutation.mutate()}
                    disabled={!canCreate}
                  >
                    Создать
                  </AppButton>
                </Group>
              </Stack>
            )}
          </Paper>
        </Stack>
      </Container>
    </AppLayout>
  )
}

