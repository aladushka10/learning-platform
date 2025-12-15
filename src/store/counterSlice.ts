import { createSlice } from "@reduxjs/toolkit"

const countSlice = createSlice({
  name: "counter",
  initialState: {
    count: 0,
    likes: 0,
    dislikes: 0,
  },
  reducers: {
    incrementLike(state) {
      state.likes += 1
    },
    incrementDislike(state) {
      state.dislikes += 1
      state.count = state.count + 1
    },
    decrement(state) {
      state.count = state.count - 1
    },
    incAny(state, action) {
      state.count = state.count + action.payload
    },
  },
})
export const { incrementLike, incrementDislike, decrement, incAny } =
  countSlice.actions
export default countSlice.reducer
