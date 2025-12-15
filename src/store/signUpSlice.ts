import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

interface ISignUpData {
  email: string
  password: string
  firstName: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
}

export const signUpUser = createAsyncThunk(
  "auth/signUpUser",
  async (userData: ISignUpData, { rejectWithValue }) => {
    try {
      let formattedDateOfBirth = userData.dateOfBirth || null
      if (formattedDateOfBirth) {
        const parts = formattedDateOfBirth.split("-")
        if (parts.length === 3 && parts[2].length === 4) {
          formattedDateOfBirth = `${parts[2]}-${parts[1]}-${parts[0]}`
        }
      }

      const payload = {
        email: userData.email,
        passwordHash: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName || "",
        phone: userData.phone || "",
        dateOfBirth: formattedDateOfBirth,
      }

      console.log("Sending sign-up payload:", payload)

      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })

      const responseData = await response.json()
      console.log("Sign-up response:", responseData)

      if (!response.ok) {
        return rejectWithValue(
          responseData.detail ||
            responseData.message ||
            responseData.title ||
            "Sign-up failed"
        )
      }

      return responseData
    } catch (error: any) {
      console.error("Sign-up catch error:", error)
      return rejectWithValue(error.message || "Network error")
    }
  }
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
