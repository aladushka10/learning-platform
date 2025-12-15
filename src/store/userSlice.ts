import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

const API = "https://bookstore-backend-qgjq.onrender.com/api"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  dateOfBirth: string | null
  roles: string[]
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

      if (!token) {
        return rejectWithValue("No access token")
      }

      const response = await fetch(`${API}/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(
          error.detail || error.message || "Failed to fetch user data"
        )
      }

      const data = await response.json()
      return Array.isArray(data) && data.length > 0 ? data[0] : null
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
