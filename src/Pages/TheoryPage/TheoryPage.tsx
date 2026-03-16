import {
  Box,
  Card,
  Container,
  Group,
  Loader,
  Paper,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import { IconArrowLeft, IconBook2, IconChevronRight } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { fetchLectures, fetchLectureById } from "../../utils/api"
import { AppButton } from "../../components/AppButton/AppButton"
import removeMarkdown from "remove-markdown"

interface LectureListItem {
  id: string
  title: string
  content?: string
  courseId?: string
  category?: "math" | "cs"
}

const TheoryPage = () => {
  const navigate = useNavigate()
  const [lectures, setLectures] = useState<LectureListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<"math" | "cs">("math")

  useEffect(() => {
    const loadAllLectures = async () => {
      setLoading(true)
      setError(null)
      try {
        const coursesRes = await fetch("/api/courses")
        if (!coursesRes.ok) throw new Error("Не удалось загрузить курсы")
        const courses: { id: string; title?: string; category?: string }[] =
          await coursesRes.json()

        const allLectures: LectureListItem[] = []
        for (const course of courses) {
          try {
            const courseLectures = await fetchLectures(course.id)
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
            const full = await fetchLectureById(l.id)
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
    navigate(`/lecture/${lecture.id}`, {
      state: lecture.content
        ? {
            lecture: {
              id: lecture.id,
              title: lecture.title,
              content: lecture.content,
            },
          }
        : undefined,
    })
  }

  const filteredLectures = lectures.filter(
    (l) => (l.category || "math") === categoryFilter,
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
                  navigate(-1)
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
              <Group justify="center" py="xl">
                <Loader />
                <Text c="dimmed" size="sm">
                  Загрузка лекций...
                </Text>
              </Group>
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
                  <Title order={4}>Все лекции</Title>
                  <SegmentedControl
                    size="xs"
                    value={categoryFilter}
                    onChange={(value) =>
                      setCategoryFilter(value as "math" | "cs")
                    }
                    data={[
                      { label: "Математика", value: "math" },
                      { label: "Информатика", value: "cs" },
                    ]}
                  />
                </Group>
                <ScrollArea className="flex-1" type="auto">
                  {/* <Stack gap="xs" pr="sm" className="pb-4">
                    {filteredLectures.map((lecture) => (
                      <Card
                        key={lecture.id}
                        withBorder
                        radius="md"
                        p="md"
                        className="hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all relative"
                        onClick={() => handleOpenLecture(lecture)}
                      >
                        <Group gap="sm" align="flex-start">
                          <IconBook2
                            size={22}
                            className="text-blue-600 mt-[2px]"
                          />
                          <Stack gap={4}>
                            <Text fw={600} c={"dark"} size="sm">
                              {lecture.title}
                            </Text>
                            {lecture.content && (
                              <Text size="xs" c="dimmed" lineClamp={2}>
                                {lecture.content}
                              </Text>
                            )}
                          </Stack>
                        </Group>
                        <IconChevronRight
                          size={18}
                          className="text-black absolute top-3 right-3"
                        />
                      </Card>
                    ))}
                  </Stack> */}
                  <Stack gap="xs" pr="sm" className="pb-4">
                    {filteredLectures.map((lecture) => {
                      const plainDescription = removeMarkdown(
                        lecture.content || "",
                      )

                      return (
                        <Card
                          key={lecture.id}
                          withBorder
                          radius="md"
                          p="md"
                          className="hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all relative"
                          onClick={() => handleOpenLecture(lecture)}
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
                              <Text fw={600} c="dark" size="sm" mt="3">
                                {lecture.title}
                              </Text>
                              {lecture.content && (
                                <Text size="xs" c="dimmed" lineClamp={2}>
                                  {plainDescription}
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
