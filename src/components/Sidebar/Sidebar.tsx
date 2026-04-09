import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Target,
  TrendingUp,
  User,
  Text,
  Group,
} from "lucide-react"
import { ActionIcon, Box, Flex, NavLink, Stack, Tooltip } from "@mantine/core"
import { useLocation, useNavigate } from "react-router-dom"
import { AppButton } from "../AppButton/AppButton"

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

const menuItems = [
  { icon: BookOpen, label: "Теория", path: "/" },
  { icon: Target, label: "Задачи", path: "/tasks" },
  { icon: TrendingUp, label: "Прогресс", path: "/progress" },
  { icon: User, label: "Профиль", path: "/profile" },
]

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Box
      component="aside"
      className="fixed left-0 top-16 bottom-0 z-40 border-r border-gray-200 bg-white transition-all duration-300"
      style={{ width: collapsed ? 64 : 190 }}
    >
      <Flex direction="column" h="100%">
        <Box p="xs" className="flex-1">
          <Stack gap={4}>
            {menuItems.map((item) => {
              const isActive =
                item.path === "/"
                  ? location.pathname === "/" ||
                    location.pathname.startsWith("/theory")
                  : item.path === "/tasks"
                    ? location.pathname === "/tasks" ||
                      location.pathname.startsWith("/course/")
                    : location.pathname.startsWith(item.path)

              const content = (
                <NavLink
                  key={item.label}
                  active={isActive}
                  label={collapsed ? undefined : item.label}
                  leftSection={<item.icon className="h-4 w-4" />}
                  onClick={() => {
                    navigate(item.path)
                  }}
                  className={
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }
                  px={collapsed ? "xs" : "sm"}
                  py="xs"
                />
              )

              if (collapsed) {
                return (
                  <Tooltip key={item.label} label={item.label} position="right">
                    {content}
                  </Tooltip>
                )
              }

              return content
            })}
          </Stack>
        </Box>

        <Stack className="p-2 border-t border-gray-200">
          <AppButton
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full justify-center text-gray-600"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span>Свернуть</span>
              </>
            )}
          </AppButton>
        </Stack>
      </Flex>
    </Box>
  )
}
