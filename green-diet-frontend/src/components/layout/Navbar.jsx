import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import LogoMark from '../brand/LogoMark'
import MobileNav from './MobileNav'

const nav = [
  { to: '/produits', label: 'Produits' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/#sfax', label: 'Sfax' },
  { to: '/contact', label: 'Contact' },
]

function BagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 7h12v14H6zM9 7V5a3 3 0 0 1 6 0v2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Navbar() {
  const reduce = useReducedMotion()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { totalItems, openDrawer } = useCart()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => setMobileOpen(false))
    return () => cancelAnimationFrame(id)
  }, [location.pathname])

  return (
    <>
      <motion.header
        initial={reduce ? false : { y: -60, opacity: 0 }}
        animate={reduce ? false : { y: 0, opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.1, ease: 'easeOut' }}
        className={`fixed left-0 right-0 top-0 z-[120] h-14 border-b border-[rgba(74,124,89,0.12)] bg-[rgba(253,252,248,0.88)] backdrop-blur-[16px] transition-shadow duration-300 md:h-16 ${
          scrolled ? 'shadow-[0_2px_20px_rgba(74,124,89,0.08)]' : 'shadow-none'
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between px-4 md:px-8 lg:px-12">
          <NavLink
            to="/"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
            aria-label="Green Diet accueil"
          >
            <LogoMark />
          </NavLink>

          <nav className="hidden items-center gap-10 md:flex" aria-label="Navigation principale">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative font-dm text-[13px] uppercase tracking-[0.06em] transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-leaf after:transition-transform after:duration-200 hover:text-leaf ${
                    isActive ? 'text-leaf after:scale-x-100' : 'text-text-muted'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Ouvrir le panier"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-text-main transition hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
              onClick={openDrawer}
            >
              <BagIcon />
              <AnimatePresence mode="popLayout">
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-text-main"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button
              type="button"
              onClick={openDrawer}
              className="hidden rounded-pill bg-deep px-5 py-2 font-dm text-sm text-white transition hover:bg-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50 md:inline-flex"
            >
              Commander
            </button>

            <button
              type="button"
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span
                className={`block h-0.5 w-6 origin-center rounded bg-text-main transition ${
                  mobileOpen ? 'translate-y-2 rotate-45' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-6 rounded bg-text-main transition ${mobileOpen ? 'opacity-0' : ''}`}
              />
              <span
                className={`block h-0.5 w-6 origin-center rounded bg-text-main transition ${
                  mobileOpen ? '-translate-y-2 -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </motion.header>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
