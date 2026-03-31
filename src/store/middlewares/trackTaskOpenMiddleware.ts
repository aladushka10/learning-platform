import { createAction } from "@reduxjs/toolkit"
import { TasksService } from "../../services/tasks/tasks.service"

export const taskPageOpened = createAction<{ userId: string; taskId: string }>(
  "tasks/pageOpened",
)

export const trackTaskOpenMiddleware =
  (store: any) => (next: any) => (action: any) => {
    if (action.type === "tasks/pageOpened") {
      const { userId, taskId } = action.payload
      if (userId && taskId) {
        TasksService.trackTaskOpen(taskId, userId)
      }
    }

    return next(action)
  }
