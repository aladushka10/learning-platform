import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { fetchUserProfile } from "./userSlice"

interface Credentials {
  email: string
  passwordHash: string
}

interface SignInState {
  auth: boolean
  username: string | null
  firstName?: string | null
  lastName?: string | null
  isLoading: boolean
  error: string | null
  accessToken: string | null
  refreshToken: string | null
}

const initialState: SignInState = {
  auth: localStorage.getItem("auth") === "true",
  username: localStorage.getItem("username") || null,
  firstName: localStorage.getItem("firstName") || null,
  lastName: localStorage.getItem("lastName") || null,
  isLoading: false,
  error: null,
  accessToken: localStorage.getItem("accessToken") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
}

export const signInUser = createAsyncThunk(
  "signIn/signInUser",
  async (credentials: Credentials, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email,
          passwordHash: credentials.passwordHash,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        return rejectWithValue(
          data?.detail || data?.message || "Sign-in failed"
        )
      }
      localStorage.setItem("accessToken", data.accessToken)
      localStorage.setItem("refreshToken", data.refreshToken)
      return { ...data, email: credentials.email }
    } catch (e: any) {
      return rejectWithValue(e.message || "Network error")
    }
  }
)

export const checkValidToken = createAsyncThunk(
  "signIn/checkValidToken",
  async (_, { rejectWithValue }) => {
    try {
      const access = localStorage.getItem("accessToken")
      const username = localStorage.getItem("username") || null
      return { auth: !!access, username }
    } catch (e: any) {
      return rejectWithValue(e.message || "error")
    }
  }
)

export const loginAndFetchUser = createAsyncThunk(
  "signIn/loginAndFetchUser",
  async (credentials: Credentials, { dispatch, rejectWithValue }) => {
    try {
      const loginResult = await dispatch(signInUser(credentials)).unwrap()

      await dispatch(fetchUserProfile()).unwrap()

      return loginResult
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed")
    }
  }
)

const signInSlice = createSlice({
  name: "signIn",
  initialState,
  reducers: {
    logout(state) {
      state.auth = false
      state.username = null
      state.error = null
      state.firstName = null
      state.lastName = null
      state.isLoading = false
      state.accessToken = null
      state.refreshToken = null
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("firstName")
      localStorage.removeItem("lastName")
      localStorage.removeItem("auth")
      localStorage.removeItem("username")
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })

      .addCase(signInUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false
        state.auth = true
        state.username = action.payload?.email || state.username
        state.accessToken = action.payload.accessToken

        localStorage.setItem("accessToken", action.payload.accessToken)
        console.log("New token stored:", localStorage.getItem("accessToken"))

        if (action.payload?.userDetails) {
          state.firstName = action.payload.userDetails.firstName || null
          state.lastName = action.payload.userDetails.lastName || null
          if (action.payload.userDetails.firstName) {
            localStorage.setItem(
              "firstName",
              action.payload.userDetails.firstName
            )
          }
          if (action.payload.userDetails.lastName) {
            localStorage.setItem(
              "lastName",
              action.payload.userDetails.lastName
            )
          }
        }

        if (action.payload?.accessToken) {
          localStorage.setItem("accessToken", action.payload.accessToken)
        }
        if (action.payload?.refreshToken) {
          localStorage.setItem("refreshToken", action.payload.refreshToken)
        }
        localStorage.setItem("auth", "true")
        localStorage.setItem("username", action.payload?.email || "")
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || "Sign-in failed"
      })
      .addCase(
        checkValidToken.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.auth = action.payload?.auth || false
          state.username = action.payload?.username || state.username
        }
      )
  },
})

export const { logout } = signInSlice.actions
export default signInSlice.reducer
