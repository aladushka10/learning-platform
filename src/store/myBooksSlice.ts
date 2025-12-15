import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

export const getMyBooks = createAsyncThunk(
  "myBooks/getMyBooks",
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem("access")
      const response = await fetch("https://api.itbook.store/1.0/new", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + JSON.parse(access as string),
        },
      })
      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          return rejectWithValue(errorData.detail)
        }
        throw new Error("error is here")
      }
      const data = await response.json()
      return data.results
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)
const myBooksSlice = createSlice({
  name: "myBooks",
  initialState: {
    myBooks: [],
    error: null as null | string,
    isLoading: false,
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getMyBooks.fulfilled, (state, action) => {
      state.myBooks = action.payload
      state.isLoading = false
    })
    builder.addCase(getMyBooks.pending, (state) => {
      state.error = null
      state.isLoading = true
    })
    builder.addCase(getMyBooks.rejected, (state, action) => {
      state.error = (action.payload as string) || "error!!!!!!"

      state.isLoading = false
    })
  },
})
export default myBooksSlice.reducer
