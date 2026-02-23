import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { fetchUserProfile } from "./userSlice"
import { signUpUser } from "./signUpSlice"

interface Credentials {
  email: string
  password: string
}

interface SignInState {
  auth: boolean
  username: string | null
  userId: string | null
  firstName?: string | null
  lastName?: string | null
  initialized: boolean
  isLoading: boolean
  error: string | null
}

const initialState: SignInState = {
  auth: false,
  username: null,
  userId: null,
  firstName: null,
  lastName: null,
  initialized: false,
  isLoading: false,
  error: null,
}

export const signInUser = createAsyncThunk(
  "signIn/signInUser",
  async (credentials: Credentials, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        return rejectWithValue(
          data?.detail || data?.message || "Sign-in failed"
        )
      }
      return { ...data, email: credentials.email }
    } catch (e: any) {
      return rejectWithValue(e.message || "Network error")
    }
  }
)

export const hydrateAuth = createAsyncThunk(
  "signIn/hydrateAuth",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" })
      if (!res.ok) return { auth: false }
      const user = await res.json()
      return { auth: true, user }
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

export const signOut = createAsyncThunk(
  "signIn/signOut",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) return rejectWithValue("Sign-out failed")
      return { ok: true }
    } catch (e: any) {
      return rejectWithValue(e.message || "Network error")
    }
  },
)

const signInSlice = createSlice({
  name: "signIn",
  initialState,
  reducers: {
    setAuthUser(
      state,
      action: PayloadAction<{
        id: string
        email: string
        firstName?: string | null
        lastName?: string | null
      }>,
    ) {
      state.initialized = true
      state.auth = true
      state.userId = action.payload.id
      state.username = action.payload.email
      state.firstName = action.payload.firstName || null
      state.lastName = action.payload.lastName || null
      state.error = null
      state.isLoading = false
    },
    logoutLocal(state) {
      state.auth = false
      state.username = null
      state.userId = null
      state.error = null
      state.firstName = null
      state.lastName = null
      state.isLoading = false
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
        state.initialized = true
        state.auth = true
        state.username = action.payload?.email || state.username

        if (action.payload?.userDetails) {
          state.firstName = action.payload.userDetails.firstName || null
          state.lastName = action.payload.userDetails.lastName || null
          state.userId = action.payload.userDetails.id || null
        }
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.isLoading = false
        state.initialized = true
        state.error = (action.payload as string) || "Sign-in failed"
      })
      .addCase(hydrateAuth.pending, (state) => {
        state.isLoading = true
      })
      .addCase(hydrateAuth.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false
        state.initialized = true
        state.auth = action.payload?.auth === true
        if (action.payload?.auth && action.payload?.user) {
          state.userId = action.payload.user.id || null
          state.username = action.payload.user.email || null
          state.firstName = action.payload.user.firstName || null
          state.lastName = action.payload.user.lastName || null
        } else {
          state.userId = null
          state.username = null
          state.firstName = null
          state.lastName = null
        }
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.isLoading = false
        state.initialized = true
        state.auth = false
        state.userId = null
        state.username = null
        state.firstName = null
        state.lastName = null
      })
      .addCase(signOut.fulfilled, (state) => {
        state.initialized = true
        state.auth = false
        state.userId = null
        state.username = null
        state.firstName = null
        state.lastName = null
      })
      .addCase(signUpUser.fulfilled, (state, action: PayloadAction<any>) => {
        // Sign-up also sets session cookie, so we can mark as logged in.
        const details = action.payload?.userDetails
        if (!details) return
        state.initialized = true
        state.auth = true
        state.userId = details.id || null
        state.username = details.email || null
        state.firstName = details.firstName || null
        state.lastName = details.lastName || null
      })
  },
})

export const { logoutLocal, setAuthUser } = signInSlice.actions
export default signInSlice.reducer
