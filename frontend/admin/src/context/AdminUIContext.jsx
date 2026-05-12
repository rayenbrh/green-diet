import { createContext, useCallback, useContext, useState } from 'react'

const AdminUIContext = createContext(null)

export function AdminUIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggleSidebar = useCallback(() => setSidebarOpen((p) => !p), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  return (
    <AdminUIContext.Provider value={{ sidebarOpen, setSidebarOpen, toggleSidebar, closeSidebar }}>
      {children}
    </AdminUIContext.Provider>
  )
}

export function useAdminUI() {
  const ctx = useContext(AdminUIContext)
  if (!ctx) throw new Error('useAdminUI doit être utilisé dans AdminUIProvider')
  return ctx
}
