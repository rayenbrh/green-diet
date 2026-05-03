import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

const STORAGE_KEY = 'green-diet-cart-v1'

const CartContext = createContext(null)

function formatTnd(value) {
  return `${value.toFixed(3)} TND`
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x) =>
        x &&
        typeof x.quantity === 'number' &&
        x.product &&
        typeof x.product.id === 'string',
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [hydrated, setHydrated] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      setItems(loadFromStorage())
      setHydrated(true)
    })
    return () => cancelAnimationFrame(t)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const addToCart = useCallback((product, opts = {}) => {
    const { silentToast = false } = opts
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id)
      if (idx === -1) return [...prev, { product, quantity: 1 }]
      const next = [...prev]
      next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 }
      return next
    })
    if (!silentToast) toast.success('✓ Ajouté au panier !')
  }, [])

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const updateQty = useCallback((productId, qty) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId))
      return
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: qty } : i,
      ),
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const toggleDrawer = useCallback(() => setDrawerOpen((o) => !o), [])

  const totalItems = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items],
  )

  const totalPriceNum = useMemo(
    () => items.reduce((s, i) => s + i.product.priceNum * i.quantity, 0),
    [items],
  )

  const totalPrice = useMemo(() => formatTnd(totalPriceNum), [totalPriceNum])

  const isInCart = useCallback(
    (productId) => items.some((i) => i.product.id === productId),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      hydrated,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      totalItems,
      totalPrice,
      totalPriceNum,
      isInCart,
      drawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    }),
    [
      items,
      hydrated,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      totalItems,
      totalPrice,
      totalPriceNum,
      isInCart,
      drawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export { CartContext }
