import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logoSvg from '../../assets/logo.svg'

const SHEET_Z = 500
const OVERLAY_Z = 499

const navItems = [
  { to: '/', label: 'Accueil', Icon: HomeIcon },
  { to: '/produits', label: 'Produits', Icon: ShopIcon },
  { to: '/a-propos', label: 'À propos', Icon: InfoIcon },
  { to: '/contact', label: 'Contact', Icon: PhoneIcon },
]

function HomeIcon({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}
function ShopIcon({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 9h16l-1 10H5L4 9zM7 9V7a5 5 0 0110 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
function InfoIcon({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 11v7M12 8h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
function PhoneIcon({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6.5 3h4l2 6-2.5 1a12 12 0 006 6l1-2.5 6 2v4a2 2 0 01-2 2C9.9 21 3 14.1 3 6a2 2 0 012-2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}
function UserIcon({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 21c1.5-4 13.5-4 14 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
function ChevronRight({ className }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M10 7l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function MobileNav({ open, onClose }) {
  const reduce = useReducedMotion()
  const { user, isAuthenticated, logout, authLoading } = useAuth()
  const navigate = useNavigate()

  const accountPath = isAuthenticated ? '/compte' : '/connexion'

  const handleDragEnd = (_e, info) => {
    if (info.velocity.y > 400 || info.offset.y > 120) onClose()
  }

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : '?'

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            role="presentation"
            aria-hidden
            className="fixed inset-0 bg-black md:hidden"
            style={{ zIndex: OVERLAY_Z }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigation"
            className="fixed bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-[24px] bg-warm-white shadow-[0_-8px_40px_rgba(45,90,61,0.14)] md:hidden"
            style={{ zIndex: SHEET_Z, paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))' }}
            initial={reduce ? false : { y: '100%' }}
            animate={reduce ? false : { y: 0 }}
            exit={reduce ? false : { y: '100%' }}
            transition={reduce ? {} : { type: 'spring', stiffness: 320, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
          >
            <div className="mx-auto mb-5 mt-3 h-1 w-9 rounded-full bg-[rgba(74,124,89,0.2)]" aria-hidden />

            <div className="flex items-center justify-between px-5 pb-4">
              <div className="flex items-center gap-3">
                <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-[rgba(74,124,89,0.15)]">
                  <img src={logoSvg} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="font-cormorant text-[18px] text-text-main">Green Diet</span>
              </div>
              <button
                type="button"
                aria-label="Fermer le menu"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(26,26,20,0.06)] text-text-main transition hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
                onClick={onClose}
              >
                ✕
              </button>
            </div>

            <nav className="space-y-1 px-5" aria-label="Menu principal">
              {navItems.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex h-12 w-full items-center justify-between rounded-xl px-3 transition-colors duration-150 ${
                      isActive
                        ? 'bg-[rgba(74,124,89,0.1)] text-leaf [&_svg]:text-leaf'
                        : 'text-text-main active:bg-[rgba(74,124,89,0.06)] [&_svg]:text-leaf'
                    }`
                  }
                >
                  <span className="flex items-center gap-3">
                    <Icon className="shrink-0" />
                    <span className="font-dm text-[15px]">{label}</span>
                  </span>
                  <ChevronRight className="text-text-muted" />
                </NavLink>
              ))}
              <NavLink
                to={accountPath}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex h-12 w-full items-center justify-between rounded-xl px-3 transition-colors duration-150 ${
                    isActive
                      ? 'bg-[rgba(74,124,89,0.1)] text-leaf [&_svg]:text-leaf'
                      : 'text-text-main active:bg-[rgba(74,124,89,0.06)] [&_svg]:text-leaf'
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <UserIcon />
                  <span className="font-dm text-[15px]">Mon compte</span>
                </span>
                <ChevronRight className="text-text-muted" />
              </NavLink>
            </nav>

            <div className="mx-5 my-3 border-t border-[rgba(74,124,89,0.1)]" />

            <div className="space-y-3 px-5 pb-1">
              {!authLoading &&
                (!isAuthenticated ? (
                  <div className="flex gap-2.5">
                    <Link
                      to="/connexion"
                      onClick={onClose}
                      className="flex h-11 flex-1 items-center justify-center rounded-pill border border-leaf font-dm text-sm font-medium text-leaf transition hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
                    >
                      Se connecter
                    </Link>
                    <Link
                      to="/inscription"
                      onClick={onClose}
                      className="flex h-11 flex-1 items-center justify-center rounded-pill bg-deep font-dm text-sm font-medium text-white transition hover:bg-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
                    >
                      S&apos;inscrire
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-leaf font-dm text-xs font-semibold text-white">
                        {initials}
                      </span>
                      <span className="truncate font-dm text-sm text-text-main">
                        {user?.firstName} {user?.lastName}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 font-dm text-xs text-red-400 underline-offset-2 hover:underline"
                      onClick={async () => {
                        await logout()
                        onClose()
                        navigate('/')
                      }}
                    >
                      Se déconnecter
                    </button>
                  </div>
                ))}

              <p className="text-center font-dm text-xs text-text-muted">
                📍 Sfax, Tunisie · ☎{' '}
                <a href="tel:+21600000000" className="underline">
                  +216 00 000 000
                </a>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
