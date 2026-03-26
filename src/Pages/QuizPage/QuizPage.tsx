import { useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  IconArrowLeft,
  IconCircleCheck,
  IconCircleX,
} from "@tabler/icons-react"
import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  Container,
  Group,
  Paper,
  Radio,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import { QuizService } from "../../services/quiz/quiz.service"
import { AppButton } from "../../components/AppButton/AppButton"
import { QuizSubmitResult } from "../../services/quiz/quiz.type"

export default function QuizPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const lectureId = searchParams.get("lectureId")

  const userId = useSelector((state: any) => state.signIn?.userId) as
    | string
    | null

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitResult, setSubmitResult] = useState<QuizSubmitResult | null>(
    null,
  )

  const {
    data: quiz,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["lecture-quiz", lectureId],
    queryFn: () => QuizService.getByLectureId(lectureId!),
    enabled: !!lectureId,
  })

  const submitMutation = useMutation({
    mutationFn: () =>
      QuizService.submit(lectureId!, answers, userId || undefined),
    onSuccess: (data) => setSubmitResult(data),
  })

  const canSubmit = useMemo(() => {
    if (!quiz?.questions?.length) return false
    return quiz.questions.every((q) => Boolean(answers[q.id]))
  }, [quiz, answers])

  const goBack = () => navigate(`/?course=${courseId || ""}`)

  if (!lectureId) {
    return (
      <Container size="sm" py="xl">
        <Alert color="gray" title="Нет лекции">
          Этот тест привязан к лекции. Откройте тест из блока рекомендации.
        </Alert>
      </Container>
    )
  }

  if (isLoading) {
    return (
      <Container size="lg" py="xl" mt={30}>
        <Stack gap="lg">
          <Group mb="lg" wrap="nowrap">
            <Box
              style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}
            >
              <Skeleton height={40} width={200} radius="sm" />
            </Box>
            <Box>
              <Skeleton height={40} width={700} radius="xl" />
            </Box>
          </Group>

          {Array.from({ length: 6 }).map((_, idx) => (
            <Paper
              key={idx}
              radius="lg"
              p="xl"
              withBorder
              style={{
                borderWidth: 2,
                borderColor: "var(--mantine-color-blue-4)",
              }}
            >
              <Stack gap="md">
                <Group justify="start" align="center" wrap="nowrap">
                  <Skeleton height={32} width={32} radius="md" />
                  <Skeleton height={28} width="50%" radius="sm" />
                </Group>

                <Group gap="md" align="center">
                  <Skeleton height={32} width={90} radius="xl" />
                  <Skeleton height={32} width={80} radius="xl" />
                  <Skeleton height={32} width={110} radius="xl" />
                  <Skeleton height={32} width={75} radius="xl" />
                  <Skeleton height={32} width={100} radius="xl" />
                </Group>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Container>
    )
  }

  if (queryError) {
    return (
      <Container size="sm" py="xl">
        <Alert color="red" title="Ошибка">
          {(queryError as Error).message}
        </Alert>
      </Container>
    )
  }

  if (!quiz?.questions?.length) {
    return (
      <Container size="sm" py="xl">
        <Alert color="gray" title="Пустой тест">
          Для этой лекции пока нет вопросов.
        </Alert>
      </Container>
    )
  }

  return (
    <Container size="lg" py="xl" mt="30">
      <Group mb="xl" wrap="nowrap">
        <Box style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
          <AppButton
            variant="subtle"
            size="md"
            leftSection={<IconArrowLeft size={20} />}
            onClick={goBack}
          >
            Вернуться
          </AppButton>
        </Box>
        <Box>
          <Title order={2} ta="center">
            {quiz.title}
          </Title>
        </Box>
      </Group>

      <Stack gap="lg">
        {submitResult && (
          <Alert
            color={submitResult.score === submitResult.total ? "green" : "blue"}
            title="Результат"
          >
            Вы набрали {submitResult.score} из {submitResult.total}.
          </Alert>
        )}

        {quiz.questions.map((q, index) => {
          const questionResult = submitResult?.results?.find(
            (r) => r.questionId === q.id,
          )
          const isCorrect = questionResult?.correct

          return (
            <Paper
              key={q.id}
              radius="lg"
              p="xl"
              withBorder
              style={{
                borderWidth: 2,
                borderColor: "var(--mantine-color-blue-4)",
                backgroundColor:
                  index % 2 === 0
                    ? "var(--mantine-color-blue-0)"
                    : "var(--mantine-color-blue-1)",
              }}
            >
              <Stack gap="md">
                <Group justify="space-between" align="center" wrap="nowrap">
                  <Group gap="md" align="center">
                    <Box
                      w={32}
                      h={32}
                      bg="white"
                      c="blue.7"
                      fw={700}
                      fz={16}
                      bd="1px solid blue.7"
                      className="flex items-center justify-center rounded-xl"
                    >
                      {index + 1}
                    </Box>
                    <Text size="lg" fw={600} m="0" mb="5" c="dark">
                      {q.text}
                    </Text>
                  </Group>

                  {submitResult && questionResult !== undefined && (
                    <Group gap="xs" align="center">
                      <Box
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          lineHeight: 0,
                        }}
                      >
                        {isCorrect ? (
                          <IconCircleCheck
                            size={27}
                            color="var(--mantine-color-green-6)"
                          />
                        ) : (
                          <IconCircleX
                            size={27}
                            color="var(--mantine-color-red-6)"
                          />
                        )}
                      </Box>
                    </Group>
                  )}
                </Group>

                <Group gap="md" align="center">
                  {q.options.map((opt) => {
                    const isSelected = answers[q.id] === opt.id
                    const isCorrectAnswer =
                      questionResult?.correctAnswerId === opt.id

                    let color = "var(--mantine-color-blue-4)"
                    let variant: "outline" | "filled" = isSelected
                      ? "filled"
                      : "outline"

                    if (submitResult) {
                      if (isCorrectAnswer) {
                        color = "green"
                        variant = "filled"
                      } else if (isSelected && !isCorrectAnswer) {
                        color = "red"
                        variant = "filled"
                      } else {
                        variant = "outline"
                      }
                    }

                    return (
                      <Chip
                        key={opt.id}
                        checked={isSelected}
                        onChange={() =>
                          !submitResult &&
                          setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                        }
                        color={color as any}
                        variant={
                          submitResult && isCorrectAnswer ? "filled" : "outline"
                        }
                        size="lg"
                        disabled={!!submitResult}
                        radius="xl"
                      >
                        <Text size="md" m="0" fw={400} c="dark">
                          {opt.text}
                        </Text>
                      </Chip>
                    )
                  })}
                </Group>
              </Stack>
            </Paper>
          )
        })}

        {submitMutation.isError && (
          <Alert color="red" title="Ошибка">
            {(submitMutation.error as Error).message}
          </Alert>
        )}

        {submitResult ? (
          <AppButton
            size="md"
            onClick={() => {
              setAnswers({})
              setSubmitResult(null)
              window.scrollTo(0, 0)
            }}
          >
            Пройти снова
          </AppButton>
        ) : (
          <AppButton
            size="md"
            onClick={() => {
              submitMutation.mutate()
              window.scrollTo(0, 0)
            }}
            disabled={!canSubmit}
            loading={submitMutation.isPending}
          >
            Проверить
          </AppButton>
        )}
      </Stack>
    </Container>
  )
}
