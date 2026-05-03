import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { usePWAInstall } from '../../hooks/usePWAInstall'

export default function PWAInstallBanner() {
  const reduce = useReducedMotion()
  const { canInstall, install, dismiss } = usePWAInstall()
  const [hidden, setHidden] = useState(false)

  if (!canInstall || hidden) return null

  return (
    <motion.div
      initial={reduce ? false : { y: 40, opacity: 0 }}
      animate={reduce ? false : { y: 0, opacity: 1 }}
      className="pointer-events-auto fixed bottom-4 left-1/2 z-[400] w-[calc(100%-32px)] max-w-md -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0"
    >
      <div className="flex items-center gap-3 rounded-pill border border-border-green bg-warm-white/95 px-4 py-3 shadow-lg backdrop-blur-md">
        <span className="text-xl text-leaf" aria-hidden>
          🌿
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-main">Installer Green Diet</p>
          <p className="text-xs text-text-muted">Accès rapide depuis votre écran d’accueil.</p>
        </div>
        <button
          type="button"
          onClick={install}
          className="shrink-0 rounded-pill bg-deep px-4 py-2 font-dm text-xs font-medium uppercase tracking-wide text-white transition hover:bg-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
        >
          Installer l&apos;app
        </button>
        <button
          type="button"
          aria-label="Fermer la bannière d’installation"
          className="shrink-0 rounded-full p-1 text-text-muted hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
          onClick={() => {
            dismiss?.()
            setHidden(true)
          }}
        >
          ✕
        </button>
      </div>
    </motion.div>
  )
}
