import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { mapBackendBookToDetails } from "../utils/mapBackendBookToDetails"

const API = "https://bookstore-backend-qgjq.onrender.com/api"

export const searchBooks = createAsyncThunk(
  "search/searchBooks",
  async ({ query }: { query: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API}/books/search?PageSize=100&query=${encodeURIComponent(query)}`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch books")
      }

      const data = await response.json()

      const books = Array.isArray(data) ? data : []

      return { books, query }
    } catch (e: any) {
      return rejectWithValue(e.message || "Search error")
    }
  }
)

const searchSlice = createSlice({
  name: "search",
  initialState: {
    allBooks: [] as any[],
    books: [],
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    searchQueryTitle: "",
    searchQuery: "",
    loading: false,
    error: null as string | null,
  },
  reducers: {
    setPage(state, action) {
      state.currentPage = action.payload
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload
    },
    setSearchQueryTitle(state, action) {
      state.searchQueryTitle = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchBooks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchBooks.fulfilled, (state, action) => {
        const { books, query } = action.payload

        state.loading = false
        state.currentPage = 1
        state.allBooks = books

        const q = query.toLowerCase()

        const filtered = books.filter((b: any) => {
          const authorsText = Array.isArray(b.authors)
            ? b.authors.join(" ")
            : b.authors || ""

          const descriptionText = b.description || b.desc || ""

          return (
            (b.title || "").toLowerCase().includes(q) ||
            descriptionText.toLowerCase().includes(q) ||
            (b.publisher || "").toLowerCase().includes(q) ||
            authorsText.toLowerCase().includes(q)
          )
        })

        state.books = filtered.map(mapBackendBookToDetails)
        state.totalItems = state.books.length
      })
      .addCase(searchBooks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setPage, setSearchQuery, setSearchQueryTitle } =
  searchSlice.actions

export default searchSlice.reducer
