import { useNavigate, useParams } from "react-router-dom"
import { IconArrowLeft } from "@tabler/icons-react"
import { Paper, Radio, Stack, Title, Text } from "@mantine/core"
import { AppButton } from "../AppButton/AppButton"

const questions = [
  {
    id: "1",
    text: "Выберите правильное утверждение о производной.",
    options: [
      "Производная константы равна нулю",
      "Производная константы равна единице",
      "Производная не определена для констант",
    ],
  },
]

export default function QuizPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()

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
          <Title order={2}>Тест</Title>
        </div>

        <Stack gap="lg">
          {questions.map((q) => (
            <Paper key={q.id} withBorder radius="lg" p="xl">
              <Stack gap="md">
                <Text fw={600} className="text-gray-900">
                  {q.text}
                </Text>
                <Radio.Group>
                  <Stack gap="xs">
                    {q.options.map((opt, idx) => (
                      <Radio
                        key={idx}
                        value={String(idx)}
                        label={opt}
                        className="cursor-pointer"
                      />
                    ))}
                  </Stack>
                </Radio.Group>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </div>
    </div>
  )
}
