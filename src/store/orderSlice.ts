import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

const API = "https://bookstore-backend-qgjq.onrender.com/api"

export const createOrder = createAsyncThunk(
  "orders/create",
  async (
    {
      deliveryAddress,
      customerNotes,
      items,
    }: {
      deliveryAddress: string
      customerNotes?: string
      items: { bookId: string; count: number }[]
    },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("accessToken")
      console.log("Creating order with token:", token)
      console.log("Order items:", items)
      console.log("Delivery address:", deliveryAddress)

      const payload = {
        deliveryAddress,
        customerNotes,
        orderItems: items,
      }
      console.log("Sending payload:", JSON.stringify(payload, null, 2))

      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      console.log("Order response status:", res.status)

      if (!res.ok) {
        const err = await res.json()
        console.error("Order error:", err)
        return rejectWithValue(err.message || err.detail || "Order failed")
      }

      const result = await res.json()
      console.log("Order created successfully:", result)
      return result
    } catch (e: any) {
      console.error("Order exception:", e)
      return rejectWithValue(e.message)
    }
  }
)
export const payOrder = createAsyncThunk(
  "orders/pay",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken")

      const res = await fetch(`${API}/orders/${orderId}/pay`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const err = await res.json()
        return rejectWithValue(err.message)
      }

      return await res.json()
    } catch (e: any) {
      return rejectWithValue(e.message)
    }
  }
)

export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchDetails",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken")

      const res = await fetch(`${API}/orders/${orderId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const err = await res.json()
        return rejectWithValue(
          err.message || err.detail || "Failed to fetch order"
        )
      }

      return await res.json()
    } catch (e: any) {
      return rejectWithValue(e.message)
    }
  }
)

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    currentOrder: null as any,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload
      })
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrder = action.payload
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default orderSlice.reducer
