import { configureStore } from "@reduxjs/toolkit"
import themeSlice from "./themeSlice"
import counterSlice from "./counterSlice"
import activeSlice from "./activeSlice"
import paginationSlice from "./paginationSlice"
import popUpSlice from "./popUpSlice"
import signInSlice from "./signInSlice"
import signUpSlice from "./signUpSlice"
import searchSlice from "./searchSlice"
import userSlice from "./userSlice"
import orderSlice from "./orderSlice"
import solutionSlice from "./solutionSlice"
import progressSlice from "./progressSlice"
import { trackTaskOpenMiddleware } from "./middlewares/trackTaskOpenMiddleware"

export default configureStore({
  reducer: {
    themeInStoreConfiguration: themeSlice,
    counter: counterSlice,
    active: activeSlice,
    pagination: paginationSlice,
    popUp: popUpSlice,
    search: searchSlice,
    signIn: signInSlice,
    signUp: signUpSlice,
    user: userSlice,
    order: orderSlice,
    solution: solutionSlice,
    progress: progressSlice,
  },
  middleware(getDefaultMiddleware) {
    return getDefaultMiddleware().concat(trackTaskOpenMiddleware)
  },
})
