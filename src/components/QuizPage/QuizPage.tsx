import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { IconArrowLeft } from "@tabler/icons-react"
import { Alert, Paper, Radio, Stack, Title, Text, Loader } from "@mantine/core"
import { AppButton } from "../AppButton/AppButton"
import { fetchLectureQuiz, submitLectureQuiz } from "../../utils/api"
import { useSelector } from "react-redux"

export default function QuizPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const lectureId = searchParams.get("lectureId")

  const userId = useSelector((state: any) => state.signIn?.userId) as
    | string
    | null

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quiz, setQuiz] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitResult, setSubmitResult] = useState<{
    score: number
    total: number
  } | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!lectureId) {
        setLoading(false)
        setQuiz(null)
        return
      }
      setLoading(true)
      setError(null)
      setSubmitResult(null)
      setAnswers({})
      try {
        const q = await fetchLectureQuiz(lectureId)
        setQuiz(q)
      } catch (e: any) {
        setError(e?.message || "Ошибка загрузки теста")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [lectureId])

  const canSubmit = useMemo(() => {
    const qs = Array.isArray(quiz?.questions) ? quiz.questions : []
    if (qs.length === 0) return false
    return qs.every((q: any) => Boolean(answers[q.id]))
  }, [quiz, answers])

  const handleSubmit = async () => {
    if (!lectureId || !quiz) return
    try {
      const res = await submitLectureQuiz(lectureId, answers, userId || undefined)
      setSubmitResult({ score: res.score, total: res.total })
    } catch (e: any) {
      setError(e?.message || "Ошибка отправки теста")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <AppButton
            variant="subtle"
            leftSection={<IconArrowLeft size={20} />}
            onClick={() => navigate(`/?course=${courseId || ""}`)}
            className="px-0 text-blue-600 hover:text-blue-700"
          >
            Вернуться
          </AppButton>
          <Title order={2}>{quiz?.title || "Тест"}</Title>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <Loader size="lg" />
          </div>
        ) : !lectureId ? (
          <Alert color="gray" title="Нет лекции">
            Этот тест привязан к лекции. Откройте тест из блока рекомендации/лекции.
          </Alert>
        ) : error ? (
          <Alert color="red" title="Ошибка">
            {error}
          </Alert>
        ) : !quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0 ? (
          <Alert color="gray" title="Пустой тест">
            Для этой лекции пока нет вопросов.
          </Alert>
        ) : (
          <Stack gap="lg">
            {submitResult ? (
              <Alert
                color={submitResult.score === submitResult.total ? "green" : "blue"}
                title="Результат"
              >
                Вы набрали {submitResult.score} из {submitResult.total}.
              </Alert>
            ) : null}

            {quiz.questions.map((q: any) => (
              <Paper key={q.id} withBorder radius="lg" p="xl">
                <Stack gap="md">
                  <Text fw={600} className="text-gray-900">
                    {q.text}
                  </Text>
                  <Radio.Group
                    value={answers[q.id] || ""}
                    onChange={(val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
                  >
                    <Stack gap="xs">
                      {(q.options || []).map((opt: any) => (
                        <Radio
                          key={opt.id}
                          value={opt.id}
                          label={opt.text}
                          className="cursor-pointer"
                        />
                      ))}
                    </Stack>
                  </Radio.Group>
                </Stack>
              </Paper>
            ))}

            <AppButton
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Отправить
            </AppButton>
          </Stack>
        )}
      </div>
    </div>
  )
}
