import type { ReactNode } from "react"
import { useState } from "react"
import { Header } from "../Header/Header"
import { Sidebar } from "../Sidebar/Sidebar"
import { Footer } from "../Footer/Footer"

export function AppLayout({
  children,
  aside,
  searchQuery,
  onSearchChange,
}: {
  children: ReactNode
  aside?: ReactNode
  searchQuery?: string
  onSearchChange?: (query: string) => void
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header searchQuery={searchQuery} onSearchChange={onSearchChange} />

      <div className="flex flex-1">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "ml-16" : "ml-36"
          }`}
        >
          <div className="flex gap-6 p-6 max-w-7xl mx-auto">
            <div className="flex-1">{children}</div>
            {aside ? aside : null}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
