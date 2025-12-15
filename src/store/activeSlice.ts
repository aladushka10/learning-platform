import { createSlice } from "@reduxjs/toolkit"

const activeSlice = createSlice({
  name: "active",
  initialState: {
    isActive: false,
  },
  reducers: {
    toggleActive(state) {
      if (!state.isActive) state.isActive = true
      else state.isActive = false
    },
  },
})
export const { toggleActive } = activeSlice.actions
export default activeSlice.reducer
