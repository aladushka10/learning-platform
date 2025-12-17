import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, BookOpen } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader } from "../ui/card"
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

  const [lecture, setLecture] = useState<LectureData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadLecture = async () => {
      setLoading(true)
      setError(null)

      try {
        // Try to get from location state first
        if (location.state?.lecture) {
          setLecture(location.state.lecture)
          setLoading(false)
          return
        }

        // Otherwise fetch from API
        if (lectureId) {
          const data = await fetchLectureById(lectureId)
          setLecture(data)
        }
      } catch (err: any) {
        setError(err.message || "Failed to load lecture")
      } finally {
        setLoading(false)
      }
    }

    loadLecture()
  }, [lectureId, location.state])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка лекции...</p>
        </div>
      </div>
    )
  }

  if (error || !lecture) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-red-600 mb-4">{error || "Lecture not found"}</p>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full"
            >
              Вернуться
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft size={20} />
            Вернуться
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen size={24} className="text-purple-600" />
            {lecture.title}
          </h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-l-4 border-l-purple-600 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <h2 className="text-2xl font-semibold text-gray-900">
              {lecture.title}
            </h2>
            <p className="text-sm text-gray-600 mt-1">Материал для изучения</p>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none pt-8">
            <div className="bg-white rounded-lg p-6">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {lecture.content}
              </ReactMarkdown>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4 justify-between">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="flex-1"
              >
                Вернуться к задаче
              </Button>
              <Button
                onClick={() => navigate("/")}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                К другим задачам
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>
            Материал предоставлен в образовательных целях. Для более полного
            понимания, рекомендуется прочитать дополнительные источники.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LecturePage
