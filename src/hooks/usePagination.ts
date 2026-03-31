import { useCallback, useEffect, useMemo, useState } from "react"

export function usePagination<T>(items: T[], itemsPerPage: number) {
  const [limit, setLimit] = useState(itemsPerPage)

  useEffect(() => {
    setLimit((prev) => {
      const total = items.length
      if (total <= 0) return 0
      if (prev <= 0) return Math.min(itemsPerPage, total)
      return Math.min(prev, total)
    })
  }, [items.length, itemsPerPage])

  const loadMore = useCallback(() => {
    setLimit((prev) => Math.min(prev + itemsPerPage, items.length))
  }, [itemsPerPage, items.length])

  const reset = useCallback(() => {
    setLimit(Math.min(itemsPerPage, items.length))
  }, [itemsPerPage, items.length])

  const displayedItems = useMemo(
    () => items.slice(0, Math.max(0, limit)),
    [items, limit],
  )

  const hasMore = limit < items.length

  return { displayedItems, hasMore, loadMore, reset }
}
