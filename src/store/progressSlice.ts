import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface ProgressRecord {
  id: string
  userId: string
  taskId: string
  status: "not_started" | "in_progress" | "completed"
  updatedAt: number
}

interface ProgressState {
  records: ProgressRecord[]
  loading: boolean
  error: string | null
}

const initialState: ProgressState = {
  records: [],
  loading: false,
  error: null,
}

export const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {
    setProgressRecords: (state, action: PayloadAction<ProgressRecord[]>) => {
      state.records = action.payload
    },
    updateProgress: (state, action: PayloadAction<ProgressRecord>) => {
      const index = state.records.findIndex(
        (r) => r.taskId === action.payload.taskId
      )
      if (index >= 0) {
        state.records[index] = action.payload
      } else {
        state.records.push(action.payload)
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setProgressRecords, updateProgress, setLoading, setError } =
  progressSlice.actions

export default progressSlice.reducer
