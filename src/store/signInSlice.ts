import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { fetchUserProfile } from "./userSlice"
import { signUpUser } from "./signUpSlice"
import { AuthService } from "../services/auth/auth.service"

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
  avatarId?: string | null
  isAdmin?: boolean
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
  avatarId: null,
  isAdmin: false,
  initialized: false,
  isLoading: false,
  error: null,
}

export const signInUser = createAsyncThunk(
  "signIn/signInUser",
  async (credentials: Credentials, { rejectWithValue }) => {
    try {
      return await AuthService.signIn(credentials)
    } catch (e: any) {
      return rejectWithValue(e.message || "Network error")
    }
  },
)

export const hydrateAuth = createAsyncThunk(
  "signIn/hydrateAuth",
  async (_, { rejectWithValue }) => {
    try {
      const user = await AuthService.getSession()
      return { auth: true, user }
    } catch (e: any) {
      return rejectWithValue(e.message || "error")
    }
  },
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
  },
)

export const signOut = createAsyncThunk(
  "signIn/signOut",
  async (_, { rejectWithValue }) => {
    try {
      return await AuthService.signOut()
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
        avatarId?: string | null
      }>,
    ) {
      state.initialized = true
      state.auth = true
      state.userId = action.payload.id
      state.username = action.payload.email
      state.firstName = action.payload.firstName || null
      state.lastName = action.payload.lastName || null
      state.avatarId = action.payload.avatarId ?? null
      state.isAdmin = action.payload.isAdmin ?? false
      state.error = null
      state.isLoading = false
    },
    setAvatarId(state, action: PayloadAction<string | null>) {
      state.avatarId = action.payload
    },
    logoutLocal(state) {
      state.auth = false
      state.username = null
      state.userId = null
      state.error = null
      state.firstName = null
      state.lastName = null
      state.avatarId = null
      state.isAdmin = false
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
        if (action.payload?.userDetails) {
          state.username = action.payload.userDetails.email || state.username
          state.firstName = action.payload.userDetails.firstName || null
          state.lastName = action.payload.userDetails.lastName || null
          state.userId = action.payload.userDetails.id || null
          state.avatarId = action.payload.userDetails.avatarId ?? null
          state.isAdmin = action.payload.userDetails.isAdmin ?? false
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
          state.avatarId = action.payload.user.avatarId ?? null
          state.isAdmin = action.payload.user.isAdmin ?? false
        } else {
          state.userId = null
          state.username = null
          state.firstName = null
          state.lastName = null
          state.avatarId = null
          state.isAdmin = false
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
        state.avatarId = null
        state.isAdmin = false
      })
      .addCase(signOut.fulfilled, (state) => {
        state.initialized = true
        state.auth = false
        state.userId = null
        state.username = null
        state.firstName = null
        state.lastName = null
        state.avatarId = null
        state.isAdmin = false
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
        state.avatarId = details.avatarId ?? null
        state.isAdmin = details.isAdmin ?? false
      })
  },
})

export const { logoutLocal, setAuthUser, setAvatarId } = signInSlice.actions
export default signInSlice.reducer
