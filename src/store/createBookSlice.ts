import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

const API = "https://bookstore-backend-qgjq.onrender.com/api"

export interface CreateBookPayload {
  coverImage?: File
  title: string
  description: string
  publicationYear: number
  pageCount: number
  weight: number
  price: number
  quantity: number
  publisher: string
  authors: string[]
  genres: string[]
}

interface CreateBookState {
  loading: boolean
  error: string | null
  success: boolean
}

const initialState: CreateBookState = {
  loading: false,
  error: null,
  success: false,
}

/* POST /api/books */
export const createNewBook = createAsyncThunk(
  "createBook/createNewBook",
  async (payload: CreateBookPayload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken")

      if (!token) {
        return rejectWithValue(
          "No authentication token found. Please sign in again."
        )
      }

      console.log("Token being used:", token?.substring(0, 20) + "...")

      const formData = new FormData()

      if (payload.coverImage) {
        formData.append("CoverImage", payload.coverImage)
      }
      formData.append("Title", payload.title)
      formData.append("Description", payload.description)
      formData.append("PublicationYear", payload.publicationYear.toString())
      formData.append("PageCount", payload.pageCount.toString())
      formData.append("Weight", payload.weight.toString())
      formData.append("Price", payload.price.toString())
      formData.append("Quantity", payload.quantity.toString())
      formData.append("Publisher", payload.publisher)

      payload.authors.forEach((author) => {
        formData.append("Authors", author)
      })

      payload.genres.forEach((genre) => {
        formData.append("Genres", genre)
      })

      const res = await fetch(`${API}/books`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (res.status === 401) {
        console.error("401 Unauthorized - Token may be expired or invalid")
        return rejectWithValue("Session expired. Please sign in again.")
      }

      if (!res.ok) {
        const err = await res.json()
        console.error("API Error:", err)
        return rejectWithValue(
          err.message || err.detail || "Failed to create book"
        )
      }

      const contentType = res.headers.get("content-type")
      let data = null

      if (contentType && contentType.includes("application/json")) {
        const text = await res.text()
        if (text) {
          data = JSON.parse(text)
        }
      }

      return data || { success: true }
    } catch (e: any) {
      console.error("Fetch error:", e)
      return rejectWithValue(e.message || "Network error")
    }
  }
)

const CreateBookSlice = createSlice({
  name: "createBook",
  initialState,
  reducers: {
    resetCreateBook(state) {
      state.loading = false
      state.error = null
      state.success = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewBook.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(createNewBook.fulfilled, (state) => {
        state.loading = false
        state.success = true
        state.error = null
      })
      .addCase(createNewBook.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.success = false
      })
  },
})

export const { resetCreateBook } = CreateBookSlice.actions
export default CreateBookSlice.reducer
