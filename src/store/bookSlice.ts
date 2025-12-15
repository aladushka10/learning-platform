import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { IBookCard } from "../types/types"

const BOOKMARKS_KEY = "app_bookmarks"
const CART_KEY = "app_cart"

const saveBookmarks = (bookmarks: IBookCard[]) => {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks))
  } catch (e) {
    console.warn("Failed to save bookmarks to localStorage:", e)
  }
}

const saveCart = (cart: IBookCard[]) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  } catch (e) {
    console.warn("Failed to save cart to localStorage:", e)
  }
}

export const hydrateFromLocalStorage = createAsyncThunk(
  "books/hydrateFromLocalStorage",
  async () => {
    const bookmarks: IBookCard[] = []
    const cart: IBookCard[] = []

    try {
      const savedBookmarks = localStorage.getItem(BOOKMARKS_KEY)
      if (savedBookmarks) {
        const parsed = JSON.parse(savedBookmarks)
        if (Array.isArray(parsed)) bookmarks.push(...parsed)
      }
    } catch (e) {
      console.warn("Failed to load bookmarks from localStorage:", e)
    }

    try {
      const savedCart = localStorage.getItem(CART_KEY)
      if (savedCart) {
        const parsed = JSON.parse(savedCart)
        if (Array.isArray(parsed)) cart.push(...parsed)
      }
    } catch (e) {
      console.warn("Failed to load cart from localStorage:", e)
    }

    return { bookmarks, cart }
  }
)

const bookSlice = createSlice({
  name: "books",
  initialState: {
    books: [] as IBookCard[],
    loading: false,
    error: null,
    selectedBook: null,
    bookmarks: [] as IBookCard[],
    cart: [] as IBookCard[],
  },
  reducers: {
    selectBook(state, action) {
      state.selectedBook = action.payload
    },
    clearBook(state) {
      state.selectedBook = null
    },
    fetchBookStart(state) {
      state.loading = true
      state.error = null
    },
    fetchBookSuccess(state, action) {
      state.loading = false
      state.books = action.payload
    },
    fetchBookFail(state, action) {
      state.loading = false
      state.error = action.payload
    },
    toggleBookmark: (state, action) => {
      const index = state.bookmarks.findIndex(
        (state: any) => state.isbn13 === action.payload.isbn13
      )

      if (index === -1) {
        state.bookmarks.push(action.payload)
      } else {
        state.bookmarks.splice(index, 1)
      }
      saveBookmarks(state.bookmarks)
    },
    toggleCart: (state, action) => {
      const index = state.cart.findIndex(
        (state: any) => state.isbn13 === action.payload.isbn13
      )

      if (index === -1) {
        state.cart.push(action.payload)
      } else {
        state.cart.splice(index, 1)
      }
      saveCart(state.cart)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateFromLocalStorage.fulfilled, (state, action) => {
      state.bookmarks = action.payload.bookmarks
      state.cart = action.payload.cart
    })
  },
})

export const {
  selectBook,
  clearBook,
  fetchBookFail,
  fetchBookStart,
  fetchBookSuccess,
  toggleBookmark,
  toggleCart,
} = bookSlice.actions
export const fetchBooksAction = () => {
  return { type: "books/fetchBooks" }
}

export default bookSlice.reducer
