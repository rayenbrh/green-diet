import { AnimatePresence, motion } from 'framer-motion'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AdminUIProvider, useAdminUI } from '../context/AdminUIContext'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useMediaQuery } from '../hooks/useMediaQuery'

const nav = [
  { to: '/', label: 'Tableau de bord', icon: '📊', end: true },
  { to: '/orders', label: 'Commandes', icon: '📦' },
  { to: '/products', label: 'Produits', icon: '🛍️' },
  { to: '/categories', label: 'Catégories', icon: '🏷️' },
  { to: '/analytics', label: 'Analytiques', icon: '📈' },
  { to: '/customers', label: 'Clients', icon: '👥' },
]

const TITLES = {
  '/': 'Tableau de bord',
  '/orders': 'Commandes',
  '/products': 'Produits',
  '/categories': 'Catégories',
  '/analytics': 'Analytiques',
  '/customers': 'Clients',
}

function SidebarContent({ isMobile }) {
  const { closeSidebar } = useAdminUI()
  const { user, logout } = useAdminAuth()
  const navigate = useNavigate()

  return (
    <>
      <div className="flex items-center justify-between border-b border-[rgba(74,124,89,0.12)] px-5 py-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6b7280]">Green Diet</p>
          <p className="mt-0.5 text-lg font-semibold text-[#2d5a3d]">Administration</p>
        </div>
        {isMobile && (
          <button
            type="button"
            className="border-0 bg-transparent text-lg leading-none text-[#9ca3af]"
            onClick={closeSidebar}
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => isMobile && closeSidebar()}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'border-l-[3px] border-l-[#4a7c59] bg-[rgba(74,124,89,0.08)] text-[#4a7c59]'
                  : 'border-l-[3px] border-l-transparent text-[#374151] hover:bg-[#f4f6f3]'
              }`
            }
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-[rgba(74,124,89,0.12)] p-4">
        <p className="truncate text-sm font-medium text-[#111827]">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="truncate text-xs text-[#9ca3af]">{user?.email}</p>
        <button
          type="button"
          className="mt-2 text-sm text-[#4a7c59] underline"
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          Se déconnecter
        </button>
      </div>
    </>
  )
}

function AdminSidebar() {
  const { sidebarOpen, closeSidebar } = useAdminUI()
  const isMobile = useMediaQuery('(max-width: 767px)')

  if (isMobile) {
    return (
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[79] bg-black/60"
              onClick={closeSidebar}
            />
            <motion.aside
              key="sidebar"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 z-[80] flex h-dvh w-[240px] flex-col overflow-y-auto border-r border-[rgba(74,124,89,0.15)] bg-white shadow-lg"
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <aside className="fixed left-0 top-[57px] z-[60] hidden h-[calc(100dvh-57px)] w-[240px] shrink-0 flex-col overflow-y-auto border-r border-[rgba(74,124,89,0.15)] bg-white md:flex">
      <SidebarContent isMobile={false} />
    </aside>
  )
}

function AdminTopbar() {
  const { pathname } = useLocation()
  const { toggleSidebar, sidebarOpen } = useAdminUI()
  const isMobile = useMediaQuery('(max-width: 767px)')

  let title = TITLES[pathname] || 'Admin'
  if (pathname.includes('/products/') && pathname !== '/products') {
    title = pathname.endsWith('/new') ? 'Nouveau produit' : 'Modifier le produit'
  }
  if (pathname.includes('/orders/') && pathname !== '/orders') title = 'Détail commande'
  if (pathname.includes('/customers/') && pathname !== '/customers') title = 'Client'

  const shopHref = typeof window !== 'undefined' ? `${window.location.origin}/` : '/'

  return (
    <header className="fixed left-0 right-0 top-0 z-[70] flex h-[57px] items-center justify-between border-b border-[rgba(74,124,89,0.12)] bg-white/95 px-4 backdrop-blur md:pl-[264px]">
      <div className="flex min-w-0 items-center gap-3">
        {isMobile && (
          <button
            type="button"
            aria-label="Menu"
            className="flex flex-col gap-1.5 border-0 bg-transparent p-1"
            onClick={toggleSidebar}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block h-0.5 w-5 origin-center rounded-sm bg-[#4a7c59] transition"
                style={{
                  transform:
                    sidebarOpen && i === 0
                      ? 'rotate(45deg) translateY(6px)'
                      : sidebarOpen && i === 2
                        ? 'rotate(-45deg) translateY(-6px)'
                        : sidebarOpen && i === 1
                          ? 'scaleX(0)'
                          : undefined,
                  opacity: sidebarOpen && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </button>
        )}
        <span className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-[#374151]">
          {title}
        </span>
      </div>
      <a
        href={shopHref}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4a7c59] no-underline hover:underline"
      >
        Voir la boutique ↗
      </a>
    </header>
  )
}

function AdminLayoutInner() {
  return (
    <div className="min-h-dvh bg-[#f4f6f3]">
      <AdminTopbar />
      <AdminSidebar />
      <main className="admin-main min-h-[calc(100dvh-57px)] overflow-x-hidden bg-[#f4f6f3] px-4 pb-24 pt-[73px] md:px-8 md:pb-8">
        <Outlet />
      </main>
    </div>
  )
}

export default function AdminShell() {
  return (
    <AdminUIProvider>
      <AdminLayoutInner />
    </AdminUIProvider>
  )
}
