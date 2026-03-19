import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { AuthService } from "../services/auth/auth.service"

interface ISignUpData {
  email: string
  password: string
  firstName: string
  lastName?: string
}

export const signUpUser = createAsyncThunk(
  "auth/signUpUser",
  async (userData: ISignUpData, { rejectWithValue }) => {
    try {
      const payload = {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName || "",
      }
      return await AuthService.signUp(payload)
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

interface SignUpState {
  loading: boolean
  error: string | null
  success: boolean
}

const signUpSlice = createSlice({
  name: "signUp",
  initialState: {
    loading: false,
    error: null as string | null,
    success: false,
  } as SignUpState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUpUser.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(signUpUser.fulfilled, (state) => {
        state.loading = false
        state.success = true
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.success = false
      })
  },
})

export const { clearError, clearSuccess } = signUpSlice.actions
export default signUpSlice.reducer
