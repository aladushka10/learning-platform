import {
  Box,
  Card,
  Container,
  Group,
  Loader,
  Paper,
  ScrollArea,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import { IconArrowLeft, IconBook2, IconChevronRight } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { AppButton } from "../../components/AppButton/AppButton"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { CoursesService } from "../../services/courses/courses.service"
import { LecturesService } from "../../services/lectures/lectures.service"

interface LectureListItem {
  id: string
  title: string
  content?: string
  courseId?: string
  category?: "math" | "cs"
}

const TheoryPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [lectures, setLectures] = useState<LectureListItem[]>([])
  const { courseId } = useParams<{ courseId: string; taskId: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentFilter = searchParams.get("type") === "cs" ? "cs" : "math"

  useEffect(() => {
    const loadAllLectures = async () => {
      setLoading(true)
      setError(null)
      try {
        const courses = await CoursesService.getCourses()

        const allLectures: LectureListItem[] = []
        for (const course of courses) {
          try {
            const courseLectures = await CoursesService.getCourseLectures(course.id)
            if (Array.isArray(courseLectures)) {
              courseLectures.forEach((l: any) => {
                const isMath =
                  course.category &&
                  course.category.toLowerCase().includes("math")

                const courseCategory: "math" | "cs" = isMath ? "math" : "cs"

                allLectures.push({
                  id: l.id,
                  title: l.title || l.id,
                  courseId: course.id,
                  category: courseCategory,
                })
              })
            }
          } catch {}
        }
        const uniqueById = new Map<string, LectureListItem>()
        allLectures.forEach((l) => {
          if (!uniqueById.has(l.id)) {
            uniqueById.set(l.id, l)
          }
        })

        const list = Array.from(uniqueById.values())

        const enriched: LectureListItem[] = []
        for (const l of list) {
          try {
            const full = await LecturesService.getById(l.id)
            enriched.push({
              id: full.id,
              title: full.title || l.title,
              content: full.content,
              category: l.category,
            })
          } catch {
            enriched.push(l)
          }
        }

        enriched.sort((a, b) => a.title.localeCompare(b.title, "ru"))
        setLectures(enriched)
      } catch (e: any) {
        setError(e.message || "Ошибка загрузки лекций")
      } finally {
        setLoading(false)
      }
    }

    loadAllLectures()
  }, [])

  const handleOpenLecture = (lecture: LectureListItem) => {
    navigate(`/lecture/${lecture.id}?type=${currentFilter}`, {
      state: {
        from: "theory",
        ...(lecture.content
          ? {
              lecture: {
                id: lecture.id,
                title: lecture.title,
                content: lecture.content,
              },
            }
          : {}),
      },
    })
  }

  const filteredLectures = lectures.filter(
    (l) => (l.category || "math") === currentFilter,
  )
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Container size="lg" py="xl" className="flex-1 flex flex-col">
        <Stack gap="xl" className="flex-1 flex flex-col">
          <Group mb="sm" wrap="nowrap">
            <Box
              style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}
            >
              <AppButton
                variant="subtle"
                size="md"
                leftSection={<IconArrowLeft size={20} />}
                onClick={() => {
                  navigate(`/?course=${courseId || ""}`)
                  window.scrollTo(0, 0)
                }}
              >
                Вернуться
              </AppButton>
            </Box>
            <Box>
              <Title order={2}>Теория</Title>
            </Box>
          </Group>

          <Paper
            withBorder
            radius="lg"
            p="lg"
            className="flex-1 bg-white border-gray-100 shadow-sm flex flex-col"
          >
            {loading ? (
              <Stack gap="md" w={1060}>
                <Group justify="space-between" align="center" mb="md">
                  <Title order={3}>Все лекции</Title>
                  <Skeleton height={30} width="25%" radius="sm" />
                </Group>
                <ScrollArea className="flex-1" type="auto">
                  <Stack gap="xs" pr="sm" className="pb-4">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <Card
                        key={idx}
                        withBorder
                        radius="md"
                        p="md"
                        w="100%"
                        className="relative border-gray-200"
                      >
                        <Group gap="md" align="flex-start" p="sm" wrap="nowrap">
                          <Stack gap={8} style={{ flex: 1 }}>
                            <Skeleton height={24} width="40%" radius="sm" />
                            <Skeleton height={18} width="60%" radius="sm" />
                            <Skeleton height={18} width="80%" radius="sm" />
                            <Skeleton height={18} width="85%" radius="sm" />
                            <Skeleton height={18} width="70%" radius="sm" />
                          </Stack>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                </ScrollArea>
              </Stack>
            ) : error ? (
              <Stack gap="sm">
                <Text c="red" size="sm">
                  {error}
                </Text>
                <Text size="xs" c="dimmed">
                  Попробуйте обновить страницу чуть позже.
                </Text>
              </Stack>
            ) : lectures.length === 0 ? (
              <Stack gap="sm">
                <Title order={4}>Лекции не найдены</Title>
                <Text size="sm" c="dimmed">
                  На платформе пока нет опубликованных лекций по математике и
                  информатике.
                </Text>
              </Stack>
            ) : (
              <Stack gap="md" className="flex-1 flex flex-col">
                <Group justify="space-between" align="center">
                  <Title order={3}>Все лекции</Title>
                  <SegmentedControl
                    value={currentFilter}
                    onChange={(value) => {
                      setSearchParams({ type: value }, { replace: true })
                    }}
                    data={[
                      { label: "Математика", value: "math" },
                      { label: "Информатика", value: "cs" },
                    ]}
                  />
                </Group>
                <ScrollArea className="flex-1" type="auto">
                  <Stack gap="xs" pr="sm" className="pb-4">
                    {filteredLectures.map((lecture) => {
                      return (
                        <Card
                          key={lecture.id}
                          withBorder
                          radius="md"
                          p="md"
                          className="hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all relative"
                          onClick={() => {
                            handleOpenLecture(lecture)
                            window.scrollTo(0, 0)
                          }}
                        >
                          <Group gap="md" align="flex-start" p="sm">
                            <IconBook2
                              size={22}
                              className="text-blue-600 mt-[2px]"
                            />
                            <Stack
                              gap={4}
                              style={{ flex: 1, paddingRight: 24 }}
                            >
                              <Text fw={600} c="dark" size="md" mt="3">
                                {lecture.title}
                              </Text>
                              {lecture.content && (
                                <Text size="sm" c="dimmed" lineClamp={4}>
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                  >
                                    {lecture.content}
                                  </ReactMarkdown>
                                </Text>
                              )}
                            </Stack>
                          </Group>
                          <IconChevronRight
                            size={18}
                            className="text-black absolute top-3 right-3"
                          />
                        </Card>
                      )
                    })}
                  </Stack>
                </ScrollArea>
              </Stack>
            )}
          </Paper>
        </Stack>
      </Container>
    </div>
  )
}

export default TheoryPage
