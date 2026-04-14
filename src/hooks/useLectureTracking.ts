import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { LecturesService } from "../services/lectures/lectures.service"
import type { UserLectureStats } from "../services/lectures/lectures.type"

export function formatLectureTimeMs(ms: number): string {
  if (isNaN(ms) || ms < 1000) return "не заходил"

  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600_000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)

  const parts = []
  if (h > 0) parts.push(`${h} ч`)
  if (m > 0) parts.push(`${m} мин`)
  if (s > 0) parts.push(`${s} с`)

  return parts.join(" ") || "0 с"
}

export function useLectureTracking(lectureId: string | undefined) {
  const auth = useSelector((s: { signIn?: { auth?: boolean } }) =>
    Boolean(s.signIn?.auth),
  )
  const [stats, setStats] = useState<UserLectureStats | null>(null)

  useEffect(() => {
    if (!lectureId || !auth) return

    const startTime = Date.now()
    let sent = false

    LecturesService.trackLecture(lectureId, { registerVisit: true })
      .then(() => LecturesService.getMyLectureStats(lectureId))
      .then(setStats)
      .catch(() => {})

    const sendTimeSpent = () => {
      if (sent) return
      const durationMs = Date.now() - startTime
      if (durationMs < 1000) return
      sent = true
      LecturesService.trackLectureTimeBeacon(lectureId, durationMs)
    }

    window.addEventListener("beforeunload", sendTimeSpent)
    window.addEventListener("pagehide", sendTimeSpent)

    return () => {
      window.removeEventListener("beforeunload", sendTimeSpent)
      window.removeEventListener("pagehide", sendTimeSpent)
      sendTimeSpent()
      void LecturesService.getMyLectureStats(lectureId)
        .then(setStats)
        .catch(() => {})
    }
  }, [lectureId, auth])

  return stats
}
