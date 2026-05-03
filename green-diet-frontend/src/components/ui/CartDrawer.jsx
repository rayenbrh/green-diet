import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'

export default function CartDrawer() {
  const reduce = useReducedMotion()
  const isMobile = useIsMobile()
  const {
    drawerOpen,
    closeDrawer,
    items,
    updateQty,
    removeFromCart,
    totalItems,
    totalPrice,
  } = useCart()

  useLockBodyScroll(drawerOpen)

  const onOrder = () => {
    toast.success('Commande en cours de développement 🌿')
  }

  return (
    <AnimatePresence>
      {drawerOpen && (
        <Dialog open={drawerOpen} onClose={closeDrawer} className="relative z-[250]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
          >
            <DialogBackdrop className="fixed inset-0 bg-[rgba(26,26,20,0.6)] backdrop-blur-[4px]" />
          </motion.div>

          <div className="fixed inset-0 z-[251] flex justify-end">
            <DialogPanel
              as={motion.div}
              role="dialog"
              aria-label="Votre panier"
              initial={reduce ? false : { x: '100%' }}
              animate={reduce ? false : { x: 0 }}
              exit={reduce ? false : { x: '100%' }}
              transition={
                reduce ? { duration: 0 } : { type: 'spring', stiffness: 280, damping: 28 }
              }
              className={`flex h-full max-h-[100dvh] flex-col bg-warm-white shadow-[-8px_0_40px_rgba(74,124,89,0.12)] outline-none ${
                isMobile ? 'w-full' : 'w-[420px]'
              }`}
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-border-green px-5">
                <div>
                  <DialogTitle className="font-cormorant text-2xl text-text-main">Mon Panier</DialogTitle>
                  <p className="text-sm text-text-muted">({totalItems} articles)</p>
                </div>
                <button
                  type="button"
                  aria-label="Fermer le panier"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-text-muted transition hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
                  onClick={closeDrawer}
                >
                  ✕
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 px-8 py-20 text-center">
                    <span className="text-6xl" aria-hidden>
                      🛒
                    </span>
                    <p className="font-cormorant text-[22px] text-text-main">Votre panier est vide</p>
                    <p className="text-sm text-text-muted">Découvrez nos produits sans gluten bio.</p>
                    <Link
                      to="/produits"
                      onClick={closeDrawer}
                      className="mt-2 text-sm font-medium uppercase tracking-wide text-leaf underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
                    >
                      Voir les produits
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-border-green">
                    <AnimatePresence initial={false}>
                      {items.map((line) => (
                        <motion.li
                          key={line.product.id}
                          layout
                          initial={reduce ? false : { x: -20, opacity: 0 }}
                          animate={reduce ? false : { x: 0, opacity: 1 }}
                          exit={reduce ? false : { x: -20, opacity: 0, height: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                          className="flex gap-3 px-4 py-4"
                        >
                          <div
                            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-2xl"
                            style={{ backgroundColor: line.product.bgColor }}
                            aria-hidden
                          >
                            {line.product.emoji}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-cormorant text-base text-text-main">{line.product.name}</p>
                            <p className="text-xs text-text-muted">
                              {line.product.weight} · {line.product.tags[0]}
                            </p>
                            <p className="font-cormorant text-base font-medium text-deep">
                              {line.product.price} TND
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                type="button"
                                aria-label="Diminuer"
                                className="flex h-7 w-7 items-center justify-center rounded border border-leaf text-sm text-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
                                onClick={() => updateQty(line.product.id, line.quantity - 1)}
                              >
                                −
                              </button>
                              <span className="w-6 text-center font-cormorant text-lg">{line.quantity}</span>
                              <button
                                type="button"
                                aria-label="Augmenter"
                                className="flex h-7 w-7 items-center justify-center rounded border border-leaf text-sm text-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
                                onClick={() => updateQty(line.product.id, line.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              className="mt-1 text-[11px] text-red-400 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
                              onClick={() => removeFromCart(line.product.id)}
                            >
                              Supprimer
                            </button>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </div>

              <div className="shrink-0 space-y-3 border-t border-border-green bg-warm-white p-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Sous-total</span>
                  <span className="font-cormorant text-[22px] font-semibold text-deep">{totalPrice}</span>
                </div>
                <hr className="border-border-green" />
                <button
                  type="button"
                  className="flex h-12 w-full items-center justify-center rounded-pill bg-deep font-dm text-sm text-white transition hover:bg-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf/50"
                  onClick={onOrder}
                >
                  Passer la commande →
                </button>
                <p className="text-center text-xs text-text-muted">🔒 Livraison sécurisée à Sfax</p>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
