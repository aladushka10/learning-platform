import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

const API_BASE = "http://localhost:4000"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  createdAt: string
}

interface UserState {
  data: User | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  data: null,
  loading: false,
  error: null,
}

export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken")
      const email = localStorage.getItem("username")

      if (!token || !email) {
        return rejectWithValue("No auth info")
      }

      const response = await fetch(`${API_BASE}/auth/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(
          error.detail || error.message || "Failed to fetch user data"
        )
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error")
    }
  }
)

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserData: (state) => {
      state.data = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
        if (action.payload) {
          localStorage.setItem("firstName", action.payload.firstName || "")
          localStorage.setItem("lastName", action.payload.lastName || "")
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearUserData } = userSlice.actions
export default userSlice.reducer
