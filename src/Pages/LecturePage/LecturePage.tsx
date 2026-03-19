import { useEffect, useState } from "react"
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom"
import { IconArrowLeft, IconBook2 } from "@tabler/icons-react"
import {
  Box,
  Code,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import { AppButton } from "../../components/AppButton/AppButton"
import { fetchLectureById } from "../../utils/api"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
interface LectureData {
  id: string
  title: string
  content: string
}

const LecturePage = () => {
  const { lectureId } = useParams<{ lectureId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const [lecture, setLecture] = useState<LectureData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadLecture = async () => {
      setLoading(true)
      setError(null)

      try {
        if (location.state?.lecture) {
          setLecture(location.state.lecture)
          setLoading(false)
          return
        }

        if (lectureId) {
          const data = await fetchLectureById(lectureId)
          setLecture(data)
        }
      } catch (err: any) {
        setError(err.message || "Не удалось загрузить лекцию")
      } finally {
        setLoading(false)
      }
    }

    loadLecture()
  }, [lectureId, location.state])

  if (loading) {
    return (
      <Container
        size="lg"
        py="xl"
        className="flex-1 flex items-center justify-center"
      >
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed" size="sm">
            Загрузка лекции...
          </Text>
        </Stack>
      </Container>
    )
  }

  if (error || !lecture) {
    return (
      <Container
        size="sm"
        py="xl"
        className="flex-1 flex items-center justify-center"
      >
        <Paper withBorder radius="lg" p="xl" className="w-full max-w-md">
          <Stack gap="md">
            <Text c="red" size="sm">
              {error || "Лекция не найдена"}
            </Text>
            <AppButton variant="outline" onClick={() => navigate(-1)} fullWidth>
              Вернуться
            </AppButton>
          </Stack>
        </Paper>
      </Container>
    )
  }

  const fromTheory = location.state?.from === "theory"
  const typeFromQuery = searchParams.get("type") === "cs" ? "cs" : "math"

  return (
    <Container size="md" py="xl" className="flex-1 flex flex-col">
      <Stack gap="xl" className="flex-1">
        <Group mb="sm" wrap="nowrap">
          <Box
            style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}
          >
            <AppButton
              variant="subtle"
              size="md"
              leftSection={<IconArrowLeft size={20} />}
              onClick={() => {
                if (fromTheory) {
                  navigate(`/theory?type=${typeFromQuery}`)
                } else {
                  navigate(-1)
                }
              }}
            >
              Вернуться
            </AppButton>
          </Box>
          <Box>
            <Title order={2}> {lecture.title}</Title>
          </Box>
        </Group>

        <Paper
          withBorder
          radius="lg"
          p="xl"
          className="flex-1 bg-white border-gray-100 shadow-sm flex flex-col"
        >
          <Stack gap="lg" p="xl" className="flex-1">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                code({ inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "")
                  if (!inline && match) {
                    return (
                      <Code block miw={0} className="text-[24px]" {...props}>
                        {String(children).replace(/\n$/, "")}
                      </Code>
                    )
                  }
                  return (
                    <Code className={className} {...props}>
                      {children}
                    </Code>
                  )
                },
              }}
            >
              {lecture.content}
            </ReactMarkdown>

            {!fromTheory && (
              <Group grow gap="md" mt="md">
                <AppButton variant="outline" onClick={() => navigate(-1)}>
                  Вернуться назад
                </AppButton>
                <AppButton
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate("/")}
                >
                  К задачам
                </AppButton>
              </Group>
            )}
          </Stack>
        </Paper>

        <Text ta="center" size="sm" c="dimmed">
          Материал предоставлен в образовательных целях.
        </Text>
      </Stack>
    </Container>
  )
}

export default LecturePage
