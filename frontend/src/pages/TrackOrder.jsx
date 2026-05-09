import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Footer from '../components/layout/Footer'
import PageTransition from '../components/ui/PageTransition'
import { BRAND_LOGO_SRC } from '../constants/brand'
import * as ordersApi from '../services/orders.service'

const STEPS = [
  { key: 'pending', label: 'En attente' },
  { key: 'confirmed', label: 'Confirmée' },
  { key: 'preparing', label: 'En préparation' },
  { key: 'out_for_delivery', label: 'En livraison' },
  { key: 'delivered', label: 'Livrée' },
]

export default function TrackOrder() {
  const { orderNumber: paramNum } = useParams()
  const [q, setQ] = useState(paramNum || '')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    if (paramNum) {
      setQ(paramNum)
      search(paramNum)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount + param only
  }, [paramNum])

  const search = async (num = q) => {
    const n = (num || '').trim()
    if (!n) return
    setLoading(true)
    setErr(false)
    setOrder(null)
    try {
      const data = await ordersApi.trackOrder(n)
      setOrder(data)
    } catch {
      setErr(true)
    } finally {
      setLoading(false)
    }
  }

  const currentIdx =
    order && order.status !== 'cancelled' ? STEPS.findIndex((s) => s.key === order.status) : -1

  return (
    <PageTransition>
      <main id="contenu-principal" className="min-h-[100dvh] bg-cream pb-24 pt-24 md:pt-28">
        <div className="mx-auto max-w-[720px] px-6">
          <div className="flex flex-col items-center">
            <img src={BRAND_LOGO_SRC} alt="Green Diet" className="h-16 w-16 rounded-full object-cover" width={64} height={64} />
            <h1 className="mt-6 font-cormorant text-[32px] text-deep">Suivi de commande</h1>
          </div>

          <form
            className="mt-8 flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              search()
            }}
          >
            <input
              className="flex-1 rounded-pill border border-border-green bg-warm-white px-4 py-3 font-dm text-sm"
              placeholder="Numéro (ex. GD-2026-0001)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-pill bg-deep px-6 py-3 font-dm text-sm text-white disabled:opacity-50"
            >
              {loading ? '…' : 'Rechercher'}
            </button>
          </form>

          {err && (
            <p className="mt-8 text-center text-text-muted">
              Commande introuvable. Vérifiez le numéro et réessayez.
            </p>
          )}

          {order && (
            <div className="mt-10 space-y-8 rounded-card border border-border-green bg-warm-white p-6">
              <div className="text-center">
                <span className="inline-block rounded-pill bg-gold px-4 py-1 font-dm text-sm font-medium">
                  {order.orderNumber}
                </span>
                <p className="mt-3 font-dm text-deep">
                  {order.customer?.fullName}
                  <span className="text-text-muted"> · {order.customer?.maskedPhone}</span>
                </p>
                <p className="text-xs text-text-muted">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </p>
              </div>

              {order.status === 'cancelled' ? (
                <div className="rounded-card border border-red-200 bg-red-50 p-4 text-center font-dm text-red-700">
                  Commande annulée
                </div>
              ) : (
                <>
                  <div className="hidden md:block">
                    <ol className="flex items-start justify-between gap-1">
                      {STEPS.map((s, i) => {
                        const past = currentIdx > i
                        const cur = currentIdx === i
                        return (
                          <li key={s.key} className="flex flex-1 flex-col items-center text-center">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-dm text-xs ${
                                cur
                                  ? 'border-leaf bg-leaf text-white'
                                  : past
                                    ? 'border-leaf bg-warm-white text-leaf'
                                    : 'border-border-green text-text-muted'
                              }`}
                            >
                              {past ? '✓' : i + 1}
                            </div>
                            <p className={`mt-2 text-[11px] ${cur || past ? 'text-deep' : 'text-text-muted'}`}>
                              {s.label}
                            </p>
                          </li>
                        )
                      })}
                    </ol>
                  </div>
                  <ol className="space-y-3 md:hidden">
                    {STEPS.map((s, i) => {
                      const past = currentIdx > i
                      const cur = currentIdx === i
                      return (
                        <li key={s.key} className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                              cur
                                ? 'border-leaf bg-leaf text-white'
                                : past
                                  ? 'border-leaf text-leaf'
                                  : 'border-border-green text-text-muted'
                            }`}
                          >
                            {past ? '✓' : i + 1}
                          </div>
                          <span className={`font-dm text-sm ${cur || past ? 'text-deep' : 'text-text-muted'}`}>
                            {s.label}
                          </span>
                        </li>
                      )
                    })}
                  </ol>
                </>
              )}

              <div>
                <h2 className="font-dm text-sm font-medium text-deep">Articles</h2>
                <ul className="mt-2 space-y-1 text-sm">
                  {(order.items || []).map((it, i) => (
                    <li key={i} className="flex justify-between border-b border-border-green py-2 last:border-0">
                      <span>
                        {it.productEmoji} {it.productName} ×{it.quantity}
                      </span>
                      <span>
                        {(Number(it.price) * it.quantity).toFixed(3)} TND
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-between font-cormorant text-xl text-deep">
                  <span>Total</span>
                  <span>{Number(order.total).toFixed(3)} TND</span>
                </div>
              </div>

              <Link to="/" className="block text-center text-sm text-leaf underline">
                Retour à l’accueil
              </Link>
            </div>
          )}
        </div>
        <Footer />
      </main>
    </PageTransition>
  )
}
