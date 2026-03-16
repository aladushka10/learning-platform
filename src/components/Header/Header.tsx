import { IconSearch, IconTrophy } from "@tabler/icons-react"
import { Avatar, Button, Group, Text, TextInput } from "@mantine/core"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { signOut } from "../../store/signInSlice"
import { MTextInput } from "../MTextInput/MTextInput"
import { AppButton } from "../AppButton/AppButton"

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { auth, username, firstName, lastName } = useSelector(
    (state: any) => state.signIn,
  )

  const handleLogout = async () => {
    try {
      await (dispatch as any)(signOut()).unwrap()
    } catch {
      // ignore
    } finally {
      navigate("/sign-in", { replace: true })
    }
  }

  const displayName = firstName || username?.split("@")[0] || "User"

  return (
    <header className="sticky top-0 z-50 border-b border-white/15 bg-gradient-to-br from-[#2563eb] to-blue-400 ">
      <div className="flex items-center justify-between min-h-16 px-6">
        <div className="flex items-center gap-8">
          <p className="lp-logo block text-center text-4xl text-white [-webkit-text-stroke:2px_white]">
            LP
          </p>
        </div>

        <div className="hidden flex-1 max-w-xl md:block">
          <MTextInput
            value={searchQuery}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
            placeholder="Поиск задач, тем или концепций..."
            leftSection={<IconSearch size={16} className="text-slate-500" />}
            classNames={{
              input:
                "bg-white/95 border-white/40 text-slate-800 placeholder:text-slate-500",
            }}
          />
        </div>

        <Group gap="xs" className="w-144 h-12  px-2 py-2">
          {auth ? (
            <div className="flex items-center gap-2">
              <AppButton
                variant="subtle"
                size="sm"
                leftSection={
                  <IconTrophy size={16} className="text-amber-300" />
                }
                className="text-white hover:bg-white/15"
                onClick={() => navigate("/achievements")}
              >
                <span className="text-white text-base">Достижения</span>
              </AppButton>

              <AppButton
                variant="subtle"
                size="sm"
                className="text-white/95 hover:bg-white/15"
                onClick={() => navigate("/profile")}
                leftSection={
                  <Avatar size={24} radius="xl" color="white">
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>
                }
              >
                <span className="text-white text-base">{displayName}</span>
              </AppButton>

              <AppButton
                variant="outline"
                color="white"
                size="sm"
                className="bg-white/15 text-white hover:bg-white/25"
                onClick={handleLogout}
              >
                <span className="text-white text-base"> Sign Out</span>
              </AppButton>
            </div>
          ) : (
            <>
              <AppButton
                variant="outline"
                color="white"
                size="sm"
                className="text-white/95 hover:bg-white/15"
                onClick={() => navigate("/sign-in")}
              >
                <span className="text-white"> Sign In</span>
              </AppButton>
              <AppButton
                variant="outline"
                color="white"
                size="sm"
                className="bg-white/95 text-white border-white/20 hover:bg-white/25"
                onClick={() => navigate("/sign-up")}
              >
                <span className="text-white"> Sign Up</span>
              </AppButton>
            </>
          )}
        </Group>
      </div>
    </header>
  )
}
