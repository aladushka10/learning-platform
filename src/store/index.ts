import { configureStore } from "@reduxjs/toolkit"
import themeSlice from "./themeSlice"
import counterSlice from "./counterSlice"
import activeSlice from "./activeSlice"
import paginationSlice from "./paginationSlice"
import selectedBookSlice from "./selectedBookSlice"
import popUpSlice from "./popUpSlice"
import bookSlice from "./bookSlice"
import signInSlice from "./signInSlice"
import signUpSlice from "./signUpSlice"
import myBooksSlice from "./myBooksSlice"
import searchSlice from "./searchSlice"
import userSlice from "./userSlice"
import cartSlice from "./cartSlice"
import createBookSlice from "./createBookSlice"
import orderSlice from "./orderSlice"

export default configureStore({
  reducer: {
    themeInStoreConfiguration: themeSlice,
    counter: counterSlice,
    active: activeSlice,
    pagination: paginationSlice,
    selectedBook: selectedBookSlice,
    popUp: popUpSlice,
    books: bookSlice,
    search: searchSlice,
    signIn: signInSlice,
    signUp: signUpSlice,
    myBooks: myBooksSlice,
    user: userSlice,
    cart: cartSlice,
    createBook: createBookSlice,
    order: orderSlice,
  },
})
