import { createSlice } from "@reduxjs/toolkit"

const popUpSlice = createSlice({
  name: "popUp",
  initialState: { isOpen: false, bookId: null },
  reducers: {
    openPopUp(state, action) {
      state.isOpen = true
      state.bookId = action.payload
    },
    closePopUp(state) {
      state.isOpen = false
      state.bookId = null
    },
  },
})

export const { openPopUp, closePopUp } = popUpSlice.actions

export default popUpSlice.reducer
