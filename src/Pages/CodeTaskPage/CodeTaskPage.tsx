import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  IconArrowLeft,
  IconBook,
  IconCode,
  IconPlayerPlay,
  IconClipboardList,
} from "@tabler/icons-react"
import {
  Alert,
  Badge,
  Code,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core"
import Editor from "@monaco-editor/react"
import { AppButton } from "../../components/AppButton/AppButton"
import { TaskBadges } from "../../components/TaskBadges/TaskBadges"
import { useQueryClient } from "@tanstack/react-query"
import { useDispatch, useSelector } from "react-redux"
import { taskPageOpened } from "../../store/middlewares/trackTaskOpenMiddleware"
import { TaskSidebarCard } from "../../components/TaskSidebar/TaskSidebarCard"
import { CoursesService } from "../../services/courses/courses.service"
import { TasksService } from "../../services/tasks/tasks.service"

type CodeTestCase = {
  name?: string
  expr?: string
  expected?: unknown
}

type CodeTaskMeta = {
  type?: string
  language?: string
  difficulty?: string
  topic?: string
  starterCode?: string
  tests?: CodeTestCase[]
}

interface TaskData {
  id: string
  courseId: string
  title: string
  description: string
  meta: CodeTaskMeta
  ord: number
}

interface LectureData {
  id: string
  title: string
  content: string
}

type RunResult = {
  expr: string
  pass: boolean
  expected: unknown
  actual: unknown
  error?: string
}

const CodeTaskPage = () => {
  const { courseId, taskId } = useParams<{ courseId: string; taskId: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const userId = useSelector((state: any) => state.signIn?.userId) as
    | string
    | null

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [task, setTask] = useState<TaskData | null>(null)
  const [relatedLecture, setRelatedLecture] = useState<LectureData | null>(null)

  const [code, setCode] = useState("")
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)
  const [results, setResults] = useState<RunResult[] | null>(null)
  const [judgeStatus, setJudgeStatus] = useState<string | null>(null)
  const [showQuizRecommendation, setShowQuizRecommendation] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      setTask(null)
      setRelatedLecture(null)
      setRunError(null)
      setResults(null)
      setJudgeStatus(null)

      try {
        if (!courseId || !taskId) throw new Error("Missing course or task ID")
        const tasks = await CoursesService.getCourseTasks(courseId)
        const taskData = tasks.find((t: any) => t?.id === taskId)
        if (!taskData) throw new Error("Task not found")

        const rawMeta =
          typeof taskData.meta === "string"
            ? JSON.parse(taskData.meta)
            : taskData.meta || {}
        const meta: CodeTaskMeta =
          rawMeta && typeof rawMeta === "object" ? rawMeta : {}

        setTask({
          id: taskData.id,
          courseId: taskData.courseId,
          title: taskData.title,
          description: taskData.description,
          meta,
          ord: taskData.ord,
        })
        setCode(meta.starterCode || "")

        try {
          const lectData = await CoursesService.getCourseLectures(courseId)
          const topic = meta.topic
          if (topic && Array.isArray(lectData)) {
            const topicLower = String(topic).toLowerCase()
            const matched = lectData.find(
              (l: LectureData) =>
                l.id === topic || l.title.toLowerCase().includes(topicLower),
            )
            setRelatedLecture(matched || null)
          }
        } catch (e) {
          // optional
        }
      } catch (e: any) {
        setError(e?.message || "Error loading task")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId, taskId])

  const tests = useMemo(() => {
    const metaTests: CodeTestCase[] = Array.isArray(task?.meta?.tests)
      ? (task?.meta?.tests as CodeTestCase[])
      : []
    return metaTests
      .map((t) => ({
        expr: (t.expr || t.name || "").trim(),
        expected: t.expected,
      }))
      .filter((t) => Boolean(t.expr))
  }, [task?.meta?.tests])

  const hasResults = Array.isArray(results)
  const total = hasResults ? results.length : 0
  const passed = hasResults ? results.filter((r) => r?.pass === true).length : 0
  const solved = hasResults && total > 0 && passed === total

  useEffect(() => {
    if (!courseId || !taskId || !userId) return

    dispatch(taskPageOpened({ userId, taskId }))
    ;(async () => {
      try {
        const stats = await TasksService.getTaskStats(taskId!)
        const failures = (stats.attempts || 0) - (stats.successes || 0)
        const shouldRecommend =
          ((stats.successes || 0) == 0 && (stats.opens || 0) >= 4) ||
          ((stats.successes || 0) == 0 && (stats.attempts || 0) >= 2) ||
          failures >= 2
        setShowQuizRecommendation(shouldRecommend)
      } catch {
        // best-effort
      }
    })()
  }, [courseId, taskId, userId, dispatch])

  const handleRun = async () => {
    setRunError(null)
    setResults(null)
    setJudgeStatus(null)

    if (!task) return
    if (!code.trim()) {
      setRunError("Введите код")
      return
    }
    if (!tests.length) {
      setRunError("Для этой задачи пока нет тестов")
      return
    }

    setRunning(true)
    try {
      const resp = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          language: String(task.meta?.language || "javascript").toLowerCase(),
          code,
          tests,
          taskId: task.id,
        }),
      })

      const data = await resp.json().catch(() => null)
      if (!resp.ok) {
        setRunError(data?.error || "Ошибка запуска")
        return
      }

      const statusDesc = data?.judge?.status?.description
      if (typeof statusDesc === "string") setJudgeStatus(statusDesc)

      const out = data?.results
      if (Array.isArray(out)) {
        setResults(out as RunResult[])
        if (data?.testsOk === true && userId) {
          await queryClient.refetchQueries({
            queryKey: ["user-progress", userId],
            type: "all",
          })
        }
      } else {
        const judgeMessage =
          typeof data?.judge?.message === "string" ? data.judge.message : null
        const stderr =
          typeof data?.judge?.stderr === "string" ? data.judge.stderr : null
        const compileOutput =
          typeof data?.judge?.compile_output === "string"
            ? data.judge.compile_output
            : null

        setRunError(
          judgeMessage ||
            stderr ||
            compileOutput ||
            "Не удалось прочитать результаты тестов (сервер вернул неожиданный ответ)",
        )
      }
    } catch (e: any) {
      setRunError(e?.message || "Ошибка сети")
    } finally {
      setRunning(false)
    }

    // Refresh recommendation after an attempt
    try {
      if (userId && taskId) {
        const stats = await TasksService.getTaskStats(taskId)
        const failures = (stats.attempts || 0) - (stats.successes || 0)
        const shouldRecommend =
          ((stats.successes || 0) == 0 && (stats.opens || 0) >= 4) ||
          ((stats.successes || 0) == 0 && (stats.attempts || 0) >= 2) ||
          failures >= 2
        setShowQuizRecommendation(shouldRecommend)
      }
    } catch {
      // best-effort
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader size="lg" />
          <Text c="dimmed">Загрузка задания...</Text>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Paper withBorder radius="lg" p="lg" className="w-full max-w-md">
          <Stack gap="md">
            <Alert color="red" title="Ошибка">
              {error || "Task not found"}
            </Alert>
            <AppButton
              variant="medium"
              onClick={() => navigate(`/?course=${courseId || ""}`)}
            >
              Вернуться
            </AppButton>
          </Stack>
        </Paper>
      </div>
    )
  }

  const meta = task.meta || {}

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <Container fluid px="lg">
        <div className="mx-auto max-w-[1400px]">
          <Group justify="space-between" mb="md">
            <AppButton
              variant="subtle"
              leftSection={<IconArrowLeft size={20} />}
              onClick={() => navigate(`/?course=${courseId || ""}`)}
              className="px-0 text-blue-600 hover:text-blue-700"
            >
              Вернуться
            </AppButton>

            <Title order={2} className="text-center">
              {task.title}
            </Title>

            <div className="w-24" />
          </Group>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3 space-y-8">
              <Paper
                withBorder
                radius="lg"
                p="xl"
                className="border-l-4 border-l-blue-600"
              >
                <Stack gap="lg">
                  <div className="relative mb-6">
                    <div className="pr-44">
                      <Title order={3}>Условие задачи</Title>

                      <Text
                        size="lg"
                        className="text-lg text-gray-700 mt-4 leading-relaxed"
                      >
                        {task.description}
                      </Text>
                    </div>

                    <div className="absolute top-0 right-0">
                      <TaskBadges
                        difficulty={task.meta?.difficulty ?? "Easy"}
                        taskType={task.meta?.type}
                        language={task.meta?.language}
                      />
                    </div>
                  </div>
                </Stack>
              </Paper>

              <Paper withBorder radius="lg" p="xl">
                <Stack gap="lg">
                  <Group justify="space-between" align="center">
                    <Title order={3} className="text-xl font-semibold">
                      Ваше решение
                    </Title>

                    <AppButton
                      leftSection={<IconPlayerPlay size={16} />}
                      loading={running}
                      onClick={handleRun}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Запустить тесты
                    </AppButton>
                  </Group>

                  <div className="rounded-lg overflow-hidden border bg-white">
                    <Editor
                      height="400px"
                      language={meta.language || "javascript"}
                      value={code}
                      onChange={(v) => setCode(v ?? "")}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        tabSize: 2,
                        insertSpaces: true,
                        wordWrap: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                    />
                  </div>

                  {runError ? (
                    <Alert color="red" title="Ошибка">
                      {runError}
                    </Alert>
                  ) : null}

                  {judgeStatus ? (
                    <Alert color="gray" title="Локальный раннер">
                      {judgeStatus}
                    </Alert>
                  ) : null}
                </Stack>
              </Paper>

              {(hasResults || runError) && (
                <Paper withBorder radius="lg" p="xl">
                  <Stack gap="sm">
                    <Title order={3} className="text-xl font-semibold">
                      Результат
                    </Title>

                    {hasResults ? (
                      <Alert
                        color={solved ? "green" : "red"}
                        title={solved ? "Задача решена" : "Задача не решена"}
                      >
                        Пройдено тестов: {passed}/{total}
                      </Alert>
                    ) : runError ? (
                      <Alert color="red" title="Ошибка">
                        {runError}
                      </Alert>
                    ) : null}
                  </Stack>
                </Paper>
              )}
            </div>

            <div className="lg:col-span-2  space-y-8">
              <TaskSidebarCard
                title="Тесты"
                icon={<IconCode size={18} className="text-indigo-600" />}
              >
                <Table withTableBorder withColumnBorders highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Case</Table.Th>
                      <Table.Th>Expected</Table.Th>
                      <Table.Th>Actual</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {(results || tests).map((t: any, idx: number) => {
                      const expr = t.expr
                      const expected = t.expected
                      const hasRun = typeof t.pass === "boolean"
                      const pass = t.pass
                      const actual = t.actual
                      const errText = t.error
                      return (
                        <Table.Tr key={`${expr}-${idx}`}>
                          <Table.Td>
                            <Code>{expr}</Code>
                          </Table.Td>
                          <Table.Td>
                            <Code>{JSON.stringify(expected)}</Code>
                          </Table.Td>
                          <Table.Td>
                            <Code>{hasRun ? JSON.stringify(actual) : "—"}</Code>
                            {errText ? (
                              <div className="text-xs text-red-600 mt-1">
                                {String(errText)}
                              </div>
                            ) : null}
                          </Table.Td>
                          <Table.Td>
                            {hasRun ? (
                              <Badge
                                variant="light"
                                color={pass ? "green" : "red"}
                              >
                                {pass ? "OK" : "FAIL"}
                              </Badge>
                            ) : (
                              <Badge variant="light" color="gray">
                                ожидает
                              </Badge>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      )
                    })}
                  </Table.Tbody>
                </Table>
              </TaskSidebarCard>
              <TaskSidebarCard
                title="Теория"
                icon={<IconBook size={18} className="text-purple-600" />}
                ctaLabel="Открыть лекцию"
                ctaIcon={<IconBook size={18} />}
                onClick={() => {
                  if (!relatedLecture) return
                  navigate(`/lecture/${relatedLecture.id}`, {
                    state: { lecture: relatedLecture },
                  })
                }}
                ctaDisabled={!relatedLecture}
              >
                {relatedLecture ? (
                  <p className="text-gray-600 text-base">
                    Рекомендуемая лекция:{" "}
                    <span className="font-medium text-gray-900">
                      {relatedLecture.title}
                    </span>
                  </p>
                ) : (
                  <p className="text-gray-600 text-base">
                    Для этой задачи пока не привязана лекция.
                  </p>
                )}
              </TaskSidebarCard>

              {showQuizRecommendation && relatedLecture && (
                <TaskSidebarCard
                  title="Рекомендуем"
                  icon={
                    <IconClipboardList size={18} className="text-indigo-600" />
                  }
                  ctaLabel="Пройти тест по лекции"
                  ctaIcon={<IconClipboardList size={18} />}
                  onClick={() =>
                    navigate(
                      `/course/${courseId}/quiz?lectureId=${encodeURIComponent(
                        relatedLecture.id,
                      )}`,
                    )
                  }
                >
                  <p className="text-gray-600 text-base">
                    Чтобы закрепить материал, пройдите короткий тест по этой
                    лекции.
                  </p>
                </TaskSidebarCard>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default CodeTaskPage
