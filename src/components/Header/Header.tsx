import { Search, Bell, User } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback } from "../ui/avatar"
import style from "./Header.module.scss"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "../../store/signInSlice"

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { auth, username, firstName, lastName } = useSelector(
    (state: any) => state.signIn
  )

  const handleLogout = () => {
    dispatch(logout())
  }

  const displayName = firstName || username?.split("@")[0] || "User"

  return (
    <header
      className={`${style.header} sticky top-0 z-50 bg-white border-b border-gray-200`}
    >
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 hover:opacity-75 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white">π</span>
            </div>
            <span className="text-gray-900 font-semibold">LearnLab</span>
          </button>
        </div>

        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Поиск задач, тем или концепций..."
              className="pl-10 bg-gray-50 border-gray-200"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-8 w-px bg-gray-200" />

          {auth ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="gap-2"
                onClick={() => navigate("/profile")}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-700">{displayName}</span>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/sign-in")}
                className="text-gray-700 hover:text-gray-900"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/sign-up")}
                className="text-blue-600 hover:text-blue-700"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
