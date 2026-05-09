import { NavLink, Outlet } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

const nav = [
  { to: '/', label: 'Tableau de bord', icon: '📊' },
  { to: '/orders', label: 'Commandes', icon: '📦' },
  { to: '/products', label: 'Produits', icon: '🛍️' },
  { to: '/categories', label: 'Catégories', icon: '🏷️' },
  { to: '/analytics', label: 'Analytiques', icon: '📈' },
  { to: '/customers', label: 'Clients', icon: '👥' },
]

export default function AdminShell() {
  const { user, logout } = useAdminAuth()

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-[rgba(74,124,89,0.15)] bg-white md:flex">
        <div className="border-b border-[rgba(74,124,89,0.1)] px-5 py-6">
          <p className="text-xs font-medium uppercase tracking-wider text-[#6b7280]">Green Diet</p>
          <p className="mt-1 text-lg font-semibold text-[#2d5a3d]">Administration</p>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
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
        <div className="border-t border-[rgba(74,124,89,0.1)] p-4">
          <p className="truncate text-sm font-medium text-[#111827]">
            {user?.firstName} {user?.lastName}
          </p>
          <button type="button" className="mt-2 text-sm text-red-500 hover:underline" onClick={() => logout()}>
            Se déconnecter
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-[rgba(74,124,89,0.12)] bg-white px-4 py-3 md:hidden">
          <span className="font-semibold text-[#2d5a3d]">Green Diet Admin</span>
          <button type="button" className="text-sm text-red-500" onClick={() => logout()}>
            Déconnexion
          </button>
        </header>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
