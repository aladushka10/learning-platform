import { createSlice } from "@reduxjs/toolkit"

const myThemSlice = createSlice({
  name: "myAppTheme",
  initialState: {
    theme: "light",
  },
  reducers: {
    switchTheme(state, action) {
      state.theme = action.payload
    },
  },
})
export const { switchTheme } = myThemSlice.actions
export default myThemSlice.reducer
