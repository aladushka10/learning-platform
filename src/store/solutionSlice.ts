import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface Solution {
  id: string
  user_id: string
  task_id: string
  code: string
  created_at: number
}

export interface CheckResult {
  id: string
  solution_id: string
  status: "passed" | "failed"
  time_ms: number
  passed_tests: number
  error_message: string | null
}

interface SolutionState {
  solutions: Solution[]
  currentSolution: Solution | null
  checkResults: Record<string, CheckResult[]>
  submitting: boolean
  error: string | null
}

const initialState: SolutionState = {
  solutions: [],
  currentSolution: null,
  checkResults: {},
  submitting: false,
  error: null,
}

export const solutionSlice = createSlice({
  name: "solution",
  initialState,
  reducers: {
    setSolutions: (state, action: PayloadAction<Solution[]>) => {
      state.solutions = action.payload
    },
    setCurrentSolution: (state, action: PayloadAction<Solution | null>) => {
      state.currentSolution = action.payload
    },
    addSolution: (state, action: PayloadAction<Solution>) => {
      state.solutions.push(action.payload)
      state.currentSolution = action.payload
    },
    setCheckResults: (
      state,
      action: PayloadAction<{ solutionId: string; results: CheckResult[] }>
    ) => {
      state.checkResults[action.payload.solutionId] = action.payload.results
    },
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.submitting = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setSolutions,
  setCurrentSolution,
  addSolution,
  setCheckResults,
  setSubmitting,
  setError,
  clearError,
} = solutionSlice.actions

export default solutionSlice.reducer
