import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { IBookCard } from "../types/types"
import { mapBackendBookToDetails } from "../utils/mapBackendBookToDetails"

export const fetchBooks = createAsyncThunk(
  "books/fetchBooks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        "https://bookstore-backend-qgjq.onrender.com/api/books/search/?PageSize=100"
      )

      if (!response.ok) {
        throw new Error("Failed to fetch books")
      }

      const data = await response.json()

      const booksWithIds = data.map((book: any, index: number) => ({
        ...book,
        isbn13: book.id || book.isbn13 || `book-${index}-${Date.now()}`,
      }))

      return booksWithIds
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const paginationSlice = createSlice({
  name: "pagination",
  initialState: {
    books: [] as IBookCard[],
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 9,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false
        state.books = action.payload.map(mapBackendBookToDetails)
        state.totalItems = action.payload.length
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})
export const { setPage } = paginationSlice.actions

export default paginationSlice.reducer
