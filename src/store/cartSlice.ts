import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

const API = "https://bookstore-backend-qgjq.onrender.com/api"

export interface CartItem {
  bookId: string
  title: string
  price: string
  image: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  loading: boolean
  error: string | null
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken")

      if (!token) {
        return rejectWithValue("No access token")
      }

      const res = await fetch(`${API}/carts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("accessToken")
          return rejectWithValue("Session expired")
        }
        const err = await res.json()
        return rejectWithValue(err.message || "Failed to load cart")
      }

      const data = await res.json()
      return data
    } catch (e: any) {
      return rejectWithValue(e.message)
    }
  }
)

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (bookId: string, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("accessToken")

      if (!token) {
        return rejectWithValue("Please login to add to cart")
      }

      const res = await fetch(`${API}/carts/${bookId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        const err = await res.json()
        return rejectWithValue(err.message || "Failed to add to cart")
      }

      await dispatch(fetchCart())
      return bookId
    } catch (e: any) {
      return rejectWithValue(e.message)
    }
  }
)

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (bookId: string, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("accessToken")

      if (!token) {
        return rejectWithValue("Please login to remove from cart")
      }

      const res = await fetch(`${API}/carts/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const err = await res.json()
        return rejectWithValue(err.message || "Failed to remove from cart")
      }

      await dispatch(fetchCart())
      return bookId
    } catch (e: any) {
      return rejectWithValue(e.message)
    }
  }
)

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload

        if (response.cartItems && Array.isArray(response.cartItems)) {
          state.items = response.cartItems.map((item: any) => {
            const title = item.bookTitle || item.title || "Unknown title"

            const price =
              item.bookPrice?.toString() || item.price?.toString() || "0"

            return {
              bookId: item.bookId || item.id,
              title,
              price,
              image: item.base64CoverImage
                ? `data:image/jpeg;base64,${item.base64CoverImage}`
                : "/placeholder.png",

              quantity: item.quantity || 1,
            }
          })

          localStorage.setItem("cart_cache", JSON.stringify(state.items))
        } else if (Array.isArray(response)) {
          state.items = response.map((item: any) => ({
            bookId: item.bookId || item.id,
            title: item.bookTitle || item.title || "Unknown title",
            price: item.bookPrice?.toString() || item.price?.toString() || "0",
            image: item.base64CoverImage
              ? `data:image/jpeg;base64,${item.base64CoverImage}`
              : "/placeholder.png",

            quantity: item.quantity || 1,
          }))
        } else {
          state.items = []
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        const cache = localStorage.getItem("cart_cache")
        if (cache) {
          try {
            state.items = JSON.parse(cache)
          } catch (e) {
            state.items = []
          }
        }
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true
      })
      .addCase(removeFromCart.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearCart } = cartSlice.actions
export default cartSlice.reducer
