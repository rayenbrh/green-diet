import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useCart } from '../../hooks/useCart'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import Badge from './Badge'

function Stars({ rating }) {
  const full = Math.round(rating)
  return (
    <span className="text-gold" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (i < full ? '★' : '☆')).join('')}
    </span>
  )
}

export default function ProductModal({ product, open, onClose, onFinalize }) {
  const reduce = useReducedMotion()
  const isMobile = useIsMobile()
  const { addToCart, items, updateQty } = useCart()
  const [step, setStep] = useState('idle')
  const closeBtnRef = useRef(null)

  const qty = useMemo(() => {
    if (!product) return 0
    const row = items.find((i) => i.product.id === product.id)
    return row?.quantity ?? 0
  }, [items, product])

  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => setStep('idle'))
    return () => cancelAnimationFrame(id)
  }, [open, product?.id])

  useEffect(() => {
    if (step !== 'added') return
    const t = window.setTimeout(() => setStep('finalize'), 700)
    return () => window.clearTimeout(t)
  }, [step])

  if (!product) return null

  const categoryLabel = {
    pates: 'Pâtes',
    pains: 'Pains & Brioches',
    farines: 'Farines',
    biscuits: 'Biscuits',
    epicerie: 'Épicerie',
  }[product.category]

  const handleAdd = () => {
    if (step !== 'idle') return
    addToCart(product, { silentToast: true })
    setStep('added')
    toast.success('✓ Ajouté au panier !')
  }

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: product.desc, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Lien copié dans le presse-papiers')
      }
    } catch {
      toast.error('Partage indisponible', {
        style: { border: '0.5px solid rgba(220,60,60,0.2)' },
      })
    }
  }

  const innerMotion = isMobile
    ? {
        initial: reduce ? false : { y: '100%' },
        animate: reduce ? false : { y: 0 },
        exit: reduce ? false : { y: '100%' },
        transition: reduce
          ? { duration: 0 }
          : { type: 'spring', stiffness: 260, damping: 28 },
      }
    : {
        initial: reduce ? false : { scale: 0.88, opacity: 0, y: 20 },
        animate: reduce ? false : { scale: 1, opacity: 1, y: 0 },
        exit: reduce ? false : { scale: 0.88, opacity: 0, y: 16 },
        transition: reduce
          ? { duration: 0 }
          : { type: 'spring', stiffness: 280, damping: 22 },
      }

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onClose={onClose} className="relative z-[300]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
          >
            <DialogBackdrop className="fixed inset-0 bg-[rgba(26,26,20,0.6)] backdrop-blur-[4px]" />
          </motion.div>

          <div
            className={`fixed inset-0 z-[301] flex ${isMobile ? 'items-stretch' : 'items-center justify-center p-6'}`}
          >
            <div className={`relative ${isMobile ? 'h-full w-full' : 'flex w-full max-w-[580px] justify-center'}`}>
              <DialogPanel
                className={`flex w-full flex-col overflow-hidden bg-warm-white shadow-2xl outline-none focus:outline-none md:max-h-[90vh] md:rounded-modal ${
                  isMobile ? 'h-full max-h-[100dvh] rounded-none' : 'max-h-[90vh]'
                }`}
              >
                <motion.div
                  className="flex h-full max-h-[inherit] flex-col"
                  {...innerMotion}
                >
                  {isMobile && (
                    <div className="flex h-14 shrink-0 items-center border-b border-border-green px-3">
                      <button
                        ref={closeBtnRef}
                        type="button"
                        aria-label="Fermer"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
                        onClick={onClose}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path
                            d="M15 18L9 12l6-6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <DialogTitle className="mx-2 flex-1 truncate text-center font-cormorant text-lg text-text-main">
                        {product.name}
                      </DialogTitle>
                      <button
                        type="button"
                        aria-label="Partager le produit"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
                        onClick={share}
                      >
                        <span aria-hidden>↗</span>
                      </button>
                    </div>
                  )}

                  <div
                    className="relative h-[220px] shrink-0 md:h-[240px]"
                    style={{
                      background: `radial-gradient(circle at 50% 40%, rgba(255,255,255,0.55), transparent 55%), ${product.bgColor}`,
                    }}
                  >
                    {!isMobile && (
                      <button
                        type="button"
                        aria-label="Fermer la fenêtre"
                        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(26,26,20,0.08)] text-base text-text-main transition hover:scale-105 hover:bg-[rgba(26,26,20,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
                        onClick={onClose}
                      >
                        ✕
                      </button>
                    )}
                    {product.isNew && (
                      <div className="absolute left-4 top-4 z-[2]">
                        <Badge>Nouveau</Badge>
                      </div>
                    )}
                    {!product.isNew && product.isBestSeller && (
                      <div className="absolute left-4 top-4 z-[2]">
                        <Badge variant="gold">⭐ Best-seller</Badge>
                      </div>
                    )}
                    <div className="flex h-full items-center justify-center">
                      <motion.div
                        initial={reduce ? false : { scale: 0.5 }}
                        animate={reduce ? false : { scale: 1 }}
                        transition={
                          reduce ? {} : { type: 'spring', stiffness: 260, damping: 18 }
                        }
                        className="text-[88px] leading-none"
                      >
                        {product.emoji}
                      </motion.div>
                    </div>
                  </div>

                  <div
                    className={`flex min-h-0 flex-1 flex-col ${isMobile ? 'overflow-y-auto [-webkit-overflow-scrolling:touch]' : 'overflow-y-auto'}`}
                  >
                    <div className="space-y-4 px-6 py-6 md:px-7 md:py-7">
                      <p className="text-[10px] font-dm uppercase tracking-[0.18em] text-leaf">
                        {categoryLabel}
                      </p>
                      {!isMobile && (
                        <DialogTitle className="font-cormorant text-[34px] font-light leading-tight text-text-main">
                          {product.name}
                        </DialogTitle>
                      )}
                      <div className="flex items-center gap-2 text-sm text-text-muted">
                        <Stars rating={product.rating} />
                        <span>({product.reviews} avis)</span>
                      </div>
                      <p className="font-dm text-sm font-light leading-relaxed text-text-muted">
                        {product.descLong}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((t, i) => (
                          <motion.span
                            key={t}
                            initial={reduce ? false : { scale: 0 }}
                            animate={reduce ? false : { scale: 1 }}
                            transition={{
                              delay: reduce ? 0 : i * 0.04,
                              type: 'spring',
                              stiffness: 300,
                              damping: 20,
                            }}
                            className="rounded-pill border-[0.5px] border-[rgba(74,124,89,0.2)] bg-[rgba(74,124,89,0.07)] px-3 py-1 text-[11px] text-leaf"
                          >
                            {t}
                          </motion.span>
                        ))}
                      </div>
                      <hr className="border-[0.5px] border-[rgba(74,124,89,0.12)]" />

                      {!isMobile && (
                        <div className="flex flex-col gap-4 pt-2 md:flex-row md:items-end md:gap-6">
                          <div className="shrink-0">
                            <p className="text-[11px] font-dm uppercase tracking-wide text-text-muted">Prix</p>
                            <p className="font-cormorant text-3xl font-semibold text-deep">
                              {product.price}{' '}
                              <span className="text-sm font-dm font-normal text-text-muted">TND</span>
                            </p>
                          </div>
                          <div className="min-w-0 flex-1 space-y-3">
                            {qty > 0 && (
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  type="button"
                                  aria-label="Diminuer la quantité"
                                  className="flex h-7 w-7 items-center justify-center rounded border border-leaf text-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
                                  onClick={() => updateQty(product.id, qty - 1)}
                                >
                                  −
                                </button>
                                <span className="min-w-[2ch] text-center font-cormorant text-lg">{qty}</span>
                                <button
                                  type="button"
                                  aria-label="Augmenter la quantité"
                                  className="flex h-7 w-7 items-center justify-center rounded border border-leaf text-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
                                  onClick={() => updateQty(product.id, qty + 1)}
                                >
                                  +
                                </button>
                              </div>
                            )}
                            <ModalActions
                              step={step}
                              reduce={reduce}
                              onAdd={handleAdd}
                              onFinalize={() => {
                                onClose()
                                onFinalize?.()
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {isMobile && (
                    <div
                      className="shrink-0 border-t border-border-green bg-warm-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4"
                      style={{ minHeight: '80px' }}
                    >
                      {qty > 0 && (
                        <div className="mb-3 flex items-center justify-center gap-3">
                          <button
                            type="button"
                            aria-label="Diminuer la quantité"
                            className="flex h-7 w-7 items-center justify-center rounded border border-leaf text-leaf"
                            onClick={() => updateQty(product.id, qty - 1)}
                          >
                            −
                          </button>
                          <span className="font-cormorant text-lg">{qty}</span>
                          <button
                            type="button"
                            aria-label="Augmenter la quantité"
                            className="flex h-7 w-7 items-center justify-center rounded border border-leaf text-leaf"
                            onClick={() => updateQty(product.id, qty + 1)}
                          >
                            +
                          </button>
                        </div>
                      )}
                      <div className="mb-3 text-center">
                        <p className="text-[11px] uppercase text-text-muted">Prix</p>
                        <p className="font-cormorant text-2xl font-semibold text-deep">{product.price} TND</p>
                      </div>
                      <ModalActions
                        step={step}
                        reduce={reduce}
                        onAdd={handleAdd}
                        onFinalize={() => {
                          onClose()
                          onFinalize?.()
                        }}
                      />
                    </div>
                  )}
                </motion.div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

function ModalActions({ step, reduce, onAdd, onFinalize }) {
  return (
    <div className="relative min-h-[52px] w-full">
      <AnimatePresence mode="wait">
        {step !== 'finalize' ? (
          <motion.button
            key="add"
            type="button"
            layout
            initial={false}
            exit={reduce ? {} : { y: -20, opacity: 0, transition: { duration: 0.2 } }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-pill font-dm text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50 disabled:cursor-default"
            style={{
              backgroundColor: step === 'added' ? '#4A7C59' : '#2D5A3D',
            }}
            whileHover={reduce || step === 'added' ? {} : { y: -1, filter: 'brightness(1.05)' }}
            whileTap={reduce ? {} : { scale: 0.97 }}
            onClick={onAdd}
            disabled={step === 'added'}
          >
            {step === 'added' ? (
              <span className="flex items-center gap-2">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  className="text-lg"
                  aria-hidden
                >
                  ✓
                </motion.span>
                Ajouté !
              </span>
            ) : (
              <>Ajouter au panier 🛒</>
            )}
          </motion.button>
        ) : (
          <motion.button
            key="fin"
            type="button"
            initial={reduce ? false : { y: 20, opacity: 0 }}
            animate={reduce ? false : { y: 0, opacity: 1 }}
            exit={reduce ? false : { y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="flex h-12 w-full items-center justify-center rounded-pill bg-gold font-dm text-sm font-medium text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
            whileHover={reduce ? {} : { y: -1 }}
            whileTap={reduce ? {} : { scale: 0.97 }}
            onClick={onFinalize}
          >
            Finaliser la commande →
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
