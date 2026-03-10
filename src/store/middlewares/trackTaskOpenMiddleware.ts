import { createAction } from "@reduxjs/toolkit"
import { trackTaskOpen } from "../../utils/api"

export const taskPageOpened = createAction<{ userId: string; taskId: string }>(
  "tasks/pageOpened",
)

export const trackTaskOpenMiddleware =
  (store: any) => (next: any) => (action: any) => {
    if (action.type === "tasks/pageOpened") {
      const { userId, taskId } = action.payload
      if (userId && taskId) {
        trackTaskOpen(userId, taskId)
      }
    }

    return next(action)
  }
