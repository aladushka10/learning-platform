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
  Box,
  Button,
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
import type { QuizSubmitResult } from "../../services/quiz/quiz.type"
import { AppButton } from "../../components/AppButton/AppButton"

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
      <Container size="lg" py="xl">
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

          {Array.from({ length: 4 }).map((_, idx) => (
            <Paper
              key={idx}
              radius="lg"
              p="xl"
              withBorder
              style={{
                borderWidth: 2,
                borderColor: "var(--mantine-color-blue-4)",
                // backgroundColor: "var(--mantine-color-blue-0)",
              }}
            >
              <Stack gap="md">
                <Skeleton height={24} width="60%" />
                <Stack gap="md">
                  <Skeleton height={20} width="15%" />
                  <Skeleton height={20} width="15%" />
                  <Skeleton height={20} width="15%" />
                  <Skeleton height={20} width="15%" />
                </Stack>
              </Stack>
            </Paper>
          ))}

          <Skeleton height={44} width={180} radius="xl" />
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
    <Container size="lg" py="xl">
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
                <Text size="xl" fw={600} c="dark" mt={0}>
                  {q.text}
                </Text>
                <Group align="flex-start" wrap="nowrap" gap="md">
                  <Radio.Group
                    value={answers[q.id] || ""}
                    onChange={(val) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: val }))
                    }
                  >
                    <Stack gap="xs">
                      {q.options.map((opt) => (
                        <Radio
                          key={opt.id}
                          value={opt.id}
                          label={opt.text}
                          color="blue"
                          styles={{
                            radio: {
                              borderWidth: 1,
                              borderColor: "var(--mantine-color-blue-4)",
                            },
                          }}
                        />
                      ))}
                    </Stack>
                  </Radio.Group>
                  {submitResult && questionResult !== undefined && (
                    <Group
                      gap="xs"
                      align="center"
                      style={{
                        alignItems: "center",
                        alignSelf: "flex-end",
                        marginLeft: "auto",
                      }}
                    >
                      <Box
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          lineHeight: 0,
                        }}
                      >
                        {isCorrect ? (
                          <IconCircleCheck
                            size={22}
                            color="var(--mantine-color-green-6)"
                          />
                        ) : (
                          <IconCircleX
                            size={22}
                            color="var(--mantine-color-red-6)"
                          />
                        )}
                      </Box>
                      <Text
                        size="sm"
                        fw={500}
                        mt="0"
                        c={isCorrect ? "green.7" : "red.7"}
                        style={{ lineHeight: 1 }}
                      >
                        {isCorrect ? "Верно" : "Неверно"}
                      </Text>
                    </Group>
                  )}
                </Group>
              </Stack>
            </Paper>
          )
        })}

        {submitResult && (
          <Alert
            color={submitResult.score === submitResult.total ? "green" : "blue"}
            title="Результат"
          >
            Вы набрали {submitResult.score} из {submitResult.total}.
          </Alert>
        )}

        {submitMutation.isError && (
          <Alert color="red" title="Ошибка">
            {(submitMutation.error as Error).message}
          </Alert>
        )}

        <AppButton
          size="md"
          onClick={() => submitMutation.mutate()}
          disabled={!canSubmit}
          loading={submitMutation.isPending}
        >
          Отправить
        </AppButton>
      </Stack>
    </Container>
  )
}
