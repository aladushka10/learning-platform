import { useEffect, useState } from "react"

export function useTaskCategoryById(enabled: boolean) {
  const [mapping, setMapping] = useState<Record<string, "math" | "cs">>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const coursesRes = await fetch("/api/courses", {
          credentials: "include",
          cache: "no-store",
        })
        if (!coursesRes.ok) return
        const courses: { id: string; category?: string }[] =
          await coursesRes.json()

        const next: Record<string, "math" | "cs"> = {}
        for (const c of courses) {
          try {
            const tasksRes = await fetch(`/api/courses/${c.id}/tasks`, {
              credentials: "include",
              cache: "no-store",
            })
            if (!tasksRes.ok) continue
            const tasks: { id: string }[] = await tasksRes.json()
            const cat: "math" | "cs" =
              String(c.category || "").toLowerCase().includes("math")
                ? "math"
                : "cs"
            tasks.forEach((t) => {
              next[t.id] = cat
            })
          } catch {}
        }

        if (!cancelled) setMapping(next)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [enabled])

  return { mapping, loading }
}

