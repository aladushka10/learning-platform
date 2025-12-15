import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { IBookCard, IBookDetails } from "../types/types"
import { mapBackendBookToDetails } from "../utils/mapBackendBookToDetails"

export const getBookInfo = createAsyncThunk(
  "books/getBookInfo",
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const state: any = getState()
      const paginatedBooks: any[] = state.pagination?.books || []
      const found = paginatedBooks.find(
        (b: any) => b.isbn13 === id || b.id === id
      )
      if (found) {
        return found
      }

      const res = await fetch(
        `https://bookstore-backend-qgjq.onrender.com/api/books/search`
      )
      if (!res.ok) throw new Error("Failed to fetch books")
      const data = await res.json()
      const backend = data.find((b: any) => b.id === id || b.isbn13 === id)
      if (!backend) return rejectWithValue("Book not found")
      return mapBackendBookToDetails(backend)
    } catch (e: any) {
      return rejectWithValue(e.message)
    }
  }
)

const selectedBookSlice = createSlice({
  name: "selectedBook",
  initialState: {
    book: null as IBookDetails | null,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    clearSelectedBook(state) {
      state.book = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBookInfo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getBookInfo.fulfilled, (state, action) => {
        state.loading = false
        state.book = action.payload as any
      })
      .addCase(getBookInfo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})
export const { clearSelectedBook } = selectedBookSlice.actions

export default selectedBookSlice.reducer
