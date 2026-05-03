import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'

const links = [
  { to: '/produits', label: 'Produits' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/#sfax', label: 'Sfax' },
  { to: '/contact', label: 'Contact' },
]

export default function MobileNav({ open, onClose }) {
  const reduce = useReducedMotion()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Fermer le menu"
            className="fixed inset-0 z-[190] bg-black/20 backdrop-blur-[2px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menu mobile"
            className="fixed inset-y-0 right-0 z-[200] flex w-[min(100%,380px)] flex-col bg-warm-white shadow-2xl md:hidden"
            initial={reduce ? false : { x: '100%' }}
            animate={reduce ? false : { x: 0 }}
            exit={reduce ? false : { x: '100%' }}
            transition={{ duration: reduce ? 0 : 0.35, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav className="flex flex-1 flex-col gap-8 px-8 pb-10 pt-24">
              {links.map((l, i) => (
                <motion.div
                  key={l.to + (l.hash || '')}
                  initial={reduce ? false : { opacity: 0, y: 28 }}
                  animate={reduce ? false : { opacity: 1, y: 0 }}
                  transition={{ delay: reduce ? 0 : i * 0.06, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <Link
                    to={l.to}
                    className="block font-cormorant text-4xl text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
                    onClick={onClose}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="border-t border-border-green px-8 py-6 text-sm text-text-muted">
              <a
                href="https://www.instagram.com/green.diet.sfax"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-leaf underline"
              >
                Instagram
              </a>
              <p className="mt-2 text-xs uppercase tracking-wide">Sfax, Tunisie</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
