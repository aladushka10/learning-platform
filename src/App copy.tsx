import { Navigate, Route, Routes } from "react-router-dom"
import "./App.css"
import "./scss/_fonts.scss"
import Home from "./Pages/Home/Home"
import NotFound from "./Pages/NotFound/NotFound"
import Layout from "./Pages/Layout/Layout"
import SignIn from "./Pages/SignIn/SignIn"
import SignUp from "./Pages/SignUp/SignUp"
import Success from "./Pages/Success/Success"
import AllBooks from "./Pages/AllBooks/AllBooks"
import SelectedBook from "./Pages/SelectedBook/SelectedBook"
import SearchPage from "./Pages/SearchPage/SearchPage"
import Bookmarks from "./Pages/Bookmarks/Bookmarks"
import CartPage from "./Pages/CartPage/CartPage"
import ResetPassword from "./Pages/ResetPassword/ResetPassword"
import NewPassword from "./Pages/NewPassword/NewPassword"
import ProtectedRoute from "./Pages/ProtectedRoute/ProtectedRoute"
import CreateBook from "./Pages/CreateBook/CreateBook"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { hydrateFromLocalStorage } from "./store/bookSlice"
import Checkout from "./Pages/Checkout/Checkout"
import { fetchCart } from "./store/cartSlice"
import { AsyncThunkAction, AsyncThunkConfig } from "@reduxjs/toolkit"
import { IBookCard } from "./types/types"
import { isAdmin } from "./utils/isAdmin"
import Payment from "./Pages/Payment/Payment"

const App = () => {
  const dispatch = useDispatch()
  const { auth } = useSelector((state: any) => state.signIn)
  const { username } = useSelector((state: any) => state.signIn)

  useEffect(() => {
    if (auth && !isAdmin(username)) {
      dispatch(fetchCart())
    }
  }, [auth, dispatch])

  useEffect(() => {
    dispatch(hydrateFromLocalStorage())
  }, [dispatch])

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<AllBooks />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/books/:isbn13" element={<SelectedBook />} />
          <Route path="/:isbn13" element={<SelectedBook />} />
          <Route path="about" element={<Navigate to={"/about-us"} />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/payment/:orderId" element={<Payment />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route path="/create-book" element={<CreateBook />} />
          <Route path="activate/:uid/:token" element={<Success />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/new-password" element={<NewPassword />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
function dispatch(
  arg0: AsyncThunkAction<
    { bookmarks: IBookCard[]; cart: IBookCard[] },
    void,
    AsyncThunkConfig
  >
) {
  throw new Error("Function not implemented.")
}
