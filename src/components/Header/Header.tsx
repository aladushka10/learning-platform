import { Search, Bell, User } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback } from "../ui/avatar"
import style from "./Header.module.scss"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "../../store/signInSlice"

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const dispatch = useDispatch()
  const { auth, username } = useSelector((state: any) => state.signIn)

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <header
      className={`${style.header} sticky top-0 z-50 bg-white border-b border-gray-200`}
    >
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white">π</span>
            </div>
            <span className="text-gray-900">LearnLab</span>
          </div>
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
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500">
              3
            </Badge>
          </Button>

          <div className="h-8 w-px bg-gray-200" />

          {auth ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-700">{username || "User"}</span>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/sign-in" className="text-gray-700 hover:text-gray-900">
                Sign In
              </Link>
              <Link to="/sign-up" className="text-blue-600">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
